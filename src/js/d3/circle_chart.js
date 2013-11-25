(function() {

    var D3 = ns('D3');
    var PACK = ns('D3.PACK');

    PACK.line_chart = D3.extend_base(function(svg,index){

      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      this.width = this.width - margin.left - margin.right;
      this.height = this.width - margin.top - margin.bottom;
      // based on the height of the pane
      var scale = d3.scale.linear()
        .domain([0,d3.max(this.data, function(d){return d.value;})])
        .range([0,this.height/2]);
      // get offset to shift the circles into the middle of the 
      // pane
      var required_width = d3.sum(this.data, function(d){
        return this.scale(d.value);
      });
      var x_offset = (required_width - this.width)/2;
      svg  = svg
        .append("g")
        .attr("transform", "translate(" + (margin.left + x_offset) + "," + margin.top + ")");

        // join the filtered data to the circles
        var circle = svg.selectAll("circle")
            .data(nodes_shown,function(d){ return d.name+d.depth;});
        // join the filtered data to any divs with labels

        circle.exit().remove();

        var new_circles = circle
          .enter()
            .append("g")
            .attr("class","node")
            .append("circle")
            .on("mouseenter", dispatch.dataMouseEnter)
            .on("mouseleave", dispatch.dataMouseLeave)
            .on("click", dispatch.dataClick)

        circle.selectAll("circle")
          .transition()
          .attr({
            "class" : function(d) { 
               if (d.depth === 0) {
                 return  "grand-parent"; 
               } else if (d.depth <=  depth+1 ) {
                 return "parent" ;
               } else if (d.depth == depth +2){
                 return  "child"; 
               }
            },
            "cx": function(d) { return d.zoom_pos.x; },
            "cy": function(d) { return d.zoom_pos.y; },
            "r" : function(d) { return  d.zoom_r; }
          });

    });


})();
