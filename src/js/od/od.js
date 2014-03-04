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
    WAIT.w.teardown();
    window.mins = d3.nest()
      .key(function(d){ return d.min.en})
      .map(_.values(window.depts));
    window.dept_name_map = _.chain(window.depts)
      .map(function(dept){
        return [dept.dept[app.state.get("lang")],dept];
      })
      .object()
      .value();
    APP.dispatcher.trigger_a("app_ready",app);
  });

  APP.dispatcher.on("app_ready",function(app){
    Backbone.history.start();
  });

  /************APP VIEW***********/
  APP.appView = Backbone.View.extend({
    el : $('body')
    ,events : {
      "click #lang_change" : "toggle_lang",
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

      this.render();

      this.router = new APP.AppRouter({app:this});

    },
    formater : function(format,val){
      if (_.has(APP.types_to_format,format)){
        if (_.isArray(val)){
          return _.map(val, function(v){ return this.formater(format,v)},this);
        } else if (_.isObject(val)){
          return _.chain(val)
            .map(function(v,k){ return [k,this.formater(format,v)]},this)
            .object()
            .value();
        } else  if (_.isString(val)){
          return val;
        } else {
          return APP.types_to_format[format](val,this.lang);
        }
      } 
      return val;
    },
    list_formater : function(formats,vals){
      // formats can be either an array of values or one single one
      // which will be duplicated for each item in vals
      if (!_.isArray(formats)){
        formats = _.map(vals, function(){ return formats});
      }
      return _.map(formats, function(format,i){
        return this.formater(format,vals[i]);
      },this);
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

   APP.dispatcher.on("dept_ready", function(container,app,dept){
      // create a new organization view and link its rendering to 
      // the dept_ready signal
      var org_view = new APP.OrgView({app:app, dept:dept,container:container});
      org_view.render();
   });

  // when a new org view has been fully created, add additional 
  // stuff to the screen such as all the mini widgets and the list of 
  // all other departments in the same ministry
  APP.dispatcher.on("new_org_view",function(app, view){
    // scroll to hte top of the window
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
  APP.dispatcher.on("table_selected", function(app, dept,table){
    var dept = app.state.get("dept").accronym;
    app.router.select_dept(dept,table);
    setTimeout(function(){scrollTo(0,0)});
    app.state.set({'table':table});

    var dv = new APP.DetailsView({
      app : app,
      def: table.attributes
    });
    dv.render();
    $('.panels').hide();
  });


})();
