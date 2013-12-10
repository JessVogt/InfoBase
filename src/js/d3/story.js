(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');
  var STORY = ns('D3.STORY');

    D3.story =  function(app){
      return new _story(app);
    };

    _story = function(app){
      this.chapters = [];


    };

    var storyp = _story.prototype;

    storyp.add_chapter = function(options){
      this.chapters.push(new chapter(options));
    };

    STORY.chapter = function(app,options){
      return new _chapter(app,options);
    };               

    var _chapter = function(app,options){
      _.bindAll(this, _.functions(this));
      this.gt = app.get_text;
      this.history = options.history || false;
      this.target = options.target;
      if (this.history) {
        this.el = this.make_section_with_history();
      }else {
        this.el = this.make_section();
      }
    };

    var chapterp = _chapter.prototype;

    chapterp.text_area = function(){
      return this.el.select(".text");
    }

    chapterp.graph_area = function(){
      return this.el.select(".graphic");
    }

    chapterp.history_area = function(){
      return this.el.select(".history");
    }

    chapterp.make_section_with_history = function(){
      var el = this.make_section();
      el.append("div").attr("class","span-8 border-all margin-top-none")
        .append("a")
          .html(this.gt("previous_year_fisc"))
          .on("click", this.expand_historical); 
      el.append("div").attr("class", "span-8 history ui-screen-hidden");
      return el;
    };

    chapterp.expand_historical = function(e){
      var parent = d3.event.target.parentNode.parentNode,
          el = d3.select(parent).select(".history");
      el.classed("ui-screen-hidden",!el.classed("ui-screen-hidden"));
    }

    chapterp.make_section = function(){
      var el =  this.target
        .append("div")
        .attr("class","span-8 history_chapter border_all");
      el.append("div").attr("class","span-4 text margin-bottom-none margin-left-none");
      el.append("div").attr("class","span-4 graphic margin-bottom-none margin-left-none");
      el.append("div").attr("class","clear margin-bottom");
      return el;
    };

})();

