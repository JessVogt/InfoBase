(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var STORY = ns("STORY");
  var D3 = ns("D3");


  APP.AppRouter = Backbone.Router.extend({
    initialize : function(options){
      var that = this;
      $(document).on("click", "a.router",function(e){
        that.navigate($(e.target).attr("href"),{trigger:true});
      });
      // when this number is larger than 0, a back button can be clicked
      // to return to the previous location in the app
      this.nav_counter = -1;
      this.on("route",function(){ that.nav_counter++; });

      this.app = options.app;
      this.containers = {};
      // for each of the defined routes
      //  1 - create a container and apply an id equal to the function name
      //  2 - append the container to the #app div
      //  3 - keep a reference to the container based on the function name
      //  4 - wrap the function in a call which will ensure associated container
      //      is made visible when that route is called
      _.each(this._routes, function(func_name,key){
        var container = $('<div>').attr("id",func_name),
            func = that[func_name];
        $('#app').append(container);
        that.containers[func_name]=container;
        that.route(key,func_name, function(){
          that.last_container = that.current_container;
          that.show(container);
          window.scrollTo(0, $('.nav_area').position().top);
          $(".nav_area .right").html("");
          $(".nav_area .left").html("");
          if (func_name != 'start') {
             $('<a>')
               .prop("href","#start")
               .addClass("restart_button router") 
               .html(that.app.get_text("restart"))
               .css({
                 "position" : "absolute",
                 "bottom" : "10px",
                 "right"  : "0px"
               })
               .appendTo(".nav_area .right");
          }
          func.apply(that, [container].concat(_.map(arguments,_.identity)));
        });
      });
    },
    can_go_back : function(){
      return this.nav_counter >0;
    },
    routes : {
      "*splat"  : "default"
    },
    default : function(){
     this.containers["start"].html("");
     this.navigate("start",{trigger:true});
    },
    _routes: {
      "start"  : "start",  //#start
      "search" :  "search", // #search
      "d-:dept": "basic_dept_view", // #d-AGR
      "t-:dept-:table": "basic_dept_table_view", // #d-AGR-1
      "infograph" : "infographic",  //#inforgraph
      "infograph-:dept"  : "infographic_dept",  //#inforgraph/AGR
      "explore-:method"  : "explore",  //#explore
      "analysis"  : "analysis"  //#analysis
    },
    back : function(){
     this.show(this.last_container);
    },
    show : function(container){
      _.each(_.values(this.containers), function(x){ x.hide();});
      container.show();
      this.current_container = container;
    },
    add_title : function(title){
      if (_.isString(title)){
        title = $('<h1>').html(this.app.get_text(title));
      }
      $(".nav_area .left").append(title);
    },
    start : function(container){
      var inside = APP.t('#greeting_'+this.app.lang)();
      var outside = APP.t("#greeting")({greeting : inside});
      this.app.reset();

      APP.dispatcher.trigger("reset",this.app);
      container.html(outside);
      this.add_title("welcome");
      APP.dispatcher.trigger_a("home",this.app);
    },
    search : function(container){
      this.add_title("search");
      if (!this.app.full_dept_list){
        this.app.full_dept_list = new APP.fullDeptList({ app: this.app, container : container });
        this.app.full_dept_list.render();
      }
    },

    basic_dept_view: function(container, dept) {
      var dept = depts[dept];
      if (dept){
        this.app.state.set("dept",dept);
      }
      var title = this.app.get_text("fin_data")+ " "+ dept.dept[this.app.lang];
      this.add_title($('<h1>').html(title));
      APP.dispatcher.trigger("dept_selected",container,this.app, dept);
      APP.dispatcher.trigger("dept_ready",container,this.app, dept);
    },

    basic_dept_table_view : function(container,dept,table){
      var dept,table,args = dept_table.split("_");
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

    },
    infographic : function(container){
     this.add_title($('<h1>').html("Explore"));
     this.app.explore =  D3.STORY.story(container, this.app);
    },
    infographic_dept : function(container,dept){
      var dept = depts[dept];
      if (dept){
        this.app.state.set("dept",dept);
      }
      var title =  dept.dept[this.app.lang] + " Infographic";
      this.add_title($('<h1>').html(title));
      container.children().remove();
      D3.STORY.story(container, this.app, dept.accronym);
    },
    explore : function(container, method){
      if (!this.app.explorer){
        this.app.explorer = D3.bubbleDeptList(this.app, container, method);
      } else {
        this.app.explorer.setup(method);
      }
    },
    analysis: function(container){
     this.add_title($('<h1>').html("Horizontal Analysis"));
      if (!this.app.analysis){
        this.app.analysis =   ns().D3.horizontal_gov(this.app,container);
      }
    }
  });


})();

