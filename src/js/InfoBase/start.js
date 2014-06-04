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
      this.app.reset();

      APP.dispatcher.trigger("reset",this.app);
      container.html(outside);
      this.add_title("welcome");
    });
})();
