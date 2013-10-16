$.mobile.hashListeningEnabled = false;
$(function(){
    var lang = _.last(location.pathname.replace(".html",""),3).join("")=='eng' ? 'en' : 'fr';
    $('h1').remove();
    var APP = ns('APP');

    APP.dispatcher.on("app_ready", function(app){
      app.state.set("lang",lang);
      app.state.set("use_footer",false);
      app.state.set("min_tot",true);
      app.state.set("goc_tot",true);
    });

    APP.start();
});
