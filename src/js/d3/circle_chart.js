(function() {

    var D3 = ns('D3');
    var PACK = ns('D3.PACK');

    PACK.circle_pie_chart = D3.extend_base(function(svg,index){
      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      this.width = this.width - margin.left - margin.right;
      var html = this.html;
      var colors = this.colors || D3.tbs_color();
      var centre = this.centre || false;
      var height = this.height = this.height - margin.top - margin.bottom;
      var formater = this.formater || _.identity;
      var font_size = this.font_size || 16;
      var data = this.data;
      // based on the height of the pane
      var scale = d3.scale.pow()
        .exponent(0.5)
        .domain([1,d3.max(this.data, function(d){return d.value;})])
        .range([1,this.height/2]);


      var x_offset = margin.left+this.width/2;

      svg  = svg
        .attr("width", this.width+margin.left+margin.right)
        .attr("height", this.height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(" + x_offset + "," + margin.top + ")");

      // join the filtered data to the circles
      var circle = svg.selectAll("circle")
          .data(this.data,function(d){ return d.name;});
      var text = html.selectAll("div.middletext")
          .data(this.data,function(d){ return d.name;});
      // join the filtered data to any divs with labels

      circle.exit().remove();

      circle
        .enter()
          .append("circle")
          .on("mouseenter", this.dispatch.dataMouseEnter)
          .on("mouseleave", this.dispatch.dataMouseLeave)
          .on("click", this.dispatch.dataClick);

      circle
        .attr({
          "cy": function(d,i) { 
            if (centre && i > 0){
              return scale(data[0].value);
            } else {
              return scale(d.value); 
            }
          },
          "cx": "0px",
          "r" : function(d) { return  scale(d.value); }
        })
        .style({
          "fill" : function(d,i){ return colors(i);},
          "fill-opacity" : function(d,i){
            return i === 0 ? 0.1 : 0.8;
          },
          "stroke" : function(d,i){ return colors(i);},
          "stroke-width" : "2px",
          "stroke-opacity" : function(d,i){
            return i === 0 ? 0.3 : 0.8;
          }
        });

      text.exit().remove();
      text.enter().append("div");
      text
        .html(function(d){ return formater(d.value);})
        .style({
          "text-align": "center",
          "position" : "absolute",
          "text-weight" : "bold",
          "font-size" : font_size + "px",
          "width" : this.width+margin.bottom+margin.left+margin.right+"px",
          "top"  : function(d,i){ 
            if (i === 0 && data.length === 2) {
              // the containing circle, the text should be located below
              return margin.top +height+"px"; 
            } else if (centre ||( i === 0 && data.length === 1)){
              return margin.top + scale(data[0].value)-font_size+"px";
            } else {
              // the contained circle, the text should be located below
              return margin.top+2*scale(d.value)+"px"; 
            }},
          "left"  : "0px"
        });
    });
})();
