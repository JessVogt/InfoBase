(function() {

    var D3 = ns('D3');
    var LINE = ns('D3.LINE');


    LINE.ordinal_on_legend_click = function(graph){
      return function(d,i,el,list){
        /*
         *  works with list which were bound using the 
         *  D3.create_list function
         *  each li is expected to have bound data in the following
         *  format
         *    { label : "label", data : [arrayofdata], active : true/false}
         */
        d.active = !d.active;
        var total_active = 0;
        var data = {};
        // don't respond if over 6 lines are active, we run out of
        // colours and it just looks messy
        list.each(function(d){
          total_active += d.active? 1 : 0;
        });
        if (total_active > 6){
          d.active = !d.active;
          return;
        }

        var colors = d3.scale.category10();
        var tags = list.selectAll(".color-tag");
        tags.style("background-color","transparent");
        // now check and see if nothing else is selected
        // in which case,force this item back to selected 
        if (!list.filter(function(d){ return d.active;}).node()){
          d.active = true;
        }

        list.filter(function(d){return d.active;})
          .select(".color-tag")
          .each(function(d){
            data[d.label]  = d.data;
          })
        .style({
          "background-color": function(d){
            return colors(d.label);
          }
        });

        graph.options().render({
          colors : colors,
          series : data
        });
      };
    };

    LINE.ordinal_line = D3.extend_base(function(svg,index){
      /* data in the format of
      *  series = { "series 1" : [y1,y2,y3],
          *     "series 2" : [y1,y2,y3]}
      *  ticks = ["tick1","tick2"."tick3"]
      */
      var html = this.html,
          add_xaxis =  this.add_xaxis  === undefined ? true : this.add_xaxis,
          add_yaxis =  this.add_yaxis  === undefined ? true : this.add_yaxis,
          x_axis_line = this.x_axis_line  === undefined ? true : this.x_axis_line,
          add_legend =  this.add_legend  === undefined ? true : this.add_legend,
          add_labels = this.add_labels,
          add_under_area  = this.add_under_area || false,
          formater  = this.formater,
          title = this.title,
          margin = this.margin || {top: 20,
                                    right: 20,
                                    bottom: 30,
                                    left: 50},
          height = this.height - margin.top - margin.bottom,
          width = this.width - margin.left - margin.right,
          y_axis = this.y_axis || '',
          graph_area  = svg
                .attr({
                  width : width+margin.left+margin.right,
                  height : height+margin.top+margin.bottom})
                .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     D3.add_hatching(graph_area,width,height);


     this.render = function(options){
       _.extend(this, options);
      var series = this.series,
          values = d3.values(this.series),
          colors = this.colors || D3.tbs_color(),
          ticks = this.ticks,
          x = d3.scale.ordinal()
            .domain(ticks)
            .rangePoints([0, width], 0.1),
          x_range = x.range(),
          tick_width = x_range[1]- x_range[0],
          extent = d3.extent(d3.merge(values)),
          zero = 0,
          y_bottom = extent[0] > 0 ? 0.9 * extent[0] : 1.1 * extent[0],
          y_top = extent[1] < 0 ? 0 : 1.1 * extent[1],
          y = d3.scale.linear()
            .domain([y_bottom, y_top])
            .range([height, 0]);

          // add the title
          svg.select("text.title").remove();
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

            var xAxis = d3.svg.axis()
              .scale(x)
              .outerTickSize(0)
              .tickPadding(5)
              .orient("bottom");

            var xaxis_node = graph_area.select(".x.axis");
            if (!xaxis_node.node()){
              xaxis_node = graph_area.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height+ ")");
            }
            xaxis_node.call(xAxis);

            graph_area.select(".x.axis").selectAll(".tick text").remove();
            html.selectAll("div.tick")
              .data(ticks)
              .enter()
              .append("div")
              .attr("class","tick")
              .style({
                "position" : "absolute",
                "text-align" : "center",
                "font-size" : "12px",
                "text-weight" : "bold",
                "top" : height+margin.top+10+"px",
                "width": tick_width+"px",
                "left"  : function(d) {return x(d)-tick_width/2+margin.left+"px" ; }
              })
              .html(function(d){ return d;});

            if (!x_axis_line){
              graph_area.select(".x.axis path").remove();
            }
          }

          if (add_yaxis) {

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(10)
                .outerTickSize(0)
                .tickFormat(formater)
                .orient("left");

            var yaxis_node = graph_area.select(".y.axis");
            if (!yaxis_node.node()){
              yaxis_node = graph_area.append("g").attr("class", "y axis");

              yaxis_node
                  .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text(y_axis);
            }
            yaxis_node.call(yAxis);

          }

          if (add_labels){
            //var labels = html.selectAll("div.labels")
            //                .data(data);
            //labels
            //  .enter()
            //  .append("div")
            //  .attr("class","labels")
            //  .style({
            //    "position" : "absolute",
            //    "top" : "0px",
            //    "height" : "10px",
            //    "width": point_width+"px",
            //    "left"  : function(d) {return x(d.tick)+margin.left+"px" ; }
            //  })
            //  .selectAll("div.label")
            //  .data(function(d){ return d.data;})
            //  .enter()
            //  .append("div")
            //  .attr("class","label")
            //  .html(function(d){ return formater(d.value);})
            //  .style({
            //    "text-align": "center",
            //    "position" : "absolute",
            //    "text-weight" : "bold",
            //    "font-size" : "12px",
            //    "height" : "10px",
            //    "top"  : function(d){
            //      if (d.value === 0){
            //        return  y(d.value)+"px";
            //      }
            //      else if (d.value > 0){
            //        return margin.top - 12 + y(d.value) - 5+"px";
            //      } else {
            //        return y(d.value) +20+ "px";
            //      }
            //    }
            //  });
            //labels
            //  .exit()
            //  .remove();
          }


          var lines = graph_area.selectAll("g.line")
            .data(d3.keys(series), function(d,i){
              return d;
            });

          lines.exit().remove();

          lines.enter()
            .append("g")
            .attr("class","line");

          lines
            .each(function(d,i){
              var g = d3.select(this);
              var data = series[d];
            
              var yfunc = function(d){return y(d);};
              var xfunc = function(d,i){return x(ticks[i]);} ;
            
              var line = d3.svg.line()
                .x(xfunc)
                .y(yfunc);
            
              var path = g.selectAll("path")
                .data([data]);
              path.enter().append("path");
              path
                .style({
                  "fill" : "none",
                  "stroke" : colors(d),
                  "stroke-opacity" : 0.6,
                  "stroke-width" : "3px"
                })
                .attr("d", function(d){
                   return line(_.head(d,2));
                })
                .transition()
                .duration(100*data.length)
                .attr("d", line)
                .style({
                  "stroke-opacity" : 1,
                });

            
              if (add_under_area){

                var area = d3.svg.area()
                  .x(xfunc)
                  .y0(height)
                  .y1(yfunc);

                var under_area = g.append("path")
                  .datum(data)
                  .style({
                    "fill" : colors(d),
                    "fill-opacity" : "0.2"
                  })
                  .attr("d", area);
              }

              var dots = g.selectAll("circle.dots")
                  .data(data);

              dots
                .enter()
                .append("circle")
                .attr({
                  "class" : "dots",
                  "cy" : yfunc,
                  "cx" : xfunc,
                  "r" : "10"
                })
                .style({
                  "fill" :colors(d),
                  "fill-opacity": 0,
                })
                .transition()
                .delay(function(d,i){
                  return i*100;
                })
                .style({
                  "fill-opacity": 0.8
                });

              dots.style("fill",colors(d))
                .attr({
                  "cy" : yfunc,
                  "cx" : xfunc,
              });

          });
     };

     this.render({});
   });
})();
