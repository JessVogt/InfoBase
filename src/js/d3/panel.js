(function(root) {

  var APP = ns('APP');
  var D3 = ns('D3');
  var PANEL = ns('D3.PANEL');


  PANEL.panel_collection = function(options){

    options.container = options.container.append("div");

    this.panels = [];

    this.add_panel = function(_options){
      _.extend(_options, {collection : this},options);
      this.panels.push(PANEL.panel(_options));
    };

    this.remove = function(panel){
      var next_sibling_i = _.indexOf(this.panels,panel)+1;
      var next_sibling = this.panels[i];
      // === 1 is the case where the first panel is being removed,
      // in this case, the second needs to be made visible
      if (next_sibling_i === 1){
        next_sibling.el.select(".content");
      }
    };

  };

  PANEL.panel = function(options){
    return new _panel(options);
  };

  var center_text = function(container){
    container = $(container);
    // this function will vertically center all the inner text
    // based on the calculated height of the accompanying graphic
    if (!is_mobile){
      _.delay(function(){
         container.find(".text")
           .filter(function(){
             // filter the story panels to only the ones with
             // span-4 classes, span-8 will not need to be centered
             return $(this).hasClass("span-4");
           })
          .each(function(){
           var that = $(this);
           var my_height = that.height();
           var sibling_height = that.siblings(".graphic").height();
           var height = Math.max(my_height, sibling_height);
           if (height === 0 ) { return ;}
           that.height(height);
           that.find(".inner")
           .css({
             "position" : "absolute",
             "top" : (height - that.find(".inner").height())/2
           });
         });
      });
    }
  };

  PANEL.center_text = center_text;

  var _panel = function(options){
    _.bindAll(this, _.functions(this));

    this.collection = options.collection;

    var span = options.span || (is_mobile ? "span-8" : "span-4");

    this.el = options.target
                      .append("div")
                      .html(APP.t("#panel_t")({ span:span }));

    if (options.id) {
      this.el.attr("id",options.id);
    }
    if (options.classes) {
      this.el.attr("classe",options.classes);
    }
    if (options.toggle){
      PANEL.add_toggle_section(this.el.select(".title-out"), this.el.select(".content"));
    }
    if (options.clear){
      //clear the div
      //this will align the chapters vertically
      options.target.append("div").attr("class","clear").style("margin-bottom","15px");
    }
    // remove the title, source, graph, text  
    if (options.off){
      if (!_.isArray(options.off)){
        options.off = [options.off];
      }
      _.each(options.off, function(option){
        this.areas()[option].remove();
      },this);
    }
  };

  var panelp = _panel.prototype;

  panelp.change_span = function(span){
    this.el.selectAll(".text,.graphic")
      .classed("span-4", false)
      .classed("span-8", false)
      .classed(span, true);
    return this;
  };

  panelp.remove = function(){
    if (this.collection){
       this.collection.remove(this);
    }
    this.el.remove();
  };

  panelp.add_text = function(text){
     if (_.isString(text)){
       this.areas().text.html(text);
     } else {
       this.areas().text.node().appendChild(text);
     }
     return this;
  };


  panelp.add_source = function(sources){
    // sources = [
    //  { href: "", html : ""},
    //  { href: "", html : ""},
    // ]
    this.el.select(".source")
           .html("Source: ")
           .data(sources)
           .append("a")
           .attr("href",function(d){return d.href;})
           .html(function(d){return d.html;});
    return this;
  };

  panelp.split_graph = function(){
    // sometimes its handy to have two graphs side by side
    var graph = this.areas().graph;
    graph.append("div").attr("class","first");
    graph.append("div").attr("class","second");
    graph.selectAll("div")
      .style("position","relative")
      .style("width","49%")
      .style("float", "left");
    return this;
  };

  panelp.areas = function(){
    return {
      text :  this.el.select(".text .inner"),
      title :  this.el.select(".title"),
      source : this.el.select(".source"),
      graph : this.el.select(".graphic")
    };
  };

  PANEL.add_toggle_section = function(toggler,togglee){
    toggler.classed("toggler",true).on("click", function (e){
      //toggle the hidden state
      var closed = !togglee.classed("ui-screen-hidden");
      togglee.classed("ui-screen-hidden",closed);
    });
    togglee.classed("togglee",true);
  };

})();
