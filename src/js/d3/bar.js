(function() {

    var D3 = ns('D3');
    var BAR = ns('D3.BAR');

    BAR.bar = D3.extend_base(function(svg,index){
      /* data in the format of 
      *  { "series 1" : [y1,y2,y3],
      *     "series 2" : [y1,y2,y3]}
      */
      var margin = this.margin || {top: 20, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40},
          height = this.height - margin.top - margin.bottom,
          width = this.width - margin.left - margin.right,
          
          y_axis = this.y_axis || '',
          ticks = this.ticks,
          series = d3.keys(this.series),
          y_range_top = this.is_mini ? 0 : series.length * 20 + 20,
          values = d3.values(this.series),
          data = _.map(ticks,function(tick,i){
            return {tick : tick,
                    data :  _.map(series, function(serie){
                      return {name : serie, val : this.series[serie][i]};
                    },this)
            };
          },this),
          extent = d3.extent(d3.merge(values)),
          y_bottom = extent[0] > 0 ? 0 : extent[0],
          y_top = extent[1] < 0 ? 0 : extent[1],
          zero = 0,
          /*  x0 scale sets out the chunks of space for each 
          *  of the series
          *  x1 uses the chunks of space from x0 to then create 
          *  sub-spaces for each of the labels
          *  y maps the domain of the input data onto the available 
          *  height
          *  max->merge will merge all the arrays into a single
          *  and fine the max value 
          */  
          x0 = d3.scale.ordinal()
            .domain(ticks)
            .rangeRoundBands([0, width], 0.1),
          x1 = d3.scale.ordinal()
            .domain(series)
            .rangeRoundBands([0,x0.rangeBand()]),
          y = d3.scale.linear()
            .domain([y_bottom, y_top])
            .range([height, y_range_top]),
          xAxis = d3.svg.axis()
            .scale(x0)
            .tickPadding(5)
            .orient("bottom"),
          yAxis = d3.svg.axis()
            .scale(y)
            .ticks(10)
            .tickSize(-width)
            //.tickFormat(d3.format(this.yAxisTickFormat || ".2s"))
            .orient("left");

      /*
      * setup the main graph area and add the bars
      * set up the axes  
      */
       svg  = svg
        .attr({
          width : width+margin.left+margin.right,
          height : height+margin.top+margin.bottom})
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      if (!this.is_mini && series.length > 1){
        make_legend(svg,series,width);
      } else if (this.is_mini){
        yAxis.tickSize(1);
        xAxis.tickSize(1);
        yAxis.tickValues(y.domain());
      }

      svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height+ ")")
            .call(xAxis);

      svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .call( function (g) {
              g.selectAll("text")
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
            .attr("transform", function(d) { return "translate(" + x0(d.tick) + ",0)"; });

      groups.selectAll("rect")
          .data(function(d) { return d.data; })
        .enter().append("rect")
          .attr( "width", x1.rangeBand())
          .attr( "x", function(d) { return x1(d.name); })
          .attr("y", function(d) {  
            if (d.val > 0){
              return y(d.val); 
            } else {
              return y(zero);
            }
          })
          .attr("height", function(d) { 
            if (d.val >= 0){
              return y(zero) - y(d.val);
            } else {
              return y(d.val) - y(zero);
            }
          })
          .style("fill", function(d) { return D3.tbs_color(d.name); })
          .on("mouseover", this.dispatch.dataHover);


      if (!this.is_mini){

      } else {
        svg.selectAll("g.axis path").remove();
        svg.selectAll("g.x").attr("transform" , "translate(0,"+height+")");
      }
   });

   function make_legend(sel,legend,width){

     var el = sel.selectAll(".legend")
           .data(legend)
         .enter().append("g")
           .attr("class", "legend")
           .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
     el.append("rect")
         .attr("x", width - 18)
         .attr("width", 18)
         .attr("height", 18)
         .style("fill", D3.tbs_color);

     el.append("text")
         .attr("x", width - 24)
         .attr("y", 9)
         .attr("dy", ".35em")
         .style("text-anchor", "end")
         .text(function(d) { return d; });

     return el;
   }

})();
