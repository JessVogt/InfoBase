(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');
    var TABLES = ns('TABLES');

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      window.is_mobile = true;
    } else {
      window.is_mobile = false;
    }

    APP.t = function(id){
      var el =  $(id);
      if (el.length === 0 && !_.isUndefined(console)){
        console.warn(id+" not found");
        return Handlebars.compile(" ");
      }
      return Handlebars.compile($.trim(el.html()));
    }

    APP.dispatcher = _.extend({
      trigger_a : function(){
        var args = arguments;
        setTimeout(_.bind(function(){
          APP.dispatcher.trigger.apply(APP.dispatcher,args);
        }));
      }
      ,deferred_signal : function(signal){
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
      }
      ,on_these : function (signals,func,repeat) {
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
        })
      }
    },Backbone.Events)
    /************STATE MODEL********/
    APP.stateModel = Backbone.Model.extend({ });

    var _given = {};

    APP.make_unique = function(){
      var val, given=true;
      while (given ) {
        var val = _.random(0,10000000)+"";
        given = !_.isUndefined(_given[val]);
      }
      _given[val] = true;
      return val;
    }
    APP._given = _given;


  APP.otherDeptsDropDown = Backbone.View.extend({
      template : '#nav_li'
      ,initialize: function(){
        _.bindAll(this,"render");
        this.app = this.options.app;
      }
      ,render: function(){
        this.template = APP.t(this.template)
        var state = this.app.state;
        var dept = state.get('dept');
        var lang = state.get("lang");
        var other_depts = _.filter(window.mins[dept.min.en],function(d){
          return d !== dept;
        });
        var other_depts_list = $('#other_depts_list');
        var template = this.template;
        if (other_depts.length > 0){
          _.each(_.sortBy(other_depts,
                          function(d){return d.dept[lang]})
                 ,function(dept){
                          // create the link item with the
                          // department name
                          var nav = $( template({
                            text:dept.dept[lang],
                            accronym : dept.accronym
                          }));
                          // set up the onclick for the link item
                          nav.on("click",
                            function(event){
                              other_depts_list.find("li").off();
                              state.set('dept',dept);
                          });
                        // append the link to the nav dropdown
                        // item
                        other_depts_list.append(nav);
                 });
        }
        else {
          other_depts_list.parent().remove();
        }
      }
  });

  APP.OrgView = Backbone.View.extend({
    template : '#main_t'
    ,template2 : '#panels_t'
    ,initialize: function(){
      this.template = APP.t(this.template)
      this.template2 = APP.t(this.template2)
      this.app = this.options.app
      this.org = this.options.dept;
      this.container = this.options.container;
      _.bindAll(this,"render");
    }
    ,render : function(app){
      // render the main template
      this.container.children().remove();
      $(this.template({ org : this.org })).appendTo(this.container);
      $(this.template2()).appendTo($('.panels',this.container));
      // move the title into the nav area
      this.container.find('h1.dept_name').appendTo('.nav_area .left');
      APP.dispatcher.trigger_a("new_org_view",this.app,this);
      return this;
    }
  });

})();
