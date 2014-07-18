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

getIndex('eng').then(function() { return getIndex('fra');}).then(my_exit,0); //Will resolve the promise the next line waits for (this pattern is repeated)

//Saves the landing and index pages based on the language passed in as a parameter
function getIndex(lang){
  console.log((new Date().getTime()-START_TIME)+","+lang+", getIndex ("+lang+")");


  var get_departments = Q.defer();
  var get_list = Q.defer();


  ph.createPage(function(page){

  page.onConsoleMessage(echoConsole);
  page.open('http://localhost:8080/infobase/index-'+lang+'.html#search',function(){

  var htmldump;

  // poll to see when the page is ready to grab the departments
  // grab a list of all the departments to be used later when looping
  waitFor_prom(
      function(){ 
        var ret = Q.defer();
        page.evaluate(function(){
          console.log("checking for depts");
          return $('.typeahead').length > 0; //everything should be loaded at this point
        },function(data){
          console.log("data: "+data);
          ret.resolve(data); //this data is what waitfor_prom really uses
        });
        return ret.promise;
      },10000)
      .then( function(){
        var quick_eval = Q.defer();

        page.evaluate(function(){
            return _.keys(_.omit(window.depts,'zgoc'));
        }, function(data){
          if (lang == 'eng') //on french iteration the departments are already set
          all_depts=data;
          quick_eval.resolve();
        });
        quick_eval.promise.then(function(){
          console.log(all_depts.length);
          get_departments.resolve();
        });
        
      });

  get_departments.promise.then(function(){
    console.log("in get_list: intro");
    page.evaluate(function(lang) {
         return window.index_page.scrape(lang);
    }, 
    function(data){
        console.log("in get_list: writing to file: nojsindex-"+lang+".html, length: "+data.length);
        fs.writeFile("nojsindex-" + lang + ".html", data, function(){
          console.log("in get_list: finished writing file");
        });
        get_list.resolve();
    }, lang);
  });


}); //page.open
}); //createpage

  return get_list.promise;
} //end of getindex


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
