(function() {

    var D3 = ns('D3');
    var PIE = ns('D3.PIE');

    PIE.pie = D3.extend_base(function(svg,index){

      var html = this.html,
          margin = this.margin || {top: 20, 
                                    right: 20, 
                                    bottom: 20, 
                                    left: 20},
          width = this.width,
          font_size = this.font_size || 10,
          radius = Math.min(this.width, this.height)/2-40,
          color = this.color || D3.tbs_color(),
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
          pie_data = _.each(pie(this.data), function(d,i,col){
            var label_length = 10+ radius;
            d.label_angle =  (d.endAngle - d.startAngle)/2 + d.startAngle;
            if (i>0 && (d.label_angle - col[i-1].label_angle) <Math.PI/5 ){
              label_length = col[i-1].label_length + 10;
            }
            d.label_length = label_length;
          }),
          html_offset = {
            top : this.height/2,
            left : this.width/2
          },
          graph_area  = svg
                .attr({ width : this.width, height : this.height})
                .append("g")
            .attr("transform", "translate(" + (width/2 )+ "," + this.height/2 + ")"),
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
              var angle = d.label_angle;
              var diff = d.label_length;
              return d3.svg.line.radial()([[radius, angle],[diff,angle]]);
          });

        html.selectAll('div.label')
          .data(pie_data)
          .enter().insert("div","svg")
          .attr("class","label wrap-none")
          .html(function(d){
            return d.data[label_attr];
          })
          .style({
            "position" : "absolute",
            "font-size" : font_size+"px",
            "top" : function(d,i){
              var lower = d.label_angle> Math.PI/2 && d.label_angle < Math.PI*3/2 ;
              var offset = lower ? 0 : -font_size-10;
              return offset + html_offset.top + d.label_length*Math.sin(d.label_angle-Math.PI/2)+"px";
            }
          })
          .each(function(d){
            var el = d3.select(this);
            var x = html_offset.left + d.label_length*Math.cos(d.label_angle-Math.PI/2);
            if (d.label_angle > Math.PI){
              el.style("right",width-x+"px");
            } else {
              el.style("left", x+"px");
            }
          });
    });
})();

