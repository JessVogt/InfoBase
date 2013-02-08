(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');
  var LANG = ns('LANG');

  var ministry_total = function(depts,table){
      var lines = _.map(depts,
        function(dept){  //map function
          return dept['tables'][table];
        });
      // flatten all these lists into one big list
      return  _.flatten(_.compact(lines),true);
  };


  /************APP VIEW***********/
  APP.appView = Backbone.View.extend({
    el : $('#app')
    ,initialize: function(){
      _.bindAll(this);
      this.state = new APP.stateModel({app:this})

      //initialize views
      sub_view_args = {app: this};
      this.switchLangv = new APP.switchLangView(sub_view_args);
      this.modal_view = new APP.modalView(sub_view_args);
      this.dept_info_view  = new APP.deptInfoView(sub_view_args);
      this.acv = new APP.autocompleteView(sub_view_args);
      this.full_dept_list = new APP.fullDeptList(sub_view_args);

      this.setup_useful_this_links();
      // check for a language or set the default of english
      this.state.on("change:lang", this.render);
      this.state.on("change:lang", this.reset_dept);
      this.state.on("change:lang", this.lang_change);
      this.state.on("change:dept",this.dept_change);
      APP.dispatcher.trigger("app_ready",this);
    }
    ,dept_change : function(model, attr){
      APP.dispatcher.trigger("dept_selected",this);
      APP.dispatcher.trigger("dept_ready",this);
    }
    ,setup_useful_this_links : function(){
      this.title = $('#title');
      this.dept_sel = $('#dept_sel');
      this.welcome = $('#welcome');
      this.nav_bar_ul = $('#navbar_ul');
      this.app = $('#app');
    }
    ,formater : function(format,val){
      return APP.types_to_format[format](val,this.lang);
    }
    ,lang_change : function(state,lang){
      APP.dispatcher.trigger("lang_change",lang);
    }
    ,get_text : function(txt){
      return LANG.l(txt,this.state.get('lang'));
    }
    ,toggle_lang : function(){
      this.state.set({
        lang:this.state.get("lang") == "en" ? "fr" : "en" 
      });
    }
    ,reset_dept : function(model, dept){
      var that = this;
      var dept = this.state.get('dept');
      if (!dept){ return }
      setTimeout(function(){
        that.state.set('dept',_.clone(dept))
      });
    }
    ,render: function(model,attr){
      // get faster reference 
      this.lang = attr;
      var gt = this.get_text;
      this.title.html(gt("title"));
      this.welcome.html(gt("welcome"));
      this.dept_sel.html(gt("select"))
    }
  });

  var footnoteView = Backbone.View.extend({
    template : _.template($('#footnotes_t').html())
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
        fns : this.footnotes,
        lang  : this.lang
      }));

      this.app.modal_view.render({
        body : html,
        header : gt("footnotes"),
        footer : gt("close")
      });
    }
  });

  var OrgView = Backbone.View.extend({
    template : _.template($('#main_t').html())
    ,initialize: function(){
      _.bindAll(this);
    }
    ,render : function(app){
      var org = app.state.get("dept");
      var lang = app.state.get("lang");
      // render the main template
      //this.app.app.children().remove();
      app.app.html(this.template({
        org : org,   
        lang : lang,
        gt : app.get_text
      }));

      setTimeout(_.bind(function(){
        APP.dispatcher.trigger("new_org_view",this);
      },this));
      return this;
    }
  });

  APP.dispatcher.once("app_ready", function(app){
    var org_view = new OrgView({app:app});
    APP.dispatcher.on("dept_ready", org_view.render);
    APP.dispatcher.on("new_org_view",function(view){
      (new APP.otherDeptsDropDown({ app : app })).render();
    });
  });

  APP.dispatcher.on("dept_selected", function(app){
    // set state for all other depts in the current
    // ministry
    var org = app.state.get("dept");
    var lang = app.state.get("lang");
    var ministry_depts = APP.find_all_in_ministry(org,lang);
    var other_depts = _.filter(ministry_depts,
     function(dept) {
       return dept['accronym'] != org['accronym'];
    }); 
    app.state.set("other_depts",other_depts); 
  });  

  APP.dispatcher.once("app_ready",function(app){
    APP.dispatcher.on("new_org_view",function(view){
      TABLES.tables.each(function(table){
        var mtv = new TABLES.miniTableVew({
          app : app,
          table : table
        });

        mtv.render();
        
        mtv.$el.find('a.details').on("click", function(event){
          // move the mini views out of the way and replace with larger 
          // table
          APP.dispatcher.trigger("table_selected",table);
        });
      });
    });
  });

  APP.dispatcher.on("mini_tables_rendered", function(ctx){
    if (ctx.current_view){
      setTimeout( function(){
        APP.dispatcher.trigger("table_selected",ctx.current_view.table);
      });
    }
  });

  /************Data View********/
  DetailsView = Backbone.View.extend({
    template : _.template($('#dataview_t').html())
    ,initialize: function(){
      _.bindAll(this);
      // retrieve passed in data
      this.app = this.options["app"];
      this.def = this.options["def"];

      this.drop_zone = this.app.$el.find('.table_content');
      this.mapper = this.def.mapper.en;
      this.key = this.def["id"];
      this.gt = this.app.get_text;
      this.state = this.app.state;
      this.dept = this.state.get("dept");
      this.lang = this.state.get("lang");
      this.data = this.dept['mapped_data'][this.key][this.lang];
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
        "gt" : this.app.get_text,
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

      this.fnv = new footnoteView({
        app : this.app,
        footnotes : footnotes,
        btn : this.fn_btn
      });
      
      this.drop_zone.append(this.$el);

      var that = this;
      setTimeout(function(){
        APP.dispatcher.trigger("new_details_view",that);
      });
      return this;
    }
    ,tear_down : function(e){
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


  APP.dispatcher.once("app_ready", function(app){
    APP.dispatcher.on("table_selected", function(table){
       setTimeout(function(){scrollTo(0,0)});
       app.state.set({'table':table});

       var dv = new DetailsView({
         app : app,
         def: table.attributes
       });
       dv.render();
       $('.panels').hide();
    });
  });

})();
