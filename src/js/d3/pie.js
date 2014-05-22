(function() {

    var D3 = ns('D3');
    var PIE = ns('D3.PIE');

    PIE.pie = D3.extend_base(function(svg,index){
      var html = this.html,
          margin = this.margin || {top: 20, 
                                    right: 20, 
                                    bottom: 20, 
                                    left: 20},
          radius = Math.min(this.width, this.height)/2-20,
          color = this.color || D3.tbs_color(),
          graph_area  = svg
                .attr({ width : this.width, height : this.height})
                .append("g")
            .attr("transform", "translate(" + (margin.left+ radius )+ "," + (margin.top +radius)+ ")"),
          data_attr = this.data_attr,
          label_attr = this.label_attr,
          arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(this.inner_radius || 0),
          pie = d3.layout.pie()
            .sort(null)
            .startAngle(this.start_angle || 0)
            .endAngle(this.end_angle || 2*Math.PI)
            .value(function(d) { return d[data_attr]; }),
          pie_data = pie(this.data),
          label_length = d3.scale.ordinal().range([10,20,30]),
          g = graph_area.selectAll(".arc")
              .data(pie_data)
            .enter().append("g")
              .attr("class", "arc");

          g.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color(d.data[label_attr]); });

          g.append("path")
            .style({
               "stroke-width" : "1px",
               "stroke" : "grey",
            })
            .attr("d", function(d,i){
              var angle = (d.endAngle - d.startAngle)/2 + d.startAngle;
              var diff = label_length(i);
              return d3.svg.line.radial()([[radius, angle],[radius+diff,angle]]);
          });
    });
})();

