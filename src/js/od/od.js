(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');
  var LANG = ns('LANG');
  var PARSER = ns('PARSER');
  var WAIT = ns('WAIT');

  function lang_load(promises,data){
   LANG.lookups = PARSER.parse_lang(d3.csv.parseRows(data));
  };
  function table_text_load(promises,data){
    $('html').append(data);
  };
  function template_load(promises,data){
    $('html').append(data);
  };
  function org_load(promises,data){
    window.depts = PARSER.parse_orgs(d3.csv.parseRows(data));
  };
  function sos_load(promises,data){
    window.sos = PARSER.parse_sos(d3.csv.parseRows(data));
  };
  function qfr_links_load(promises,data){
    promises['Organizations'].done(function(){
      PARSER.parse_qfrlinks(window.depts, d3.csv.parseRows(data));
    });
  };

  APP.start = function(){
    // download initialization data files and when that's done,
    // parse the data and create a new app
    var lang = _.last(location.pathname.replace(".html",""),3).join("")=='eng' ? 'en' : 'fr';
    WAIT.w = WAIT.waitscreen(lang);
    var setup_material = {
      "Language" :  {url:"data/lang.csv", onload:lang_load},
      "Table Text" :  {url:"templates/od_table_text.html", onload:table_text_load},
      "Templates" :  {url:"templates/od_handlebars_templates.html", onload:template_load},
      "Organizations" :  {url:"data/orgs.csv", onload:org_load},
      "Standard Objects" :  {url:"data/sos.csv", onload:sos_load},
      "QFR Links" :  {url:"data/QFRLinks.csv", onload:qfr_links_load},
    };
    var promises = _.object(_.map(setup_material,function(obj,key){
      var promise1 = $.Deferred(),promise2 = $.Deferred();
      WAIT.w.update_item(key,"download");
      var req = $.ajax(obj.url)
      req.done(function(data){
        WAIT.w.update_item(key,"loading");
        _.delay(promise1.resolve,0,data);

      });
      promise1.done(function(data){
        obj.onload(promises,data);
        WAIT.w.update_item(key,"finished");
        _.delay(promise2.resolve,0);
      })
      return [key,promise2];
    }));
    $.when.apply(null,_.values(promises)).done(function(){
      APP.app = new APP.appView({
        state : {
          "lang":lang,
          "use_footer":false,
          "min_tot":true,
          "goc_tot":true
        }});
    });
  }

  APP.dispatcher.on("data_loaded",function(app){
    window.mins = d3.nest()
      .key(function(d){ return d.min.en})
      .map(_.values(window.depts));
    APP.dispatcher.trigger("app_ready",app);
    Backbone.history.start();
  });

  APP.AppRouter = Backbone.Router.extend({
    initialize : function(options){
      this.app = options.app;
      _.bindAll(this,"nav");
    },
    routes: {
      ":splat": "nav"  // #AGR
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

  APP.welcomeView = Backbone.View.extend({
    template : '#home_t',
    initialize: function(){
      _.bindAll(this,"render");
      this.template = APP.t(this.template);
      this.app = this.options.app;
      this.app_area = $('#app');
    },
    render : function(){
      this.app.remove();
      this.app_area.html(this.template({
        greeting : APP.t('#greeting_'+this.app.lang)()
      }));
      this.app.app = this.app_area.find('.dept_zone');
      APP.dispatcher.trigger_a("home",this.app);
    }
  });

  APP.dispatcher.on("home",function(app){
    ns().D3.bubbleDeptList(app);
    //ns().D3.horizontal_gov(app);
  });
  APP.dispatcher.on("reset",function(app){
    (new  APP.welcomeView({app:app})).render();
  });

  /************APP VIEW***********/
  APP.appView = Backbone.View.extend({
    el : $('body')
    ,events : {
      "click #lang_change" : "toggle_lang",
      "click a.home" : "reset",
      "hover .horizontal" : "highlighter"
    }
    ,initialize: function(){
      _.bindAll.apply(this,[this].concat(_.functions(this)));

      this.state = new APP.stateModel(_.extend({app:this},this.options.state));

      APP.dispatcher.trigger("init",this);

      //initialize values
      this.lang = this.state.get("lang");
      // check for a language or set the default of english
      this.state
        .on("change:lang", this.render)
        .on("change:lang", this.reset_dept)
        .on("change:lang", this.lang_change)
        .on("change:dept",this.dept_change);

      this.render();

      this.router = new APP.AppRouter({app:this});

    },
    dept_change : function(model, attr){
      this.router.navigate(attr.accronym);
      APP.dispatcher.trigger("dept_selected",this);
      APP.dispatcher.trigger("dept_ready",this);
    },
    formater : function(format,val){
      return APP.types_to_format[format](val,this.lang);
    },
    lang_change : function(state,lang){
      APP.dispatcher.trigger("lang_change",lang);
    },
    get_text : function(txt){
      return LANG.l(txt,this.state.get('lang'));
    },
    toggle_lang : function(){
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
      APP.dispatcher.trigger("reset",this);
    }
    ,highlighter : function(e){
       $(e.currentTarget).toggleClass('alert-info');
    }
    ,render: function(){
      this.remove();
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
    // if no department is selected, then paint a welcome screen
    // 
    if (!app.state.get("dept")){
      (new  APP.welcomeView({app:app})).render();
    } 

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

    // create a new organization view and link its rendering to 
    // the dept_ready signal
    var org_view = new APP.OrgView({app:app});
    APP.dispatcher.on("dept_ready", org_view.render);

    // when a new org view has been fully created, add additional 
    // stuff to the screen such as all the mini widgets and the list of 
    // all other departments in the same ministry
    APP.dispatcher.on("new_org_view",function(view){
      // scroll to hte top of the window
      window.scrollTo(0, $('h1.dept').position().top);

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


    // go directly to a table if there one is already active
    APP.dispatcher.on("mini_tables_rendered", function(ctx){
      if (ctx.current_view){
        APP.dispatcher.trigger_a("table_selected",ctx.current_view.table);
      }
    });
  });                                   

})();
