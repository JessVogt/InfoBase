(function() {

    var APP = ns('APP');
    var WAIT=ns("WAIT");
    
    WAIT.waitscreen = function(lang){
     return new waitscreen(lang);
    };
    
    var waitscreen = function(lang){
      this.lang = lang;
      this.items = {};
      this.vis = d3.select("#app")
        .append("div")
        .style({
          "z-index":100,         
          "background-color": "#FFF"
        })
        .attr("class","span-4")
        .append("svg")
        .attr({
          "width" : "800px",
          "height" : "800px",
          "class" : "loader"
        });
      this.height = 40;
      this.width = 600;
      this.colors = d3.scale.ordinal()
        .domain(["download","loading","finished"])
        .range(["#d62728","#1f77b4","#2ca02c"])
      this.widths = d3.scale.ordinal()
        .domain(["download","loading","finished"])
        .range([this.width/3,2/3*this.width,this.width]);
    };

    waitscreen.prototype.update = function(){
      var height = this.height;
      var colors = this.colors;
      var widths = this.widths;
      var items = _.values(this.items);
      
      var rects = this.vis.selectAll("rect")
          .data(items,function(d){return d._key});

      rects.enter().append("rect");

      rects
        .attr({
          "width": function(d) { return widths(d.stat); },
          "x": 0,
          "y" : function(d,i) { return i * (height+10); },
          "height": height
        })
        .style("fill",function(d){
          return colors(d.stat);
        });

      var text = this.vis.selectAll("text")
          .data(items,function(d){return d._key});

      text.enter().append("svg:text");

      text
       .attr({
         "x": 10,
         "y": function(d,i) { return i * (height+10)+height/2; },
         "dy": ".35em",
         "text-anchor": "left"
       })
       .style("font-size" , "12px")
       .text(function(d) { return d._key; });  

    };

    waitscreen.prototype.update_item = function(key,stat){
      //  stat = download, loading, finished
      this.items[key] = {_key:key,stat : stat, value: _.random(25,100)};
      this.update();
    };

    waitscreen.prototype.teardown = function(){
      d3.select("svg.loader").remove();
    };

})();
