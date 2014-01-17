(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');
  var STORY = ns('D3.STORY');

    STORY.chapter = function(options){
      return new _chapter(options);
    };               

    var _chapter = function(options){
      _.bindAll(this, _.functions(this));
      var toggles = options.toggles || [];
      this.el = options.target.append("div").attr("class","span-8 border-all");
      this.dispatch = d3.dispatch("toggle","hover");
      this.toggle_sections = [];
      // add the main section
      add_section(this.el);

      _.each(toggles, function(toggle_section){
          var new_section= this.add_toggle_section(this.el,toggle_section.toggle_text);
          this.toggle_sections.push(new_section);
          if (toggle_section.add_divider){
            add_section(new_section);
          }
      },this);

    };

    var chapterp = _chapter.prototype;

    chapterp.text_area = function(){
      return this.el.select(".text .inner");
    }

    chapterp.graph_area = function(){
      return this.el.select(".graphic");
    }

    chapterp.toggle_area = function(index){
      index = index || 0;
      return this.toggle_sections[index];
    }

    chapterp.add_toggle_section = function(target,text){
      var toggler = target.append("div").attr("class","span-8 toggler margin-top-none")
        .append("a")
          .html(text)
          .on("click", this.onToggle); 
      var div = target.append("div").attr("class", "span-8 toggle ui-screen-hidden");
     toggler.datum(div);
     return div
    }

    chapterp.onToggle = function (e){
      var target = d3.select(d3.event.target),
          el = target.datum(),
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
      var el =  target,
          span = is_mobile ? "span-8" : "span-4"
      el.append("div").attr("class",span +" text margin-bottom-none margin-left-none");
      el.select(".text")
        .append("div")
        .attr("class", "inner margin-top-large margin-left-large")
        .style({ "font-size" : "20px" });
      el.append("div").attr("class",span +" graphic margin-bottom-none margin-left-none");
      el.append("div").attr("class","clear margin-bottom");
    }

})();

