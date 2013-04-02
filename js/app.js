(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');

    APP.t = function(id){
      return Handlebars.compile($.trim($(id).html()));
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

    APP.WETautocompleteView = Backbone.View.extend({
      initialize: function(){
        this.template = APP.t('#wet_autocomplete_t');
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.lookup = depts;
        this.listenTo(APP.dispatcher,'lang_change',this.render);
        this.listenTo(APP.dispatcher,"dept_ready",this.clear);
      }
      ,clear : function(app){
        setTimeout(_.bind(function(){ this.$el.val('')},this));
      }
      ,render:function (lang) {
        this.$el = $('input.dept_search');
        // remove any previously created datalist
        $('#suggestions').remove();
        this.$el.off('*');
         var values = _.filter(_.values(this.lookup),
           function(val){
             return val.accronym != 'ZGOC';
         });
         // look departments up by name
         var source = _.map(values, 
           function(x) {
             return  x['dept'][lang];
         });
         var datalist = $(this.template({orgs : source}));
         datalist.attr("id","org_suggestions");
         this.$el.after(datalist);
         if (!Modernizr.datalistelem){
          this.$el.datalist();
         }
         this.$el.on("input",this.on_input);
        }
      ,on_input : function(event){
        var val = $(event.target).val();
        var state = this.state;
        var lang = state.get('lang');
        var lookup = this.lookup;
        var dept = _.first(_.filter(_.values(lookup),
              function(x){ return x['dept'][lang] == val})); 
        if (dept){
          state.set('dept',dept);
        }
      }
    });

    APP.autocompleteView = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.lookup = depts;
        this.$el.typeahead({updater: this.updater});
        this.setup(this.state.get("lang"));
        this.listenTo(APP.dispatcher,"dept_ready",this.clear);
      }
      ,clear : function(app){
        setTimeout(_.bind(function(){ this.$el.val('')},this));
      }
      ,setup:function (lang) {
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
         // use this method to reset the source
         this.$el.data('typeahead')['source'] = source;
         return this;
      }
      ,updater:function(val){
        this.stopListening();
        var state = this.state;
        var lang = state.get('lang');
        var lookup = this.lookup;
        setTimeout(function(){ 
          var dept = _.first(_.filter(_.values(lookup),
              function(x){ return x['dept'][lang] == val}));
          // now search by accronym
          if (_.isUndefined(dept)){
              dept = _.first(_.filter(_.values(lookup),
                function(x){ return x['accronym'] == val}));
          }
          state.set('dept',dept)},
        100);
        return val;
      }
    });

    APP.fullDeptList = Backbone.View.extend({
      el : 'body'
      ,template : APP.t('#org_list_t')
      ,events : {
       "click a.dept_sel" : "render"
       ,"click a.dept_sel_cancel" : "cancel"
       ,"click a.org_select" : "onClick"
      }
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.cols = this.options['cols'];
        this.target = this.options['target'];
        this.state = this.app.state;
        this.lookup = depts;
        this.height = 28;
      }
      ,render : function(event){
        this.app.app.hide();
        this.controller_button = $(event.currentTarget);
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
          .addClass("dept_sel_cancel");

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

        if (this.cols){
          this.height = _.keys(this.lookup).length/2+1;
        }

        var cols = this.ministry_to_cols(mins);
        var el = $($.trim(this.template({cols: cols})));
        this.drop_zone.append(el);
      }
      // recursive function to assign the column layout
      // of the departments presented by ministry
      // assumes mins is in format of [ [dept1,dept2],[dept1,dept2,dept3],...]
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
          if (_.flatten(_.last(cols),true).length + _.head(mins).length <= this.height){
            _.last(cols).push(_.head(mins));
            return this.ministry_to_cols(_.tail(mins),cols);
          }
          else{
            return this.ministry_to_cols(mins,cols.concat([[]]));
          }
        }
      }
      ,cancel : function(){
       this.controller_button
         .html(this.app.get_text("to_select"))
         .removeClass("dept_sel_cancel")
         .addClass("dept_sel");
        this.drop_zone.find(".org_list").remove();
        this.app.app.show();
      }
      ,onClick : function(event){
        var lang = this.state.get('lang');
        var dept = $.trim($(event.target).text());
        dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == dept}));
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

        _.bindAll(this);
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
      template : APP.t('#nav_li')
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

  // 
  APP.OrgView = Backbone.View.extend({
    template : APP.t('#main_t')
    ,template2 : APP.t('#panels_t')
    ,initialize: function(){
      _.bindAll(this);
    }
    ,render : function(app){
      var org = app.state.get("dept");
      // render the main template
      debugger
      app.app.children().remove();
      $(this.template({ org : org })).appendTo(app.app);
      $(this.template2()).appendTo($('.panels',app.app));

      // remove the paragraph text
      var mandate = app.app.find('[headers="__mandate"]');
      mandate.html($.trim(mandate.text()));
        
      APP.dispatcher.trigger_a("new_org_view",this);
      return this;
    }
  });

  APP.footnoteView = Backbone.View.extend({
    template : APP.t('#footnotes_t')
    ,initialize: function(){
      _.bindAll(this);
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

  DetailsView = Backbone.View.extend({
    template : APP.t('#dataview_t')
    ,initialize: function(){
      _.bindAll(this);
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
      var raw_goc_data = window.depts['ZGOC']['tables'][this.key];
      this.goc_data = this.mapper.map(raw_goc_data);

    }

    ,render: function(){

      this.drop_zone.children().remove();
      
      //this.app.$el.find('.table_title').html(this.def.title[this.lang]);
      // setup the dropdown menu of other departments
      // sort the departments by name

      // add the footnotes
      var footnotes = [];
      if (_.has(window,"footnotes") && _.has(window.footnotes,this.key)){
        footnotes = footnotes.concat(window.footnotes[this.key]);  
      }
      if (_.has(this.dept,"footnotes") &&_.has(this.dept.footnotes, this.key)){
        footnotes = footnotes.concat(this.dept.footnotes[this.key]);  
      }

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

})();
