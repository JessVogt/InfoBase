(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');
  var STORY = ns('D3.STORY');

    STORY.chapter = function(options){
      return new _chapter(options);
    };               

    var center_text = function(container){
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
      var toggles = options.toggles || [];
      var header = options.header || "h3";
      var span = options.span || (is_mobile ? "span-8" : "span-4");

      this.el = options.target
        .append("div")
        .attr("class","span-8 border-all")
        .style({ "font-size" : "20px" });

      this.el.append(header).html("Title");
      
      //clear the div
      //this will align the chapters vertically
      options.target.append("div")
        .attr("class","clear")
        .style("margin-bottom","15px");
      this.dispatch = d3.dispatch("toggle","hover");
      this.toggle_sections = [];
      // add the main section
      add_section(this.el,false,span);
      // add in the source 
      
      if (options.sources) {
        add_source(this.el,options.sources);
      }

      _.each(toggles, function(toggle_section){
          var new_section= this.add_toggle_section(this.el,toggle_section.toggle_text);
          this.toggle_sections.push(new_section);
          if (toggle_section.add_divider){
            add_section(new_section,false,span);
          } else {
            add_section(new_section,true,span);
          }
          if (options.sources) {
            add_source(new_section,toggle_section.sources);
          }

      },this);
    };

    var chapterp = _chapter.prototype;

    chapterp.remove = function(){
       this.el.remove();
    };

    chapterp.add_title = function(title){
      this.el.append("h2").html(title);
    };

    chapterp.text_area = function(){
      return this.el.select(".text .inner");
    };

    chapterp.graph_area = function(){
      return this.el.select(".graphic");
    };

    chapterp.toggle_area = function(index){
      index = index || 0;
      return this.toggle_sections[index];
    };

    chapterp.source_area = function(){
      return this.el.select("source");
    };

    chapterp.add_toggle_section = function(target,text){
      var toggler = target.append("div").attr("class","span-8 toggler border-top")
        .style({
          "padding-top":"10px",
          "padding-bottom": "10px",
          "margin-bottom" : "0px"
        })
         .on("click", this.onToggleParent) 
        .append("a")
          .html(text)
          .attr("class","ui-link")
          .attr("href","#")
          .on("click", this.onToggle); 
      var div = target.append("div").attr("class", "span-8 toggle ");
      toggler.datum(div);
      return div;
    };

    // respond to the click on the div element, this implemented for touch screens
    chapterp.onToggleParent = function (e){
      var parent = d3.select(d3.event.target),
          target = parent.select("a").node();
      this._Toggle(target,parent);
    };

    // respond to the click on the a element
    chapterp.onToggle = function (e){
      var target = d3.event.target,
          parent = d3.select(target.parentNode);
      this._Toggle(target,parent);
    };

    chapterp._Toggle = function(target,parent){
      var el = d3.select(target).datum(),
          closed = !el.classed("ui-screen-hidden");
          
      el.classed("ui-screen-hidden",closed);
      if (!closed){
         parent.style({"background-color":"#EEE"});
      } else {
         parent.style({"background-color":"#FFF"});
      }
      _.delay( this.dispatch.toggle,0,el,closed ? "closed" : "open");
    };

    function add_source(target,sources){
      target.select(".source")
             .html("Source: ")
             .data(sources)
             .append("a")
             .attr("class","router")
             .attr("href",function(d){return d.href;})
             .html(function(d){return d.html;});
    }

    function add_section(target,hidden_text,span){
      /*
       * adds a 
       * div.span-8
       *   div.span-4.text
       *     div.inner
       *   div.span-4.graphic
       */
      var el =  target;
      el.append("div").attr("class",span +" text margin-bottom-none margin-left-none");
      el.select(".text")
        .append("div")
        .attr("class", "inner margin-top-large margin-left-large");
      el.append("div").attr("class",span +" graphic margin-bottom-none margin-left-none");
      el.append("div").attr("class", span+ " source margin-bottom-none margin-left-none")
        .style({"font-size":"12px"});
      el.append("div").attr("class","clear").style("margin-bottom","15px");
      if (hidden_text){
        el.select(".text").classed("ui-screen-hidden",true);
        el.select(".graphic").classed(span,false);
        el.select(".graphic").classed("span-8",true);
      }

    }

})();

