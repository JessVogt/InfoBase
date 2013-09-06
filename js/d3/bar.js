(function() {
    var D3 = ns('D3');

    D3.bar = D3.extend_base(function(selection,index){
          /* data in the format of 
          *  { "series 1" : [y1,y2,y3],
          *     "series 2" : [y1,y2,y3]}
          */
          var margin = this.margin || {top: 20, 
                                        right: 20, 
                                        bottom: 30, 
                                        left: 40};
          var height = this.height;
          var y_axis = this.y_axis || '';
          var legend = this.legend;
          var y_range_top = this.is_mini ? 0 : legend.length * 20 + 20;
          var series = d3.keys(this.series);
          var values = d3.values(this.series);
          var data = _.map(this.series,function(data,series_name){
            return {series_name : series_name,
                    data :  _.map(data, function(d,i){
                      return {name : legend[i],
                              val : d};
                    })};
          });
          /*  x0 scale sets out the chunks of space for each 
          *  of the series
          *  x1 uses the chunks of space from x0 to then create 
          *  sub-spaces for each of the labels
          *  y maps the domain of the input data onto the available 
          *  height
          *  max->merge will merge all the arrays into a single
          *  and fine the max value 
          */  
          var x0 = d3.scale.ordinal()
            .domain(series)
            .rangeRoundBands([0, this.width], .1);
          var x1 = d3.scale.ordinal()
            .domain(legend)
            .rangeRoundBands([0,x0.rangeBand()]);
          var y = d3.scale.linear()
                  .range([this.height, y_range_top])
                  .domain(d3.extent(d3.merge(values)));
          /*
          * Create the main graph area and add the bars
          * set up the axes  
          */
          var svg = selection.append("svg")
                    .attr({
                      width : this.width + margin.left + margin.right,
                      height : this.height + margin.top + margin.bottom})
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


          var xAxis = d3.svg.axis()
              .scale(x0)
              .orient("bottom");
          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("right")
              .ticks(6)
              .tickSize(this.width)
              .tickFormat(d3.format(this.yAxisTickFormat || ".2s"));

          if (!this.is_mini){
            make_legend(svg,this.width);
          } else {

            yAxis.tickSize(1);
            xAxis.tickSize(1);
            yAxis.tickValues(y.domain());

            var legend_height = legend.length * 20; 
            var canvas = d3.selectAll("svg.legend")
              .data([1])
              .enter()
              .append("svg")
              .attr({
                class : "legend",
                width  : '200px',
                height : legend_height + 'px'
            });
            make_legend(canvas, 200);
            new D3.tooltip({
              body: canvas.node(), 
              tipper : svg.node(),
              height : legend_height
            });
          }

          svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + y(0) + ")")
                .call(xAxis);

          svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .call( function (g) {
                  g.selectAll("text")
                      .attr("x", 4)
                      .attr("dy", -4);
                })
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text(y_axis);

          var groups = svg.selectAll(".group")
                .data(data)
              .enter().append("g")
                .attr("class", "g")
                .attr("transform", function(d) { return "translate(" + x0(d.series_name) + ",0)"; });

          groups.selectAll("rect")
              .data(function(d) { return d.data; })
            .enter().append("rect")
              .attr( "width", x1.rangeBand())
              .attr( "x", function(d) { return x1(d.name); })
              .attr("y", function(d) {  
                if (d.val > 0){
                  return y(d.val); 
                } else {
                  return y(0);
                }
              })
              .attr("height", function(d) { 
                if (d.val >= 0){
                  return y(0) - y(d.val);
                } else {
                  return y(d.val) - y(0);
                }
              })
              .style("fill", function(d) { return D3.tbs_color(d.name); });

          function make_legend(sel,width){

            var el = sel.selectAll(".legend")
                  .data(legend)
                .enter().append("g")
                  .attr("class", "legend")
                  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
            el.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            el.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });

            return el;
          }

          if (!this.is_mini){

          } else {
            svg.selectAll("g.axis path").remove();
            svg.selectAll("g.x").attr("transform" , "translate(0,"+height+")");
          }
        });
})();
