/**
 * $.parseParams - parse query string paramaters into an object.
 */
(function($) {
  var re = /([^&=]+)=?([^&]*)/g;
  var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
  var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
  $.parseParams = function(query) {
      var params = {}, e;
      while ( e = re.exec(query) ) { 
          var k = decode( e[1] ), v = decode( e[2] );
          if (k.substring(k.length - 2) === '[]') {
              k = k.substring(0, k.length - 2);
              (params[k] || (params[k] = [])).push(v);
          }
          else params[k] = v;
      }
      return params;
  };
})(jQuery);

(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var STORY = ns("STORY");
  var D3 = ns("D3");


  APP.AppRouter = Backbone.Router.extend({
    initialize : function(options){
      this.app = options.app;
      this.gt = this.app.get_text;
      var that = this;

      this.bread_crumb = $('#gcwu-bc-in ol');
      this.bread_crumb.find("li:last").addClass("infobase-links");

      this.start_crumb = {html : this.app.get_text("title"), href : "#start"};
      this.home_crumb = {html : this.app.get_text("home"), href : "#adv"};

      $(document).on("click", "a.router",function(e){
        that.navigate($(e.target).attr("href"),{trigger:true});
      });

      // when this number is larger than 0, a back button can be clicked
      // to return to the previous location in the app
      this.containers = {};
      // for each of the defined routes
      //  1 - create a container and apply an id equal to the function name
      //  2 - append the container to the #app div
      //  3 - keep a reference to the container based on the function name
      //  4 - wrap the function in a call which will ensure associated container
      //      is made visible when that route is called
      _.each(this._routes, function(func_name,key){
        var container = $('<div>')
                          .attr("id",func_name)
                          .addClass("grid-8"),
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
    routes : {
      "*splat"  : "default"
    },
    default : function(){
     this.containers.start.html("");
     this.navigate("start",{trigger:true});
    },
    _routes: {
      "start"  : "start",  //#start
      "search" :  "search", // #search
      "d-:dept": "basic_dept_view", // #d-AGR
      "t-:dept-:table": "basic_dept_table_view", // #d-AGR-table1
      "infograph" : "infographic",  //#inforgraph
      "infograph-:dept"  : "infographic_dept",  //#inforgraph/AGR
      "explore-:method"  : "explore",  //#explore
      "adv"  : "home", //#analysis
      "analysis-:config"  : "analysis"  //#analysis
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
    add_crumbs : function(crumbs){
      crumbs = crumbs || [];
      crumbs.unshift(this.start_crumb);
      this.reset_crumbs();
      var last = crumbs.pop();
      _.each(crumbs, function(crumb){
         this.bread_crumb.append(
          $('<li>')
          .addClass("infobase-links")
          .append(
            $("<a>")
              .addClass("router")
              .attr("href",crumb.href)
              .html(crumb.html)
            )
         );
      },this);
      this.bread_crumb.append(
        $('<li>')
        .addClass("infobase-links")
        .html(last.html)
      );
    },
    reset_crumbs : function(title){
       this.bread_crumb.find(".infobase-links").remove();
    },
    start : function(container){
      var inside = APP.t('#greeting_'+this.app.lang)();
      var outside = APP.t("#greeting")({greeting : inside});

      this.add_crumbs();
      this.app.reset();

      APP.dispatcher.trigger("reset",this.app);
      container.html(outside);
      this.add_title("welcome");
      APP.dispatcher.trigger_a("home",this.app);
    },
    search : function(container){
      this.add_crumbs([this.home_crumb,{html: this.gt("search")}]);
      this.add_title("search");
      if (!this.app.full_dept_list){
        this.app.full_dept_list = new APP.fullDeptList({ app: this.app, container : container });
        this.app.full_dept_list.render();
      }
    },
    home : function(container){
      this.add_crumbs([this.home_crumb]);
      this.add_title("home");
      container.html(APP.t('#home_t')());
    },
    basic_dept_view: function(container, dept) {
      dept = depts[dept];
      if (dept){
        this.app.state.set("dept",dept);
      }
      var title = this.app.get_text("fin_data")+ " "+ dept.dept[this.app.lang];
      this.add_title($('<h1>').html(title));
      APP.dispatcher.trigger("dept_selected",container,this.app, dept);
      APP.dispatcher.trigger("dept_ready",container,this.app, dept);
    },

    basic_dept_table_view : function(container,dept,table){
      dept = depts[dept];
      if (dept){
        this.app.state.set("dept",dept);
      }
      table = "table" + table;
      table = _.find(TABLES.tables,function(t){ return t.id === table;});
      if (table){
        this.app.state.set({table:table},{silent:true});
      }
      this.app.dept_table = new APP.DetailsView({
        app : this.app,
        table : table
      })


    },
    infographic : function(container){
      this.add_crumbs([this.home_crumb,{html: "Infographic"}]);
      
     this.add_title($('<h1>').html("Infographic"));
     this.app.explore =  D3.STORY.story(container, this.app);
    },
    infographic_dept : function(container,dept){
      dept = depts[dept];
      if (dept){
        this.app.state.set("dept",dept);
      }
      var title =  dept.dept[this.app.lang] + " Infographic";
      this.add_crumbs([this.home_crumb,{html: title}]);
      this.add_title($('<h1>').html(title));
      container.children().remove();
      D3.STORY.story(container, this.app, dept.accronym);
    },
    explore : function(container, method){
      this.add_crumbs([this.home_crumb,
          {html: "Explore"}]);
      this.add_title($('<h1>').html("Explore"));
      if (!this.app.explorer){
        this.app.explorer = D3.bubbleDeptList(this.app, container, method);
      } else {
        this.app.explorer.setup(method);
      }
    },
    analysis: function(container,config){
      if (config!== 'start') {
       config = $.parseParams(config);
      } 
      this.add_crumbs([this.home_crumb,{html: "Horizontal Analysis"}]);
      this.add_title($('<h1>').html("Horizontal Analysis"));
      this.app.analysis =   D3.HORIZONTAL.horizontal_gov(this.app,container,config);
    }
  });


})();

