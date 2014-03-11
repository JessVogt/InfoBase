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
  var WIDGET = ns("WIDGET");
  var DETAILS = ns("DETAILS");
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
        that.containers[func_name]=container;
        that.route(key,func_name, function(){
          that.show(container);
          window.scrollTo(0, $('.nav_area').position().top);
          $(".nav_area .right").html("");
          $(".nav_area .left").html("");
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
      "d-:org": "org_widget_view", // #d-AGR      
      "t-:org-:table": "org_table_details_view", // #t-AGR-table1
      "infograph" : "infographic",  //#inforgraph
      "infograph-:org"  : "infographic_org",  //#inforgraph/AGR
      "explore-:method"  : "explore",  //#explore
      "adv"  : "home", //#analysis
      "analysis-:config"  : "analysis"  //#analysis
    },

    show : function(container){
      _.each(_.values(this.containers), function(x){ x.detach();});
      $('#app').append(container);
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
      if (!this.app.full_org_list){
        this.app.full_org_list = new APP.searchOrg({ app: this.app, container : container });
        this.app.full_org_list.render();
      }
    },

    home : function(container){
      this.add_crumbs([this.home_crumb]);
      this.add_title("home");
      container.html(APP.t('#home_t')());
    },

    org_widget_view: function(container, org) {
      container.children().remove();
      org = window.depts[org];
      if (org){
        this.app.state.set("dept",org);
        this.app.state.unset("table");
        var title = org.dept[this.app.lang];
        this.add_crumbs([this.home_crumb,{html: title}]);
        this.add_title($('<h1>').html(title));
        WIDGET.OrgWidgetView(this.app, container);
      // if the wrong department code is sent, redirect to the home page
      } else {
        this.navigate("#adv",{trigger: true});
      }
    },

    org_table_details_view : function(container,org,table){
      container.children().remove();
      org = window.depts[org];
      if (org){
        this.app.state.set("dept",org);
      }
      table = "table" + table;
      table = _.find(TABLES.tables,function(t){ return t.id === table;});
      if (table){
        this.app.state.set({table:table},{silent:true});
      } else {
        this.navigate("#d-"+org.accronym,{trigger: true});
      }
      // check to see if the selected table has data for the department
      if (table.depts[org.accronym]) {
        var title =  table.name[this.app.lang];
        this.add_title($('<h1>').html(title));
        this.add_crumbs([this.home_crumb,
            {html : org.dept[this.app.lang],href : "#d-"+org.accronym},
            {html: title}]);
        new DETAILS.OrgTabletView( this.app,table, container);
      // if there aren't any data, redirect to the widget view 
      } else {
        this.navigate("#d-"+org.accronym,{trigger: true});
      }
    },

    infographic : function(container){
      this.add_crumbs([this.home_crumb,{html: "Infographic"}]);
      
     this.add_title($('<h1>').html("Infographic"));
     this.app.explore =  D3.STORY.story(container, this.app);
    },

    infographic_org : function(container,org){
      org = orgs[org];
      if (org){
        this.app.state.set("dept",org);
      }
      var title =  org.dept[this.app.lang] + " Infographic";
      this.add_crumbs([this.home_crumb,{html: title}]);
      this.add_title($('<h1>').html(title));
      container.children().remove();
      D3.STORY.story(container, this.app, org.accronym);
    },

    explore : function(container, method){
      this.add_crumbs([this.home_crumb,
          {html: "Explore"}]);
      this.add_title($('<h1>').html("Explore"));
      if (!this.app.explorer){
        this.app.explorer = D3.bubbleOrgList(this.app, container, method);
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

