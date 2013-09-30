(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');
  var LANG = ns('LANG');

  //mock the stupid WET pe object for testing
  var pe = pe || {wb_load: function(){}};

  var create_template_func = function(app) {
      TABLES.m = function(s){
        var lang = app.state.get('lang');
        var args = TABLES.template_args['common'];
        _.extend(args,TABLES.template_args[lang]);
        if (s){
          return Handlebars.compile(s)(args);
        }
        return '';
      }
  }

  APP.AppRouter = Backbone.Router.extend({

    initialize : function(options){
      this.app = options.app;
      _.bindAll(this,"nav");
    },

    routes: {
      ":splat":              "nav"  // #AGR
    },


    nav: function(splat) {
      var dept,table,args = splat.split("_");
      dept = args[0];
      table = "table" + args[1];
      var table = _.find(TABLES.tables,function(t){ return t.id === table;});
      if (table){
        this.app.state.set({table:table},{silent:true});
      }
      var dept = depts[dept];
      if (dept){
        this.app.state.set("dept",dept);
      }
    }
  });

  /************APP VIEW***********/
  APP.appView = Backbone.View.extend({
    el : $('body')
    ,template : '#home_t'
    ,events : {
      "click #lang_change" : "toggle_lang"
      ,"click a.home" : "reset"
      ,"hover .horizontal" : "highlighter"
      ,"click .horizontal" : "horizontal_explore"
      //,"click a.page-nav" : "nav"
    }
    ,initialize: function(){
      this.template = APP.t(this.template);
      _.bindAll(this,"dept_change","setup_useful_this_links",
                "lang_change", "formater","get_text","toggle_lang",
                "reset_dept","reset","highlighter", "render",
                "horizontal_explore","remove" );
      this.state = new APP.stateModel({app:this})
      //initialize views
      this.setup_useful_this_links();
      // check for a language or set the default of english
      this.state
        .on("change:lang", this.render)
        .on("change:lang", this.reset_dept)
        .on("change:lang", this.lang_change)
        .on("change:dept",this.dept_change);
      create_template_func(this);
      APP.dispatcher.trigger("app_ready",this);
      this.router = new APP.AppRouter({app:this});
      Backbone.history.start();
    }
    ,dept_change : function(model, attr){
      APP.dispatcher.trigger("dept_selected",this);
      APP.dispatcher.trigger("dept_ready",this);
    }
    ,setup_useful_this_links : function(){
      this.nav_bar_ul = $('#navbar_ul');
      this.title = $('#title');
      this.app_area = $('#app');
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
      var dept = this.state.get('dept');
      if (!dept){ return }
      this.state.unset("dept",{silent:true});
      this.state.set('dept',dept)
    }
    ,reset : function() {
      this.router.navigate("");
      var min_tot = this.state.get("min_tot");
      var goc_tot = this.state.get("goc_tot");
      this.state.clear({silent:true});
      this.state.set({
        lang : this.lang
        ,min_tot : min_tot
        ,goc_tot : goc_tot
      });
    }
    ,highlighter : function(e){
       $(e.currentTarget).toggleClass('alert-info');
    }
    ,render: function(model,attr){
      this.change_lang = $('#lang_change');
      // get faster reference 
      this.lang = attr;
      var gt = this.get_text;
      this.title.html(gt("title"));
      this.remove();

      this.app_area.html(this.template({
        greeting : APP.t('#greeting_'+this.lang)()
      }));
      this.app = this.app_area.find('.dept_zone');

      if (this.state.get("dept")){ 
        return;
      }
      APP.dispatcher.trigger_a("home",this);
    }
    ,horizontal_explore : function(){
      APP.dispatcher.trigger("horizontal_explore",this);
    }
    ,remove : function(){
      if (this.app){
        this.app.find('*').off();
        this.app.children().remove();
      }
    }
  });

  // setup the OrgView and hook it into the dept_ready signal
  APP.dispatcher.once("app_ready", function(app){
    var org_view = new APP.OrgView({app:app});
    APP.dispatcher.on("dept_ready", org_view.render);

    APP.dispatcher.on("new_org_view",function(view){
      // create the drop down menu for ministries
      (new APP.otherDeptsDropDown({ app : app })).render();

      // render each of the tables
      _.each(TABLES.tables,function(table){
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

    // when a table is selected, hide the panels and show the 
    // requested table
    APP.dispatcher.on("table_selected", function(table){
      var dept = app.state.get("dept").accronym;
      app.router.navigate(dept+"_"+table.get("id").replace("table",""))
      setTimeout(function(){scrollTo(0,0)});
      app.state.set({'table':table});

      var dv = new APP.DetailsView({
        app : app,
        def: table.attributes
      });
      dv.render();
      $('.panels').hide();
    });
  });                                   

  // set state for all other depts in the current
  // ministry
  APP.dispatcher.on("dept_selected", function(app){
    var org = app.state.get("dept");
    var lang = app.state.get("lang");
    var ministry_depts = APP.find_all_in_ministry(org,lang);
    var other_depts = _.filter(ministry_depts,
     function(dept) {
       return dept['accronym'] != org['accronym'];
    }); 
    app.state.set("other_depts",other_depts); 
  });  

  // go directly to a table if there one is already active
  APP.dispatcher.on("mini_tables_rendered", function(ctx){
    if (ctx.current_view){
      APP.dispatcher.trigger_a("table_selected",ctx.current_view.table);
    }
  });


})();
