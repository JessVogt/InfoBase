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
    ,template : _.template($('#home_t').html())
    ,initialize: function(){
      _.bindAll(this);
      this.state = new APP.stateModel({app:this})
      //initialize views
      sub_view_args = {app: this};
      this.switchLangv = new APP.switchLangView(sub_view_args);
      this.modal_view = new APP.modalView(sub_view_args);
      this.dept_info_view  = new APP.deptInfoView(sub_view_args);

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
      this.remove();
      // get faster reference 
      this.lang = attr;
      var gt = this.get_text;
      this.title.html(gt("title"));
      this.dept_sel.html(gt("select"))
      this.app.html(this.template({
        gt : gt
      }));

      setTimeout(_.bind(function(){
        APP.dispatcher.trigger("home",this);
      });

      var hover_func = function(e){
         $(e.currentTarget).toggleClass('alert-info');
      };
      this.app.find(".horizontal")
        .on("mouseenter mouseleave",hover_func)
        .on("click",this.horizontal_explore);

      var acv = new APP.autocompleteView(sub_view_args);
      var full_dept_list = new APP.fullDeptList(sub_view_args);
      this.app.find("a.dept-sel")
        .on("click",full_dept_list.render);

      var that=this;
      setTimeout(function(){
        that.app.find('.well').height(
          _.max(that.app.find('.well').map(function(x,y){return $(y).height()}))
        );
      });
    }
    ,horizontal_explore : function(){
      APP.dispatcher.trigger("horizontal_explore");
    }
    ,remove : function(){
      if (this.app){
        this.app.find('*').off();
        this.app.children().remove();
      }
    }
  });

  APP.VerticalView = Backbone.View.extend({
    ,initialize: function(){
      _.bindAll(this);

    }
    render : function(){


    }
  });

  APP.dispatcher.once("app_ready", function(app){
    APP.dispatcher.on("home", function(app){
      
    });
    APP.dispatcher.on("dept_ready",function(){


    });
  });

  APP.dispatcher.once("app_ready", function(app){
    var org_view = new APP.OrgView({app:app});
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
