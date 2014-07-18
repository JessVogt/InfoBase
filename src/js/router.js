/**
 * $.parseParams - parse query string paramaters into an object.
 */
(function($) {
  var re = /([^&=]+)=?([^&]*)/g;
  var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
  var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
  $.parseParams = function(query) {
      var params = {}, e=re.exec(query);
      while ( e ) { 
          var k = decode( e[1] ), v = decode( e[2] );
          if (k.substring(k.length - 2) === '[]') {
              k = k.substring(0, k.length - 2);
              (params[k] || (params[k] = [])).push(v);
          } else {
            params[k] = v;
          }
          e =re.exec(query);
      }
      return params;
  };
})(jQuery);

(function() {
  var APP = ns('APP');
  var DETAILS = ns("DETAILS");
  var TABLES = ns('TABLES');
  var STORY = ns("STORY");
  var D3 = ns("D3");

 // as modules are loaded, they can declare their routes
 // and routing functions
 APP.add_container_route = function(pattern, func_name,func ){
   container_routes.push({
     pattern : pattern,
     func_name : func_name,
     func : func
   });
 };

 var container_routes = [];

  APP.AppRouter = Backbone.Router.extend({
    initialize : function(options){
      this.app = options.app;
      this.gt = this.app.get_text;
      var that = this;

      this.bread_crumb = $('#gcwu-bc-in ol');
      this.bread_crumb.find("li:last").addClass("infobase-links");

      this.start_crumb = {html : this.app.get_text("title"), href : "#start"};

      this.home_crumb = {html : this.app.get_text("home"), href : "#home"};

      $(document).on("click", "#app a",function(e){
        if ($(e.target).attr("href") === "#"){
          e.preventDefault();
        }
      });

      $(document).on("click", "a.scroll",function(e){
        var el = $($(e.target).attr("href"));
        scrollTo(0,el.position().top);
        e.preventDefault();
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
      _.each(container_routes, function(container_route){
        var func_name = container_route.func_name,
            pattern = container_route.pattern,
            func = container_route.func,
            container = $('<div>')
                          .attr("id",func_name)
                          .addClass("grid-8");

        that.containers[func_name]=container;
        that.route(pattern,func_name, function(){
          // remap the other language link
          var ref = $('li#gcwu-gcnb-lang a');
          var link = ref.attr("href").split("#")[0];
          ref.attr("href",link+window.location.hash);

          that.show(container);
          window.scrollTo(0, $('.nav_area').position().top);

          $(".nav_area .right").html("");
          $(".nav_area .left").html("");
          // always pass the raw dom object, the module wlil wrap it in either
          // jquery or d3.select
          var rtn = func.apply(that, [container[0]].concat(_.map(arguments,_.identity)));
        });
      });
    },

    routes : {
      "*splat"  : "default"
    },

    default : function(route){
     if (!route){ return; }
     this.containers.start.html("");
     this.navigate("start",{trigger:true});
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
    }
  });
})();

