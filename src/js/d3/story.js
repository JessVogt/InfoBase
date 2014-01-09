(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');
  var STORY = ns('D3.STORY');

    STORY.chapter = function(options){
      return new _chapter(options);
    };               

    var _chapter = function(options){
      _.bindAll(this, _.functions(this));
      this.el = options.target.append("div")
        .attr("class","span-8 border-all");

      this.dispatch = d3.dispatch("toggle","hover");

      add_section(this.el);

      if (options.add_toggle_section) {
        this.add_toggle_section(this.el,options.toggle_text);
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

    chapterp.add_toggle_section = function(target,text){
      target.append("div").attr("class","span-8 toggler margin-top-none")
        .append("a")
          .html(text)
          .on("click", this.onToggle); 
      target.append("div").attr("class", "span-8 toggle ui-screen-hidden");
    }

    chapterp.onToggle = function (e){
      var parent = d3.event.target.parentNode.parentNode,
          el = d3.select(parent).select(".toggle"),
          new_state = !el.classed("ui-screen-hidden")
      el.classed("ui-screen-hidden",new_state);
      _.delay( this.dispatch.toggle,0,new_state ? "closed" : "open");
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
      el.append("div").attr("class","span-4 text margin-bottom-none margin-left-none");
      el.select(".text")
        .append("div")
        .attr("class", "inner margin-top-large margin-left-large")
        .style({ "font-size" : "20px" });
      el.append("div").attr("class","span-4 graphic margin-bottom-none margin-left-none");
      el.append("div").attr("class","clear margin-bottom");
    }

})();

