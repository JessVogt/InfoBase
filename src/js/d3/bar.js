(function() {

    var D3 = ns('D3');
    var BAR = ns('D3.BAR');

    BAR.bar = D3.extend_base(function(svg,index){
      /* data in the format of 
      *  { "series 1" : [y1,y2,y3],
      *     "series 2" : [y1,y2,y3]}
      */
      this.width = $(svg.node().parentNode).width() ;
      console.log(this.width)
      var series = d3.keys(this.series),
          add_xaxis = this.add_xaxis,
          add_yaxis = this.add_yaxis,
          x_axis_line = this.x_axis_line  === undefined ? true : this.x_axis_line,
          add_legend = this.add_legend,
          add_labels = this.add_labels,
          html_ticks = this.html_ticks,
          label_formater = add_labels ? this.label_formater : undefined,
          top_margin = add_legend ? series.length * 20 + 15 : 20,
          margin = this.margin || {top: top_margin, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40},
          height = this.height - margin.top - margin.bottom,
          width = this.width - margin.left - margin.right,
          y_axis = this.y_axis || '',
          ticks = this.ticks,
          values = d3.values(this.series),
          data = _.map(ticks,function(tick,i){
            return {tick : tick,
                    data :  _.map(series, function(serie){
                      return {name : serie, value : this.series[serie][i]};
                    },this)
            };
          },this),
          extent = d3.extent(d3.merge(values)),
          y_bottom = extent[0] > 0 ? 0 : 1.1 * extent[0],
          y_top = extent[1] < 0 ? 0 : 1.1 * extent[1],
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
          bar_width = Math.min(x1.rangeBand(), this.max_width || 100),
          y = d3.scale.linear()
            .domain([y_bottom, y_top])
            .range([height, 0]),
          xAxis = d3.svg.axis()
            .scale(x0)
            .tickPadding(5)
            .orient("bottom"),
          yAxis = d3.svg.axis()
            .scale(y)
            .ticks(10)
            .tickSize(-width)
            //.tickFormat(d3.format(this.yAxisTickFormat || ".2s"))
            .orient("left"),
          /*
          * setup the main graph area and add the bars
          * set up the axes  
          */
          html = d3.select(D3.get_html_parent(svg)),
          graph_area  = svg
            .attr({
              width : width+margin.left+margin.right,
              height : height+margin.top+margin.bottom})
            .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      if (add_legend){
        make_legend(svg,series,width+margin.left);
      }

      if (add_xaxis){
        graph_area.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height+ ")")
              .call(xAxis);
        if (html_ticks){
          graph_area.select(".x.axis").selectAll(".tick text").remove();
          html.selectAll("div.tick")
            .data(ticks)
            .enter()
            .append("div")
            .attr("class","tick")
            .style({
              "text-align": "center",
              "position" : "absolute",
              "text-weight" : "bold",
              "top" : height+margin.top+5+"px",
              "width": x0.rangeBand()+"px",
              "left"  : function(d) {return x0(d)+margin.left+"px" ; }
            })
            .html(function(d){ return d;});
            debugger
        }
        if (!x_axis_line){
          graph_area.select(".x.axis path").remove();
        }
      }

      if (add_yaxis){
        graph_area.append("g")
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
      }

      var groups = graph_area.selectAll(".group")
            .data(data)
          .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d.tick) + ",0)"; });

      if (add_labels){
        html.selectAll("div.labels")
          .data(data)
          .enter()
          .append("div")
          .attr("class","labels")
          .style({
            "position" : "absolute",
            "top" : "0px",
            "height" : "10px",
            "width": x0.rangeBand()+"px",
            "left"  : function(d) {return x0(d.tick)+margin.left+"px" ; }
          })
          .selectAll("div.label")
          .data(function(d){ return d.data;})
          .enter()
          .append("div")
          .attr("class","label")
          .html(function(d){ return label_formater(d.value);})
          .style({
            "text-align": "center",
            "position" : "absolute",
            "text-weight" : "bold",
            "width" : bar_width+"px",
            "height" : "10px",
            "top"  : function(d){
              if (d.value >= 0){
                return y(d.value) - 5+"px";
              } else {
                return y(d.value) + 20+"px";
              }
            },
            "left"  : function(d) { return x1(d.name)+(x1.rangeBand()-bar_width)/2 +"px" ; }
          });
        html.selectAll("div.labels")
          .data(data)
          .exit()
          .remove();
      }

      var bars = groups.selectAll("rect")
          .data(function(d) { return d.data; })
        .enter().append("rect")
          .attr( "width", bar_width)
          .attr( "x", function(d) { return x1(d.name) + (x1.rangeBand()-bar_width)/2 + "px"; })
          .style({
           "fill": function(d) { return D3.tbs_color(d.name); },
           "fill-opacity" : 0.8
          })
          .attr("height",0)
          .on("mouseover", this.dispatch.dataHover);

      bars.transition()
          .duration(750)
          .attr("y", function(d) {  
            if (d.value > 0){
              return y(d.value); 
            } else {
              return y(zero);
            }
          })
          .attr("height", function(d) { 
            if (d.value >= 0){
              return y(zero) - y(d.value);
            } else {
              return y(d.value) - y(zero);
            }
          });

   });

   function make_legend(sel,legend,width){

     var el = sel.selectAll(".legend")
           .data(legend)
         .enter().append("g")
           .attr("class", "legend")
           .attr("transform", function(d, i) { return "translate(0," + (5+(i* 20)) + ")"; });
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
