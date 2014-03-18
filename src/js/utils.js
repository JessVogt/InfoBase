(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');

  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    window.is_mobile = true;
  } else {
    window.is_mobile = false;
  }

  APP.abbrev = function(app,name,length){
    length = length || 60;
    var outerspan = $("<span>");
    if (name.length > length){
      var full_text = name ;
      if (app.lang === "en") {
        full_text += " abbreviated here as:";
      } else {
        full_text += " abrégé ici:";
      }
      $("<span>")
          .addClass("ui-screen-hidden")
          .html(full_text)
          .appendTo(outerspan)
          .after(name.substring(0,47)+"...");
      return outerspan.html();
    } else {
      return name;
    }
  };

  APP.t = function(id){
    var el =  $(id);
    if (el.length === 0 && !_.isUndefined(console)){
      console.warn(id+" not found");
      return Handlebars.compile(" ");
    }
    return Handlebars.compile($.trim(el.html()));
  };

  var _given = {};

  APP.make_unique = function(){
    var val, given=true;
    while (given ) {
      val = _.random(0,10000000)+"";
      given = !_.isUndefined(_given[val]);
    }
    _given[val] = true;
    return val;
  };
  APP._given = _given;


  APP.dispatcher = _.extend({
    trigger_a : function(){
      var args = arguments;
      setTimeout(_.bind(function(){
        APP.dispatcher.trigger.apply(APP.dispatcher,args);
      }));
    },
    deferred_signal : function(signal){
      var d = $.Deferred();
      var that = this;
      var f = function(arg){
        // deregister this function
        that.off(signal,f);
        // pass the argument from the signal to the deferred
        d.resolve(arg);
      };
      // register this deferred to only fire once
      // this is a precaution since f removes itself
      this.once(signal,f);
      return d;
    },
    on_these : function (signals,func,repeat) {
      var that = this;
      repeat = repeat || false;
      // wait for all the signals to have fired
      var deferreds = _.map(signals,this.deferred_signal,this);
      $.when.apply(null,deferreds).done(
      function(){
        // now pass all the args to the func
        func.apply(null, _.map(arguments, _.identity));
        if (repeat){
          setTimeout(function(){
            // re-register all the signals for the next round
            that.on_these(signals,func,repeat);
          });
        }
      });
    }
  },Backbone.Events);
  /************STATE MODEL********/
  APP.stateModel = Backbone.Model.extend({ });


})();
