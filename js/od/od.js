(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');
  var LANG = ns('LANG');

  /************APP VIEW***********/
  APP.appView = Backbone.View.extend({
    el : $('body')
    ,template : _.template($('#home_t').html())
    ,events : {
      "click #lang_change" : "toggle_lang"
      ,"click a.home" : "reset"
      ,"hover .horizontal" : "highlighter"
      ,"click .horizontal" : "horizontal_explore"
    }
    ,initialize: function(){
      _.bindAll(this);
      this.state = new APP.stateModel({app:this})
      //initialize views
      sub_view_args = {app: this};
      this.modal_view = new APP.modalView(sub_view_args);
      this.dept_info_view  = new APP.deptInfoView(sub_view_args);
      this.full_dept_list = new APP.fullDeptList(sub_view_args);
      this.setup_useful_this_links();
      // check for a language or set the default of english
      this.state
        .on("change:lang", this.render)
        .on("change:lang", this.reset_dept)
        .on("change:lang", this.lang_change)
        .on("change:dept",this.dept_change);
      APP.dispatcher.trigger_a("app_ready",this);
    }
    ,dept_change : function(model, attr){
      APP.dispatcher.trigger("dept_selected",this);
      APP.dispatcher.trigger("dept_ready",this);
    }
    ,setup_useful_this_links : function(){
      this.nav_bar_ul = $('#navbar_ul');
      this.title = $('#title');
      this.change_lang = $('#lang_change');
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
      var dept = this.state.get('dept');
      if (!dept){ return }
      this.state.unset("dept",{silent:true});
      this.state.set('dept',dept)
    }
    ,reset : function() {
       this.state.clear({silent:true});
       this.state.set({lang : this.lang});
    }
    ,highlighter : function(e){
       $(e.currentTarget).toggleClass('alert-info');
    }
    ,render: function(model,attr){
      if (this.state.get("dept")){ return;}
      this.remove();
      // get faster reference 
      this.lang = attr;
      var gt = this.get_text;
      this.change_lang.html(gt("lang"));
      this.title.html(gt("title"));
      this.app.html(this.template({
        gt : gt
      }));

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

  APP.dispatcher.on("home", function(app){
    // ensure the two panels are equal sized 
    app.app.find('.well').height(
      _.max(app.app.find('.well').map(function(x,y){return $(y).height()}))
    );
    // remove the narbar elements
    $('.nav_bar_ul').children().remove()
    // shutdown the existing auto-complete and setup the new one
    if (app.auto_complete){
      app.auto_complete.stopListening();
    }
    app.auto_complete = new APP.autocompleteView({
      el : $('.home .dept_search')
      ,app : app
    });
  });

  APP.dispatcher.on("dept_ready",function(app){
    var vertical_navbar = _.template($('#ver_navbar_t').html());
    $('.nav_bar_ul').children().remove();
    $('.nav_bar_ul').append(vertical_navbar({
      gt : app.get_text
    }));
    if (app.auto_complete){
      app.auto_complete.stopListening();
    }
    app.auto_complete = new APP.autocompleteView({
      el : $('.nav_bar_ul .dept_search')
      ,app : app
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
      APP.dispatcher.trigger_a("table_selected",ctx.current_view.table);
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
