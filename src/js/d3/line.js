(function() {

    var D3 = ns('D3');
    var LINE = ns('D3.LINE');

    LINE.ordinal_line = D3.extend_base(function(svg,index){
      /* data in the format of 
      *  data = { "series 1" : [y1,y2,y3],
          *     "series 2" : [y1,y2,y3]}
      *  ticks = ["tick1","tick2"."tick3"]
      */
      var series = d3.keys(this.series),
          add_xaxis = this.add_xaxis,
          add_yaxis = this.add_yaxis,
          x_axis_line = this.x_axis_line  === undefined ? true : this.x_axis_line,
          add_legend = this.add_legend,
          add_labels = this.add_labels,
          html_ticks = this.html_ticks,
          add_under_area  = this.add_under_area || false,
          formater  = this.formater,
          colors = this.colors || D3.tbs_color(),
          title = this.title,
          top_margin = add_legend ? series.length  * 20 + 15 : 20,
          margin = this.margin || {top: top_margin, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 50},
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
          x = d3.scale.ordinal()
            .domain(ticks)
            .rangePoints([0, width], 0.1),
          point_width = x.range()[1] -x.range()[0],
          y = d3.scale.linear()
            .domain([y_bottom, y_top])
            .range([height, 0]),
          xAxis = d3.svg.axis()
            .scale(x)
            .tickPadding(5)
            .orient("bottom"),
          /*
          * setup the main graph area and add the bars
          * set up the axes  
          */
          html = this.html,
      graph_area  = svg
            .attr({
              width : width+margin.left+margin.right,
              height : height+margin.top+margin.bottom})
            .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     D3.add_hatching(svg,width+margin.left+margin.right,height+margin.top+margin.bottom);

      // add the title
      svg.append("text")
        .attr({
          "class" : "title",
          "x" : margin.left + width/2,
          "y" : 12,
        })
        .style({
          "text-anchor" : "middle",
          "font-size" : "12px",
          "font-weight" : "600"
        })
        .text(title);

      if (add_legend){
        make_legend(svg,series,width+margin.left, colors);
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
              "position" : "absolute",
              "font-size" : "12px",
              "text-weight" : "bold",
              "top" : height+margin.top+10+"px",
              "width": point_width+"px",
              "left"  : function(d) {return x(d)+margin.left+"px" ; }
            })
            .html(function(d){ return d;});
        }
        if (!x_axis_line){
          graph_area.select(".x.axis path").remove();
        }
      }

      if (add_yaxis){
        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(10)
            .tickFormat(formater)
            .orient("left");

        graph_area.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(y_axis);
      }

      if (add_labels){
        html.selectAll("div.labels")
          .data(data)
          .enter()
          .append("div")
          .attr("class","labels")
          .style({
            "position" : "absolute",
            "top" : "-8px",
            "height" : "10px",
            "width": point_width+"px",
            "left"  : function(d) {return x(d.tick)+margin.left+"px" ; }
          })
          .selectAll("div.label")
          .data(function(d){ return d.data;})
          .enter()
          .append("div")
          .attr("class","label")
          .html(function(d){ return formater(d.value);})
          .style({
            "text-align": "center",
            "position" : "absolute",
            "text-weight" : "bold",
            "font-size" : "12px",
            "height" : "10px",
            "top"  : function(d){
              if (d.value === 0){
                return  y(d.value)+"px";
              }
              else if (d.value > 0){
                return margin.top - 12 + y(d.value) - 5+"px";
              } else {
                return y(d.value) +20+ "px";
              }
            },
            "left"  : function(d) { return x(d.name)+"px" ; }
          });
        html.selectAll("div.labels")
          .data(data)
          .exit()
          .remove();
      }

      _.each(series, function(serie, i){

        var yfunc = function(d){return y(d.data[i].value);};
        var xfunc = function(d){return x(d.tick);} ;

        var line = d3.svg.line()
          .x(xfunc)
          .y(yfunc);

        var path = graph_area.append("path")
          .datum(data)
          .style({
            "fill" : "none",
            "stroke" : colors(i),
            "stroke-width" : "3px"
          })
          .attr("d", line);

        if (add_under_area){

          var area = d3.svg.area()
            .x(xfunc)
            .y0(height)
            .y1(yfunc);

          var under_area = graph_area.append("path")
            .datum(data)
            .style({
              "fill" : colors(i),
              "fill-opacity" : "0.2"
            })
            .attr("d", area);
        }

        var dots = graph_area.selectAll("circle.dots"+i)
            .data(data);
        dots.exit().remove();
        dots
          .enter()
          .append("circle")
          .attr({
            "class" : "dots"+i,
            "cy" : yfunc,
            "cx" : xfunc,
            "r" : "10"
        })
        .style({
          "fill" : "steelblue",
          "fill-opacity": "0.8",
          "stroke" : "white",
          "stroke-width" : "3px"
        });
      });
   });

   function make_legend(sel,legend,width,colors){

     var el = sel.selectAll(".legend")
           .data(legend)
         .enter().append("g")
           .attr("class", "legend")
           .attr("transform", function(d, i) { return "translate(0," + (5+(i* 20)) + ")"; });
     el.append("circle")
         .attr("cx", width - 18/2)
         .attr("cy", 18/2)
         .attr("r", 18/2)
         .style("fill", function(d,i){return colors(i);});

     el.append("text")
         .attr("x", width - 24)
         .attr("y", 9)
         .attr("dy", ".35em")
         .style("text-anchor", "end")
         .style("font-size", "10px")
         .text(function(d) { return d; });

     return el;
   }

})();

