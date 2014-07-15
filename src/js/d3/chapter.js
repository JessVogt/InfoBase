(function(root) {

  var APP = ns('APP');
  var D3 = ns('D3');
  var STORY = ns('D3.STORY');

  STORY.chapter = function(options){
    return new _chapter(options);
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

  STORY.center_text = center_text;

  var _chapter = function(options){
    _.bindAll(this, _.functions(this));
    var classes = options.classes || "";
    var toggles = options.toggles || [];
    var span = options.span || (is_mobile ? "span-8" : "span-4");

    this.el = options.target.append("div").attr("class","chapter span-8 border-all "+classes );

    this.el.append("div").html(APP.t("#chapter_t")({ span:span }));

    if (options.is_toggle){
       STORY.add_toggle_section(this.el.select(".title"), this.el.select(".content"));
    }

    this.toggle_sections = _.chain(toggles)
      .map(function(toggle){
        toggle.target = options.target;
        toggle.is_toggle = true;
        return [toggle.key, STORY.chapter(toggle)];
      })
      .object()
      .value();

    if (!options.is_toggle){
      //clear the div
      //this will align the chapters vertically
      options.target.append("div")
        .attr("class","clear")
        .style("margin-bottom","15px");
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

  var chapterp = _chapter.prototype;

  chapterp.change_span = function(span){
    this.el.selectAll(".text,.graphic")
      .classed("span-4", false)
      .classed("span-8", false)
      .classed(span, true);
    return this;
  };

  chapterp.remove = function(){
     this.el.remove();
  };

  chapterp.child = function(key){
     return this.toggle_sections[key];
  };

  chapterp.add_text = function(text){
     if (_.isString(text)){
       this.areas().text.html(text);
     } else {
       this.areas().text.node().appendChild(text);
     }
     return this;
  };


  chapterp.add_source = function (sources){
    // sources = [
    //  { href: "", html : ""},
    //  { href: "", html : ""},
    // ]
    this.el.select(".source")
           .html("Source: ")
           .data(sources)
           .append("a")
           .attr("class","router")
           .attr("href",function(d){return d.href;})
           .html(function(d){return d.html;});
    return this;
  };

  chapterp.split_graph = function(){
    // sometimes its handy to have two graphs side by side
    var graph = this.areas().graph;
    graph.append("div").attr("class","first");
    graph.append("div").attr("class","second");
    graph.selectAll("div")
      .style("position","relative")
      .style("width","49%")
      .style("float", "left");
    return this;
  }

  chapterp.areas = function(){
    return {
      text :  this.el.select(".text .inner"),
      title :  this.el.select(".title"),
      source : this.el.select(".source"),
      graph : this.el.select(".graphic")
    };
  };

  STORY.add_toggle_section = function(toggler,togglee){
    toggler.classed("toggler",true).on("click", function (e){
      //toggle the hidden state
      var closed = !togglee.classed("ui-screen-hidden");
       togglee.classed("ui-screen-hidden",closed);
       if (!closed){
         toggler.style({"background-color":"#f5f5f5", "border-bottom": " 1px solid #CCC"});
       } else {
         toggler.style({"background-color":"#FFF", "border-bottom": " 0px solid #CCC"});
       }
    });
    togglee.classed("togglee",true);
  };

})();
