(function(){
    var APP = ns('APP');
    var TABLES = ns('TABLES');
 
    // add the #start route,
    // for the Infobase, this will be the welcome screen
    APP.add_container_route("start","start",function(container){
      container = $(container);
      var inside = TABLES.m('#greeting_'+this.app.lang);
      var outside = TABLES.m("#greeting",{greeting : inside});

      this.add_crumbs();

      APP.dispatcher.trigger("reset",this.app);
      container.html(outside);
      this.add_title("welcome");
    });

    //// START the application

    // parse the file name of the html file to figure out if the
    // language is en or fr  TODO fix how awkwardly this is done
    var lang = _.last(location.pathname.replace(".html",""),3).join("")==='eng' ? 'en' : 'fr';
    var APP = ns('APP');
    APP.start(lang);


/*phantom-only*/

  window.test_funcs.push(function(){

    var ret = $.Deferred();

    ns('APP').app.router.navigate('#start:window', {trigger:true});

    var cond = !!($('[href=#home]'));
    
    ret.resolve({module:'start',pass:cond, msg:'It should link to #home'});

    return ret.promise();

  });

/*phantom-only*/


})();
