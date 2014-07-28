(function(root) {

  var APP = ns('APP');
  var D3 = ns('D3');
  var PANEL = ns('D3.PANEL');

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
           var my_height = this.offsetHeight;
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

  PANEL.panel_collection = function(collection_options){

    this.target = collection_options
      .target
      .append("div")
      .style({"margin-bottom": "15px"});

    this.panels = [];

    this.add_panel = function(panel_options){
      panel_options = panel_options || {};
      // copy over the default arguments
      panel_options.collection = this;
      panel_options.target = this.target;
      panel_options.center = true;
      // all panels after the first in a collection will be 
      // hidden by default
      if (this.panels.length > 0){
         panel_options.toggle = true;
         if (collection_options.auto_hide){
           panel_options.auto_hide = true;
         }
      }
      this.panels.push(PANEL.panel(panel_options));

      return _.last(this.panels);
    };

    this.remove = function(panel){
      //var next_sibling_i = _.indexOf(this.panels,panel)+1;
      //var next_sibling = this.panels[next_sibling_i];
      //// === 1 is the case where the first panel is being removed,
      //// in this case, the second needs to be made visible
      //if (next_sibling_i === 1 && next_sibling){
      //  next_sibling.el.select(".content")
      //      .classed("ui-screen-hidden",false);
      //}
      this.panels = _.without(this.panels, panel);
    };

  };

  PANEL.panel = function(options){
    return new _panel(options);
  };

  PANEL.center_text = center_text;

  var _panel = function(options){
    _.bindAll(this, _.functions(this));

    this.collection = options.collection;

    this.span = options.span || (is_mobile ? "span-8" : "span-4");

    this.el = options.target
                      .append("div")
                      .html(APP.t("#panel_t")({ span:this.span }));

    if (options.id) {
      this.el.attr("id",options.id);
    }
    if (options.classes) {
      this.el.attr("classe",options.classes);
    }
    if (options.toggle){
      PANEL.add_toggle_section(this.el.select(".title-out"), this.el.select(".content"));
    }
    if (options.off){
      if (!_.isArray(options.off)){
        options.off = [options.off];
      }
      _.each(options.off, function(option){
        this.areas()[option].remove();
      },this);
    }
    if (options.auto_hide){
      this.el.select(".togglee").classed("ui-screen-hidden",true);
    }
    if (options.center){
      // psas DOM object instead of wrapped
      PANEL.center_text(this.el.node());
    }
  };

  var panelp = _panel.prototype;

  panelp.change_span = function(span){
    this.el.selectAll(".text,.graphic")
      .classed(this.span, false)
      .classed(span, true);
    this.span = span;
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
    var sub_span = this.span === 'span-8' ? "span-4":"span-2";
    graph.append("div").attr("class","first "+sub_span);
    graph.append("div").attr("class","second "+sub_span);
    graph.selectAll("div").style("margin", "0px");
    graph.append("div").attr("class","clear");
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
