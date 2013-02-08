(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');

    APP.dispatcher = _.extend({
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

    APP.types_to_format = {
      "percentage" :  function(val,lang){return $.formatNumber(val,
                                                  {format : "0%" ,locale : lang})},
      "big-int" :  function(val,lang){return $.formatNumber(val,
                                                  {format:"#,##0" , locale: lang})},
      "int" :  function(val,lang){return val},
      "str" : function(val,lang){return val},
      "wide-str" : function(val,lang){return val},
      "date" : function(val,lang){return val}
    }

    APP.find_all_in_ministry = function(dept,lang){
      // find all departments with a ministry name, matching
      // the ministry AND that has data for the requested table
      return _.filter(window.depts,
            function(d){
              return d['min'][lang] == dept['min'][lang];
      });
    }


    APP.modalView = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];

        this.gt = this.app.get_text;
        this.state = this.app.state;
        this.modal = $("#modal_skeleton");
        this.header = this.modal.find(".modal-header h3");
        this.body = this.modal.find(".modal-body");
        this.footer = this.modal.find(".modal-footer a");
        this.modal.on("hidden",this.reset);
      }
      ,hide : function(){
        this.modal.modal("hide");
      }
      ,reset : function(){
        //clear out the body area
        this.body.find("*").off();
        this.body.children().remove(); 
        this.body.html("");
      }
      ,render : function(ob){
        this.reset();
        this.body.append(ob.body);
        this.header.html(ob.header);
        this.footer.html(ob.footer);
        this.modal.modal({
          keyboard: false
        });
         return this
      }
    });

    APP.autocompleteView = Backbone.View.extend({
      el : ('#type_ahead')
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.gt = this.options['app'].get_text;

        this.lookup = depts;
        APP.dispatcher.on("lang_change",this.render);
        APP.dispatcher.on("dept_ready",this.clear);
        this.$el.typeahead({updater: this.updater});
      }
      ,clear : function(app){
        setTimeout(_.bind(function(){
          this.$el.val('');
        },this));
      }
      ,render:function (lang) {
         var text = this.gt("search");
         // filter the departments to remove the GoC
         // data
         var values = _.filter(_.values(this.lookup),
           function(val){
             return val.accronym != 'ZGOC';
           });
         // look departments up by name
         var source = _.map(values, 
           function(x) {
             return  x['dept'][lang];
           });
         // look departments up by name
         source = source.concat( _.pluck(_.values(this.lookup), 'accronym'));
         this.$el.prop('placeholder',text);
         // use this method to reset the source
         this.$el.data('typeahead')['source'] = source;
         return this;
      }
      ,updater:function(val){
        var lang = this.state.get('lang');
        var dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == val}));
        // now search by accronym
        if (_.isUndefined(dept)){
            dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['accronym'] == val}));
        }
        this.state.set('dept',dept);
        return val;
      }
    });

    APP.fullDeptList = Backbone.View.extend({
      template : _.template($('#dept_list').html())
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.lookup = depts;
        this.nav_bar_ul = $('#navbar_ul');
        $('#dept_sel').on("click",this.render);
        //ensure that if the language changes, this list
        //will redraw automatically
      }
      ,render : function(){
        $('body').find(".dept_menu").remove();
        var lang = this.state.get('lang');
        var mins = _.groupBy(depts, function(x){return x['min'][lang]});
        // remove the empty GoC ministry
        if (lang == 'fr'){
          delete mins["Gouvernement du Canada"];
        }else {
          delete mins["Government of Canada"];
        }

        mins =  _.map(_.keys(mins).sort(),
          function(min){
             return _.sortBy(mins[min],
               function(dept){
                 return dept['dept'][lang]
               })
          });

        var cols = this.ministry_to_cols(mins);
        this.$el = $(this.template({cols: cols, lang:lang}));
        this.$el.find('a').on("click",this.onClick);
        $('body').append(this.$el);
        
      }
      // recursive function to assign the column layout
      // of the departments presented by ministry
      // assumes mins is in format of [ [dept1,dept2],[dept1,dept2,dept3],...
      ,ministry_to_cols : function(mins,cols){
        cols = cols || [[]];
        if (mins.length == 0){
          return cols;
        }
        if (_.last(cols).length == 0){
          _.last(cols).push(_.head(mins));
          return this.ministry_to_cols(_.tail(mins),cols);
        }
        else {
          if (_.flatten(_.last(cols),true).length + _.head(mins).length <= 28){
            _.last(cols).push(_.head(mins));
            return this.ministry_to_cols(_.tail(mins),cols);
          }
          else{
            return this.ministry_to_cols(mins,cols.concat([[]]));
          }
        }
      }
      ,onClick : function(event){
        this.$el.find('a').off("click",this.onClick);
        var lang = this.state.get('lang');
        var dept = $(event.target).text();
        dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == dept}));
        this.state.unset("dept",{silent: true});
        $('body').find(".dept_menu").remove();
        this.state.set('dept',dept);
      }
    });

    APP.deptInfoView = Backbone.View.extend({
      template : _.template($('#dept_info_t').html())
      ,initialize: function(){
        _.bindAll(this);
        // retrieve passed in data
        this.app = this.options["app"];

        this.gt = this.app.get_text;
        this.state = this.app.state;
      }
      ,render : function(){
        var dept = this.state.get("dept");
        var lang = this.state.get('lang');

        body = $(this.template({
          lang : lang,
          gt : this.gt,
          dept: dept
        }));

        this.search_box = body.find('input.site-search');
        this.search_button = body.find('a.site-search');
        this.search_button.on("click",this.on_search);

        this.app.modal_view.render({
          body: body,
          header : "Info",
          footer : this.gt("close") 
        });

      }
      ,on_search : function(e){
        var dept = this.state.get("dept");
        var site = 'site:'+ dept['website']['en'].split("/")[0].replace("http://","");
        var q = 'q='+encodeURI(this.search_box.val()) + "+"+site;
        window.open("http://www.google.com/search?"+q); 
      }
    });

    APP.switchLangView = Backbone.View.extend({
      el : $("#lang_change")
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];
        this.$el.on("click",this.app.toggle_lang);
        APP.dispatcher.on("lang_change",this.render);
      }
      ,render:function (lang) {			
        this.$el.html(this.app.get_text("lang"));
        return this;
      }
    }); 

    APP.otherDeptsDropDown = Backbone.View.extend({
      template : _.template($('#nav_li').html())
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];
      }
      ,render: function(other_depts){
        var state = this.app.state;
        var dept = state.get('dept');
        var lang = state.get("lang");
        var other_depts = state.get("other_depts");
        var other_depts_list = $('#other_depts_list');
        var template = this.template;

        if (other_depts.length > 0){
          _.each(_.sortBy(other_depts,
                          function(d){return d.dept[lang]})
                 ,function(dept){
                          // create the link item with the
                          // department name
                          var nav = $( template({
                            text:dept.dept[lang]
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

})();
