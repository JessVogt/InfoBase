(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');
  var STORY = ns('D3.STORY');

    STORY.chapter = function(options){
      return new _chapter(options);
    };               

    var _chapter = function(options){
      _.bindAll(this, _.functions(this));
      this.el = options.target.append("div");

      add_section(this.el);

      if (options.add_toggle_section) {
        add_toggle_section(this.el,options.toggle_text);
      } 
      if (options.add_section_to_toggle){
        add_section(this.el.select(".toggle"));
      }
    };

    var chapterp = _chapter.prototype;

    chapterp.text_area = function(){
      return this.el.select(".text .inner");
    }

    chapterp.graph_area = function(){
      return this.el.select(".graphic");
    }

    chapterp.toggle_area = function(){
      return this.el.select(".toggle");
    }

    function add_toggle_section(target,text){
      target.append("div").attr("class","span-8 toggler margin-top-none")
        .append("a")
          .html(text)
          .on("click", expand); 
      target.append("div").attr("class", "span-8 toggle ui-screen-hidden");
    }

    function expand(e){
      var parent = d3.event.target.parentNode.parentNode,
          el = d3.select(parent).select(".toggle");
      el.classed("ui-screen-hidden",!el.classed("ui-screen-hidden"));
    }

    function add_section(target){
      /*
       * adds a 
       * div.span-8
       *   div.span-4.text
       *     div.inner
       *   div.span-4.graphic
       */
      var el =  target
        .append("div")
        .attr("class","span-8 border-all");
      el.append("div").attr("class","span-4 text margin-bottom-none margin-left-none");
      el.select(".text")
        .append("div")
        .attr("class", "inner margin-top-large margin-left-large")
        .style({
          "position" : "absolute",
          "font-size" : "20px"
        });
      el.append("div").attr("class","span-4 graphic margin-bottom-none margin-left-none");
      el.append("div").attr("class","clear margin-bottom");
    }

})();

