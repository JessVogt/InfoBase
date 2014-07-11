var phantom = require('phantom'),
fs = require('fs'),
Q = require('q'),
sys = require('sys');


phantom.create(function(ph){


var echoConsole =  function(msg){
  console.log('page: '+msg);
},
my_exit = function(){
  console.log("All done! All of this took: "+ (new Date().getTime()-START_TIME)+"ms"); 
  ph.exit(); 
  exit(); 
},
START_TIME = new Date().getTime();

getIndex('eng').then(function() { return getIndex('fra');}).then(my_exit); //Will resolve the promise the next line waits for (this pattern is repeated)

//Saves the landing and index pages based on the language passed in as a parameter
function getIndex(lang){
  console.log((new Date().getTime()-START_TIME)+","+lang+", getIndex ("+lang+")");


  var get_departments = Q.defer();
  var get_landing = Q.defer();
  var get_list = Q.defer();


  ph.createPage(function(page){



  page.onConsoleMessage(echoConsole);
  page.open('http://localhost:8080/InfoBase/index-'+lang+'.html#search',function(){

  var htmldump;

  // Poll to see when the page is ready to grab the departments
  // grab a list of all the departments to be used later when looping
  waitFor_prom(
      function(){ 
        var ret = Q.defer();
        page.evaluate(function(){
          console.log("checking for depts");
          return $('.typeahead').length > 0; //Everything should be loaded at this point
        },function(data){
          console.log("data: "+data);
          ret.resolve(data); //This data is what waitFor_prom really uses
        });
        return ret.promise;
      },10000)
      .then( function(){
        var quick_eval = Q.defer();

        page.evaluate(function(){
            return _.keys(_.omit(window.depts,'ZGOC'));
        }, function(data){
          if (lang == 'eng') //On french iteration the departments are already set
          all_depts=data;
          quick_eval.resolve();
        });
        quick_eval.promise.then(function(){
          console.log(all_depts.length);
          get_departments.resolve();
        });
        
      });

  get_departments.promise.then(function(){
  console.log("in get_landing: intro");
  var make_landing = Q.defer(); // for page.eval

  //Two timeout functions to save the original landing page, and the page with the list of departments.
  //The first function is called after 250ms and saves the landing page.  It also simulates a click on a button to load the list page.
  //The second function is called after 500ms and saves the list page.
  //Save the landing page
  page.evaluate(function(lang) {
		console.log("in get_landing: inside page");
    //Clones the page, removes unneeded elements and fixes a few of the links
		var clone = $('html').clone();
	  clone.find('script').remove();
		clone.find('noscript').remove();
	  clone.find('base').remove();
    clone.find('.twitter-typeahead').remove();
		clone.find("a.dept_sel").attr("href", "nojsindex-" + lang + ".html");
		clone.find("#gcwu-gcnb-lang a").attr("href", "nojslanding-" + (lang == "eng" ? "fra" : "eng") + ".html");
  	clone.find("a.dept_sel:first").remove();

		var body = clone[0].outerHTML;

		//Gets to the list page and sorts it alphabetically by clicking buttons on the page (as a user would)
		$("a.dept_sel:first").trigger("click");
		$(".sort_buttons li:first").next().children("a").trigger("click");
		return body;
	}, function(data){
    console.log("in get_landing: resolving page eval");
    htmldump = data;
    make_landing.resolve();
  },lang);

  make_landing.promise.then(function(){
    console.log("in get_landing: resolved everything");
    //Removes extra script tags
    htmldump = htmldump.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gm, "");
    console.log("in get_landing: writing to file: nojslanding"+lang+".html, file length: "+htmldump.length);
    //fs.writeFile is also async (what isn't?)
    fs.writeFile("nojslanding-" + lang + ".html", htmldump, function(){
      console.log("in get_landing: finished writing file");
    });
    get_landing.resolve();
  });

  });//get_landing

  get_landing.promise.then(function() {
    console.log("in get_list: intro");

    var make_list = Q.defer(); //for the async eval

    page.evaluate(function(lang) {
      console.log("in get_list: in page");
  	  //Cleans unneeded visual effects out of the list and page
  	  $(".ui-li.ui-li-divider").remove();
  	  $("a.dept_sel_cancel").remove();
  	  $("ul.list-view").removeClass("list-view");
  	  $("li.ui-li").removeClass("ui-li ui-li-divider ui-bar-b ui-first-child");
  	  $("div.ui-btn-text").removeClass("ui-btn-text");
  	  $("div.ui-li").removeClass("ui-btn-inner ui-li");
  	  $("li.ui-btn").removeClass("ui-btn ui-btn-icon-right ui-li-has-arrow ui-btn-up-c");
  	  $("span").removeClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
  	  $(".button").remove();
  	  $("div .ui-input-search").remove();


  	  var links = $(".org_select");
  	  links.each(function() {
  		//For each link, find the department matching the text (in english or french)
  		var acronym = _.find(window.depts, function(d) {return d.dept.en == this.innerHTML || d.dept.fr == this.innerHTML;}, this).accronym;
  		var address =  "nojs"+acronym;
  		this.href = address + "-" + lang + ".html";
  	  });

      var clone = $('html').clone();
  	  clone.find('script').remove();
  	  clone.find('noscript').remove();
  	  clone.find('base').remove();
      clone.find('.twitter-typeahead').remove();
  	  clone.find("#gcwu-gcnb-lang a").attr("href", "nojsindex-" + (lang == "eng" ? "fra" : "eng") + ".html");
  	  var body = clone[0].outerHTML;
  	  return body;
  	}, function(data){
      console.log("in get_list: resolving page eval");
      htmldump = data;
      make_list.resolve();
    }, lang);
  
    make_list.promise.then(function(){
      //removes extra script tags
    	htmldump = htmldump.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gm, "");
      console.log("in get_list: writing to file: nojsindex-"+lang+".html, length: "+htmldump.length);
      fs.writeFile("nojsindex-" + lang + ".html", htmldump, function(){
        console.log("in get_list: finished writing file");
      });
      get_list.resolve();
    });

  });//get_list

}); //page.open
}); //createPage

  /*get_list.promise.then(function(){
     //PROMISES.getIndex[lang].resolve();
  });*/
  return get_list.promise;
} //End of getIndex


loop_depts = function(depts, language) {
var depts_loop = Q.defer();

ph.createPage(function(page){ //Screw indenting because it covers the whole function

  // this is a recursive function, so eventually depts will be a 0 length list
  // will repeat once more in french, and then exit the second time
  if (depts.length === 0){
   if (language == "eng"){
      loop_depts(all_depts, "fra");
      return;
   }
   else
      console.log("Done all the departments!");
      depts_loop.resolve();
  }

  // just log countdown
  console.log("depts left: "+depts.length);
   // grab first department and remove it from the list
  var dept_key = depts[0];
  console.log(dept_key);
  depts = depts.slice(1,depts.length);

  // create the page object and set the viewport to the right size
  var page = webpage.create();
  page.viewportSize = { width: 1600, height: 800 };

  // pass through console.log messages to the terminal
  page.onConsoleMessage(echoConsole);

  /* the function will be called by window.callPhantom
     data is of the form
              dept_key
              finished => indicates if all tables have been rendered and saved
              table  => the current table
              body => the body to be rendered
   */
  page.onCallback = function(data){
    var dept_key = data.dept_key;
    var body = data.body;
    var table = data.table;
    var finished = data.finished;
    var name =  "nojs"+dept_key;
    if (table) {
  //Add the table to the page name if needed, this name is used to name the html file
        name += table;
    }
  //Regex to remove script tags that are not found by $("script") since they are in IE-only code
    body = body.replace(/<script.+<\/script>/g, "");

    fs.write(name + '-' + language + '.html', body, 'w');
    if (finished){
        setTimeout(function(){
          // function calls itself again
    page.close();
          loop_depts(depts, language);
        },50);
    }
  };

  // request a new page
page.open('localhost:8080/index-' + language + '.html', function(status){
      console.log("in page");
      // set stuff up
    page.evaluate(function(dept_key, lang){
      // get a reference to the running app
      window.app =  ns().APP.app;
      // remove the lightbox element
      $('#cboxOverlay').remove();
      // hold on to the current department key
      window.dept_key = dept_key;
      window.lang = lang;
      // this represents the current department object
      var _dept =  window.depts[dept_key];
      // not all departments have data for all the tables
      /// holding a reference to the tables which are relevant for
      // this department
      window.tables = _.keys(_dept.tables);
      // set department as the avtive on in the pap
      window.app.state.set("dept", _dept);
      // this function removes dynamic elements from pages before they are saved
      window.make_body = function(){

        var table = window.app.state.get("table");
          if (table){
            table = table.id;
          }
        $(".dataTable").removeClass("dataTable");
        window.fix_links(table);
        //Clone the html and remove unneeded parts of the page
        var clone = $('html').clone();
        clone.find('script').remove();
        clone.find('noscript').remove();
        clone.find('base').remove();
        var body = clone[0].outerHTML;
        window.callPhantom({
          dept_key : dept_key,
          finished : window.tables.length === 0,
          table : table,
          body:body
        });
      };

      // this function updates the urls of links to make them match the new static layout
      window.fix_links = function(table) {
        //Fixes links which go back to the department select page
        var indexUrl = "nojsindex-" + lang + ".html";
        $("#back_button a").attr("href", indexUrl);
        $(".dept_sel").attr("href", indexUrl);

        //Fixes the link leading back to the dept page from a table page
        $(".button-group .back").attr("href", "nojs" + dept_key + "-" + lang + ".html");

        //Fixes the language change link by making it link to the language which is not currently in use
        $("#gcwu-gcnb-lang a").attr("href", "nojs" + dept_key + (table ? table : "") + "-" + (lang == "eng" ? "fra" : "eng") + ".html");

        //Fixes links to other departments in the same ministry
        var links = $("#other_depts_list a");
        links.each(function() {

          //For each link, find the department matching the text (in english or french)
          var acronym = _.find(window.depts, function(d) {return d.dept.en == this.innerHTML || d.dept.fr == this.innerHTML;}, this).accronym;
          if (acronym === undefined){
          //This code should ideally never run, but just in case...
            console.log("The department " + this.innerHTML + " could not be found or does not have an acronym.");
            ph.exit();
          }
          var address =  "nojs"+acronym;
          //When on a page with a table, links to other departments should also go to that table if the table exists.
              if (table && depts[acronym]['tables'][table]) {
            address += table;
              }
          this.href = address + "-" + lang + ".html";
        });

        //Fixes links to the detailed pages from the overview page
        var tableDetails = $(".widget-row > div");
        tableDetails.each(function() {
          var table = $(this).attr("id");
          //If the department has a table to link to, simply provide a link to that table's page
          if (depts[dept_key]["tables"][table]) {
            var address = "nojs" + dept_key + table + "-" + lang + ".html";
            var text = $(this).find(".title").html();
            $(this).html(function() {return '<a title="' + text + '"href="' + address + '"> ' + text;});
          }
          //And if not, remove the associated details box entirely.
          else $(this).remove();
        });
      };
    },dept_key, language); // end of evaluate function

    // this function processes each of the data pages
    function make_table_page(){
     
     // run once, assumes a department has at least one table of data
     waitFor_prom(function() {
        var ret = Q.defer();
        var bool;
        page.evaluate(function() { //Condition that the program will wait for:
          return $('.table_payload td a').length !== 0;
        },function(data){
          ret.resolve(data);
        });
        return ret.promise;
      }).then(function() {
         //What happens when the condition is fulfilled (old make_table_page function)
        var x,
        temp = Q.defer();
        page.evaluate(function(){
          // remove the links in each table cell
          $('.table_payload td a').each(function(){
             $(this).parent().html($(this).html());
             $(this).remove();
          });
          // remove the graphs section
          $('#graph__').remove();
          $('.graph_payload').remove();

          // write this to a file
          make_body();
          // if there are more tables for this department
          // get a reference to the next table, and fire off
          if (window.tables.length > 0){
            var tid = window.tables.pop();
            var table = ns().TABLES.tables.find(function(t){return t.id === tid;});
            ns().APP.dispatcher.trigger_a("table_selected",table);
            // return this positive number to signal that the function should
           // continue to call itself
            return window.tables.length;
          }
          // return this if there are no tables left
          return -1;
         }, function(data){
          if(data >= 0){
            make_table_page();
          }
         });
          
       });
    }

    waitFor(function() {
  return page.evaluate(function() {
    return $(".mini_payload").length !== 0;
  });
  }, function(){
       // save the main page for each department
       // the timeout is needed to allow the page to render itself
       page.evaluate(function(){
         $('.mini_t p').remove();
         $('.mini_payload').remove();
         $('.section-header').css({"margin-bottom" : "0px"});
         make_body();
         var tid = window.tables.pop();
         var table = ns().TABLES.tables.find(function(t){return t.id === tid;});
         ns().APP.dispatcher.trigger_a("table_selected",table);
      });
        // now start saving the table pages
        make_table_page();

    });
}); //End of page open


}); //function that uses page

}; //loop depts

 

// This is for repeatedly-checking for something to be true, then clears the interval.
//IMPORTANT: the passed function should RETURN A PROMISE, the data that resolves this promise is what we check to be true or not.
//It is done this way because the phantom port for node is pretty much async-only and functions evaluated don't return their values synchronously.

//testFx should return a promise that is resolved with a boolean. 
//timeOutMillis (defaults to 3000) is 
// Contrary to the standard waitFor, this function does not execute a function that 'waitFor' the testFx, it return a promise that you can attach handlers too
//See getIndex for an example of how this is done.
waitFor_prom = function(testFx,timeOutMillis){
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
  start = new Date().getTime(),
  ret = Q.defer(),
  interval = setInterval(function() {
    if(new Date().getTime() - start < maxtimeOutMillis) {
      // If not time-out yet and condition not yet fulfilled
      testFx().then(function(data){
        if(data){
          clearInterval(interval);
          ret.resolve();

        }
      });
    } else { //time up
          clearInterval(interval);
          console.log("waited too long");
          my_exit();
    }
  }, 100);

  return ret.promise;
};


});//Phantom object is singleton so everything is thrown in this giant function)
