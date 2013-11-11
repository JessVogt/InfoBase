(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');
    var TABLES = ns('TABLES');

    APP.t = function(id){
      var el =  $(id);
      if (el.length === 0 && !_.isUndefined(console)){
        console.warn(id+" not found");
        return Handlebars.compile(" ");
      }
      return Handlebars.compile($.trim(el.html()));
    }

    APP.dispatcher = _.extend({
      trigger_a : function(signal,context){
        setTimeout(_.bind(function(){
          APP.dispatcher.trigger(signal,context);
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

    APP.types_to_format = {
      "compact" : function(val,lang){
         var symbol,abbrev = {
           1000000000 : {en : 'B', fr: 'Mds'},
           1000000 : {en : 'M', fr: 'm'},
           1000 : {en : 'K', fr: 'k'},
         },abs = Math.abs(val)
         if (val == 0) { 
           return accounting.formatMoney(0,{precision: 0, symbol: ''})
         } else if (abs >= 1000000000){
           val = val /  1000000000;
           symbol = abbrev[1000000000][lang];
         }
         else if (abs >= 1000000){
           val = val /  1000000;
           symbol = abbrev[1000000][lang];
         }
         else {
           val = val /  1000;
           symbol = abbrev[1000][lang];
         }
         if (lang === 'en'){
           return accounting.formatMoney(val,
               {symbol:symbol,precision: 0, format: "%v %s" });
         } else if (lang === 'fr'){
           return accounting.formatMoney(val,{
             decimal : ',',
             thousand:' ',
             format: "%v %s",
             symbol:symbol,
             precision: 0
         });
         }
      },
      "percentage" :  function(val,lang){
        var options = {
          symbol : "%",
          format : "%v%s",
          precision : 0
        }
        if (val <= 0.01){ options.precision = 1}
        if (_.isArray(val)){
          val = _.map(val, function(x){return x*100;})
        } else {
          val = val * 100;
        }
        if (lang === 'en'){
          return accounting.formatMoney(val,options);
        } else if (lang === 'fr'){
          return accounting.formatMoney(val,_.extend(options,{
            decimal : ',',
            thousand:' ',
            precision: 1
          }));
        }
      },
      "big-int" :  function(val,lang){
        if (_.isArray(val)){
          val = _.map(val, function(x){return x/1000;})
        } else {
          val = val / 1000;
        }
        if (lang === 'en'){
          return accounting.formatNumber(val,{precision: 0});
        } else if (lang === 'fr'){
          return accounting.formatNumber(val,{
            decimal : ',',
            thousand:' ',
            precision: 0
          });
        }
      },
      "big-int2" :  function(val,lang){
        return this['big-int'](val*1000,lang);
      },
      "int" :  function(val,lang){return val},
      "str" : function(val,lang){return val},
      "wide-str" : function(val,lang){return val},
      "date" : function(val,lang){return val}
    }

    APP.find_all_in_ministry = function(dept,lang){
      // find all departments with a ministry name, matching
      return window.mins[dept.min.en].values;
    }

    APP.fullDeptList = Backbone.View.extend({
      el : 'body'
      ,template : '#org_list_t'
      ,events : {
       "click a.dept_sel" : "render",
       "click a.dept_sel_cancel" : "cancel",
       "click a.org_select" : "onClick",
      "click .org_list .sort_buttons a" : "sort"
      }
      ,initialize: function(){
        this.template = APP.t(this.template)
        _.bindAll(this,"render","sort","cancel","onClick");
        this.app = this.options['app'];
        this.cols = this.options['cols'];
        this.target = this.options['target'];
        this.state = this.app.state;
        this.lookup = depts;
        this.sort_func = 'min_sort';
      }
      ,render : function(event){
        this.app.app.hide();
        this.controller_button = $('a.dept_sel');

        // in case the target was a selector string
        if (_.isString(this.target)){
          this.drop_zone = $(this.target);
        } else { 
          this.drop_zone = this.target;
        }
        this.drop_zone.children().remove();

        this.controller_button
          .html(this.app.get_text("cancel"))
          .removeClass("dept_sel")
          .addClass("dept_sel_cancel")

        var lang = this.state.get('lang');

        var el = $($.trim(this.template({
          depts : this[this.sort_func]['group_by'](lang,this)
        })));
        this.drop_zone.append(el);
        //enable listview
        el.find('ul.orgs').listview({
          autodividers:true,
          filter:true,
          autodividersSelector : this[this.sort_func]['dividers_func'](this),
          filterPlaceholder : this.app.get_text("search")
        });
        // add WCAG required label
        el.find('div.ui-input-search input')
          .attr("id","dept_search_filter")
          .before($('<label>')
                  .attr("for","dept_search_filter")
                  .addClass("wb-invisible")
                  .html(this.app.get_text("search")));
        // add the class
        // to the active button
        el.find('a[sort-func-name="'+this.sort_func+'"]')
          .addClass('button-accent');
        // focus the cursor on the cancel button
        this.controller_button.focus();
      }
      ,min_sort : {
        group_by : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym != 'ZGOC';
          }),function(dept){
            return   [dept.min[lang],dept.dept[lang]];
          }); 
        }
       , dividers_func : function(app){
         return function(li){ 
            return $(li).attr("min");
          }
       }
      }                       
      ,alpha_sort : {
        group_by : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym != 'ZGOC';
          }),function(dept){
             return   dept.dept[lang];
          });
        }
        ,dividers_func : function(view){
          return function(li){ 
            return $(li).text()[0];
          }
        }
      }                       
      ,fin_size_sort : {
        group_by  : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym != 'ZGOC';
          }),function(dept){
             return  dept.fin_size
          }).reverse();
        }
        ,dividers_func : function(view){
          var app = view.app;
          return function(li){ 
            var fin_size =  parseFloat($(li).attr("fin-size"));
            var sizes = [ 10000000000,
                          7500000000,
                          5000000000,
                          2500000000,
                          1000000000,
                          500000000,
                          100000000,
                          50000000,
                          10000000];
            for (var i=0;i<sizes.length;i++){
              if (fin_size >= sizes[i]){
                return app.get_text("greater_than") +app.formater("big-int",sizes[i]);
              }
            }
            return  app.get_text("less_than") + app.formater("big-int",_.last(sizes));
          }
        }
      }                       
      ,sort : function(event){
        var btn = $(event.target);
        this.sort_func =  btn.attr("sort-func-name");
        this.render();
      }
      ,cancel : function(){
        this.controller_button
         .html(this.app.get_text("to_select"))
         .addClass("dept_sel")
         .removeClass("dept_sel_cancel")
        this.drop_zone.find(".org_list").remove();
        this.app.app.show();
      }
      ,onClick : function(event){
        var lang = this.state.get('lang');
        var dept = $.trim($(event.target).text());
        dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == dept}));
        // why ?
        this.state.unset("dept",{silent: true});
        this.cancel();
        this.state.set('dept',dept);
      }
    });

    // the popup window for the LED which displays the departmental 
    // information with search tools
    APP.deptInfoView = Backbone.View.extend({
      initialize: function(){ 
        this.template = APP.t('#dept_info_t');

        _.bindAll(this,"render","on_search");
        // retrieve passed in data
        this.app = this.options["app"];

        this.gt = this.app.get_text;
        this.state = this.app.state;
      }
      ,render : function(){
        var body = $(this.template({ dept: this.state.get("dept") }));

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

    APP.otherDeptsDropDown = Backbone.View.extend({
      template : '#nav_li'
      ,initialize: function(){
        _.bindAll(this,"render");
        this.app = this.options["app"];
      }
      ,render: function(other_depts){
        this.template = APP.t(this.template)
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

  // 
  APP.OrgView = Backbone.View.extend({
    template : '#main_t'
    ,template2 : '#panels_t'
    ,initialize: function(){
      this.template = APP.t(this.template)
      this.template2 = APP.t(this.template2)
      _.bindAll(this,"render");
    }
    ,render : function(app){

      var org = app.state.get("dept");
      // render the main template
      app.app.children().remove();
      $(this.template({ org : org })).appendTo(app.app);
      $(this.template2()).appendTo($('.panels',app.app));

      APP.dispatcher.trigger_a("new_org_view",this);
      return this;
    }
  });

  APP.footnoteView = Backbone.View.extend({
    template : '#footnotes_t'
    ,initialize: function(){
      this.template = APP.t(this.template)
      _.bindAll(this,"render");
      // retrieve passed in data
      this.app = this.options["app"];
      this.footnotes = this.options['footnotes'];
      this.button = this.options['btn'];
      // set some useful state based on these inputs
      this.lang = this.app.lang;
      this.button.on("click",this.render);
    }
    ,render : function () {
      var gt = this.app.get_text;
      var html = $(this.template({
        fns : this.footnotes
      }));

      this.app.modal_view.render({
        body : html,
        header : gt("footnotes"),
        footer : gt("close")
      });
    }
  });

  var ministry_total = function(depts,table){
      var lines = _.map(depts,
        function(dept){  //map function
          return dept['tables'][table];
        });
      // flatten all these lists into one big list
      return  _.flatten(_.compact(lines),true);
  };

  APP.DetailsView = Backbone.View.extend({
    template : '#dataview_t'
    ,initialize: function(){
      this.template = APP.t(this.template);
      _.bindAll(this,"render","tear_down","setup_useful_this_links",
                "on_about_click", "on_min_tot_click","on_goc_tot_click");
      // retrieve passed in data
      this.app = this.options["app"];
      this.def = this.options["def"];

      this.drop_zone = this.app.$el.find('.table_content');
      this.key = this.def["id"];
      this.gt = this.app.get_text;
      this.state = this.app.state;
      this.dept = this.state.get("dept");
      this.lang = this.state.get("lang");
      this.mapper = this.def.mapper[this.lang];
      this.data = this.dept['mapped_data'][this.key][this.lang];
      if (_.has(this.def,"sort")){
        this.data = this.def.sort(this.data,this.lang);
      }
      var other_depts = this.state.get("other_depts");
      // set some useful state based on these inputs
      var ministry_depts = other_depts.concat([this.dept]);
      //collect ministry data
      var raw_min_data = ministry_total(ministry_depts,this.key);
      this.min_data = this.mapper.map(raw_min_data);
      //collect goc data
      var raw_goc_data = depts['ZGOC']['tables'][this.key];
      this.goc_data = this.mapper.map(raw_goc_data);
    }

    ,render: function(){

      this.drop_zone.children().remove();
      
      //this.app.$el.find('.table_title').html(this.def.title[this.lang]);
      // setup the dropdown menu of other departments
      // sort the departments by name

      // add the footnotes
      var footnotes = [];
      //if (typeof footnotes != 'undefined' && _.has(window.footnotes,this.key)){
      //  footnotes = footnotes.concat(window.footnotes[this.key]);  
      //}
      //if (_.has(this.dept,"footnotes") &&_.has(this.dept.footnotes, this.key)){
      //  footnotes = footnotes.concat(this.dept.footnotes[this.key]);  
      //}

      this.$el = $(this.template({
        "title" : this.def.name[this.lang],
        "key" : this.key,
        "min_tot" : this.app.state.get("min_tot"),
        "goc_tot" : this.app.state.get("goc_tot"),
        "footnotes" : footnotes.length !== 0
      }));

      this.setup_useful_this_links();

      // establish event listeners
      this.about_btn.on("click", this.on_about_click);
      this.min_total_btn.on( "click",this,this.on_min_tot_click); 
      this.goc_total_btn.on( "click",this,this.on_goc_tot_click); 

      // create the table view
      this.table_view = new this.def['table_view']({
        key : this.key,
        rows : this.data,
        min_data : this.min_data,

        goc_data : this.goc_data,
        app : this.app,
        def : this.def,
        print_btn : this.print_btn,
        details_btn : this.details_btn,
        copy_btn : this.copy_btn,
        mapper : this.mapper
      });
      this.table_payload.append(this.table_view.render().$el);

      this.fnv = new APP.footnoteView({
        app : this.app,
        footnotes : footnotes,
        btn : this.fn_btn
      });
      
      this.drop_zone.append(this.$el);

      APP.dispatcher.trigger_a("new_details_view",this);
      return this;
    }
    ,tear_down : function(e){
       this.app.router.navigate(this.dept.accronym);
       this.table_view.remove();
       this.remove();
       this.app.state.unset("table");
        $('.panels').show();
    }
    ,setup_useful_this_links : function() {

      this.table_payload = this.$el.find('.table_payload');
      this.graph_payload = this.$el.find('.graph_payload');

      this.about_btn = this.$el.find('a.about');
      this.print_btn = this.$el.find('a.print');
      this.details_btn = this.$el.find('a.details');
      this.fn_btn = this.$el.find('a.fn');
      this.min_total_btn = this.$el.find('a.min_tot');
      this.goc_total_btn = this.$el.find('a.goc_tot');
    }
    ,on_about_click : function (e) {
      var gt = this.app.get_text;
      var help_key = "#" + this.key + "_help_" + this.lang;
      var help_text = $(help_key).html();
      this.app.modal_view.render({
        body : help_text,
        header : gt("about"),
        footer : gt("close")
      });
    }
    ,on_min_tot_click : function (e) {
      var view = e.data;
      var p = $(e.target).parent();
      view.app.state.set("min_tot",
                      !p.hasClass("active"));
      p.toggleClass("active");
    }
    ,on_goc_tot_click : function (e) {
      var view = e.data;
      var p = $(e.target).parent();
      view.app.state.set("goc_tot",
                      !p.hasClass("active"));
      p.toggleClass("active");
    }
  });

  APP.listen_for_tables = function(app){
    var signals = _.map(TABLES.tables,function(table){
      return 'table_' + table.id +"_rendered";
    });
    APP.size_panels(app,signals);
  };

  APP.size_row = function(i,row)   {
     var panels =  $('.mini_t',row);
     var p = $(this).parents('.dept_zone');
     panels.width( (p.width() - 60)/3  - 1);
     _.each(['.section-header', 'p.description','th','.mini_payload'],
         function(selector){
            $(selector,row)
            .css("height","")
            .height(_.max($(selector,row).map(function(x,y){
              return $(y).height();
            })));
     })
  };

  APP.dispatcher.on("dept_selected", APP.listen_for_tables);

  APP.size_panels = function(app,signals){
    // once all the mini table signals have been sent
    // do some prettying up on the page
    APP.dispatcher.on_these(signals, function(){
      var current_view;
      var dept = app.state.get("dept");
      var views = _.toArray(arguments);
      var current_table = app.state.get("table");
      // figure out the currently selected table, if any
      if (current_table){
        current_view = _.first(_.filter(views,function(v){
          // compare the views table deifnition with the current
          // table AND make sure the currently selected 
          // department has data for that kind of table
          return (v.def.id === current_table.get('id') && 
                  _.has(dept.tables,v.def.id));
        }));
      } else {
        current_view = undefined;
      }

      $('.widget-row').each(APP.size_row);
      APP.dispatcher.trigger("mini_tables_rendered",
          {current_view : current_view,
            views : views} 
      ); 
    });
  };

})();
