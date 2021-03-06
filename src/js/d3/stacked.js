(function() {

    var D3 = ns('D3');
    var STACKED = ns('D3.STACKED');
    var APP = ns('APP');


    STACKED.stacked_series = D3.extend_base(function(svg,index){
      /* data in the format of 
        data = [ {tick:"series 1" , vals : {
             "name1" : val,"name2" : val,"name3" : val}},
        {tick:"series 2" , vals : {
             "name1" : val,"name2" : val,"name3" : val}}]
      *  labels = ["name1", 'name2', "name3"]
      */
      var source_data = this.data;
      var normalized = this.normalized;
      var labels = this.labels;
      var margin = {top: 20, right: 20, bottom: 30, left: 50};
      var legend_width = 150;
      var width = this.width - margin.left - margin.right;
      var height = this.height - margin.top - margin.bottom;
      var html = d3.select(D3.get_html_parent(svg));

      var color = (this.colors || d3.scale.category10()).domain(labels);

      svg = svg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var render = function() {

        var data = _.map(source_data, function(row, i){
            var y0 = 0;
            var stacked = _.map(labels, function(label){
              return {
                label : label,
                y0 : y0,
                y1 : y0 += row.vals[label]
              };
            });
            var total = y0;
            return {
              vals : stacked,
              total : total,
              tick : row.tick 
            };
        });

        var y = d3.scale.linear()
              .rangeRound([height, 0]);
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width-legend_width], 0.2)
            .domain(_.pluck(data, "tick"));
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        if (normalized) {
          _.each(data, function(row){
            _.each(row.vals,function(val){
               val.y0 /= row.total;
               val.y1 /= row.total;
            });
          });
          y.domain([0,1]);
          yAxis.tickFormat(d3.format(".0%"));

        } else {
          y.domain([0,d3.max(data, function(d){return d.total;})]);
        }

        svg.selectAll("g.legend-background")
          .data([0])
          .enter()
          .append("g")
          .attr({
            "class" : "legend-background",
            "transform":"translate("+[width-125,0]+")"
          })
          .append("rect")
          .attr({
            "x" : 0, "y" : 0,
            "width" : 150,
            "height" : (color.domain().length * 14 + 50)
          })
          .style({
            "fill" : "#F4F4F4",
            "stroke-width" : "1px",
            "stroke" : "#CCC"
          });

        var legend = svg.selectAll(".legend")
              .data(color.domain().slice().reverse())
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + (i+1) * 20 + ")"; });

        legend.append("rect")
          .attr("x",  width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

        legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .style("font-size","10px")
          .text(function(d) { return d; });

        svg.selectAll(".axis").remove();

        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.selectAll(".tick text").style("font-size","10px");

        var bars = svg.selectAll(".bar")
            .data(data);

        bars
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.tick) + ",0)"; });

        var rects = bars.selectAll("rect")
          .data(function(d) { return d.vals; });

        rects.enter().append("rect");

        rects.transition()
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y1); })
          .attr("height", function(d) { return y(d.y0) - y(d.y1); })
          .style("fill", function(d) { return color(d.label); });

      };

      html
        .append("a")
        .style({
          "position" : "absolute",
          "font-size" : "12px",
          "top" : "20px",
          "right" : "10px"
        })
        .html("Alternate")
        .on("click",function(){
           normalized = !normalized;
           render();
        });

      render();
    });

    STACKED.relaxed_stacked = D3.extend_base(function(svg,index){
      /* data in fhte format of
      *   "display_cols" : ["y 1","y 2","y 3"],
      *    "col_attrs"  : ["y1","y2","y3"]
      *    rows : [{
      *      "label" : '',
      *      y1 : val,
      *      y2 : val,
      *      y3 : val
      *    }, {
      *      "label" : '',
      *      y1 : val,
      *      y2 : val,
      *      y3 : val
      *    }]
      *    text_label : "label"
      */

      var display_cols = this.display_cols,
          html = d3.select(D3.get_html_parent(svg)),
          all_rows = this.rows,
          col_attrs = this.col_attrs,
          non_zero_rows = _.filter(all_rows, function(d){
                  return _.any(col_attrs, function(attr){
                    return d[attr] !== 0;
                  });
                }),
          totals = _.map(col_attrs, function(col_attr){
             return d3.sum(_.pluck(non_zero_rows, col_attr));
          }),
          summary_choices = [5,non_zero_rows.length],
          choices_y_offset = 0,
          summary_row,srummary_vals,
          radius = this.radius,
          formater = this.formater,
          total_formater = this.total_formater,
          text_key = this.text_key,
          colors = this.colors || D3.tbs_color(),
          margin = this.margin || {top: 20, 
                                    right: 20, 
                                    bottom: 20, 
                                    left: 40},
          width = this.width - margin.left - margin.right,
          update = function(summary_choice){
            var rows = _.head(non_zero_rows,summary_choice),
                tail_rows = _.tail(non_zero_rows,summary_choice),
                extra_height = tail_rows.length > 0 ? 2*(radius+5) : 0,
                height =  2*(radius+5) * rows.length - (rows.length-2)*5 + extra_height,
                graph_area  = svg.select("g.container"),
                toggle = function(row){
                  row_groups.transition().duration(1000);

                  var data = row.datum();
                  // get the current label
                  var label = html.selectAll(".label")
                                  .style({"font-weight":"normal"})
                                  .filter(function(d){
                                    return d === row.datum();
                                  });

                  var other_rows = row_groups.filter(function(d){
                    return d !== data;
                  }).each(function(d){
                    var row = d3.select(this);
                    d.active = false;
                    row.selectAll("text").style("fill-opacity",0);
                    row.selectAll("circle").style({"fill-opacity":0.5,"stroke-opacity":1});
                  });

                  if (d3.event.type === 'mouseenter'){
                    data.active = true;
                  } else if (d3.event.type === 'mouseleave'){
                    data.active = false;
                  } else if (d3.event.type === 'click' || d3.event.type === 'focus'){
                    data.active = !data.active;
                  }

                  if (data.active){
                    row.selectAll("circle").style({"fill-opacity":0.1,"stroke-opacity":0});
                    row.selectAll("text").style("fill-opacity",1);
                    label.style({"font-weight": "bold"});
                  } else {
                    row.selectAll("text").style("fill-opacity",0);
                    row.selectAll("circle").style({"fill-opacity":0.5,"stroke-opacity":1});
                    label.style({"font-weight": "normal"});
                  }

                  d3.event.stopPropagation();
                },
                svg_toggle = function(d){
                  var row = d3.select(d3.event.target.parentNode);
                  toggle(row);
                },
                html_toggle = function(d){
                  if (d3.event.type === 'click'){
                    d3.event.preventDefault();
                  }
                  var row = row_groups.filter(function(_d){return d === _d;});
                  toggle(row);
                };

            svg.attr({ height : height+margin.top+margin.bottom});
            if (tail_rows.length > 1){
              // if this condition is true then there is a summary line to be created
              //
              summary_vals =  _.chain(col_attrs)
                  .map(function(col_attr){
                    return [col_attr, d3.sum(tail_rows, function(tail_row){
                        return tail_row[col_attr];
                      })];
                  })
                  .object()
                  .value();
              summary_row = _.extend({ expandable : true }, summary_vals);
              summary_row[text_key] = "The sum of the " +tail_rows.length +" remaining items";
              rows.push(summary_row);
            } else if (tail_rows.length === 1){
              rows.push(tail_rows[0]);
            }

            var all_vals = d3.merge(_.map(col_attrs, function(col){
                  return _.map(rows, function(row){
                    return Math.abs(row[col]);
                  });
                })),
                max = d3.max(all_vals),
                scale = d3.scale.linear()
                  .domain([0,max])

                  .range([2,radius]);

            var row_groups = graph_area.selectAll("g.row")
              .data(rows,function(d,i){return i+d[text_key];});

            row_groups.exit().remove();

            var new_row_groups = row_groups
              .enter()
              .append("g")
              .attr("class","row")
              .each(function(d){d.active = false;})
              .attr("transform",function(d,i){
                return "translate(0,"+i*(2*radius+5)+")";
              });

            var cells = row_groups.selectAll("g.cell")
              .data(function(d){return _.map(col_attrs, function(col,i){
                  return {val : d[col], row_count : _.indexOf(rows,d)};
                });
              })
              .enter()
              .append("g")
              .attr("class","cell")
              .attr("transform",function(d,i){
                return "translate("+i*(2*radius + 5)+",0)";
              });

            // add divider lines
            // the divier lines need to be put first so that they won't be on
            // top of the shadding rectangles which receive the events'
            // if these are after, you will get weird glitches
            new_row_groups
              .append("line")
              .style({
                "stroke":"#CCC",
                "stroke-width" : 2
              })
              .attr({ "x1" : 0, "x2" : width, "y1" : 2*radius+2, "y2" : 2*radius+2 });

            // add background shading for even lines
            new_row_groups
              .append("rect")
              .attr({ "x" : 0, "y" : -5, "width" : width, "height" : 2*radius+5 })
              .style({
                "fill" : "#CCC",
                "fill-opacity" : function(d,i){
                  return i%2 === 0 ? 0.1 : 0;
                }
              })
              .on("click", svg_toggle);

            svg.selectAll("text.headers").remove();
            svg
              .selectAll("text.headers")
              .data(display_cols)
              .enter()
              .append("text")
              .attr({
                "class":"headers",
                "x" : function(d,i){
                  return i*(radius*2+5)+radius+margin.left;
                },
                "y" : 10
              })
              .style({
                "font-size" : "12px",
                "text-anchor" : "middle",
                "font-weight" : "bold"
              })
              .text(Object);

            svg.selectAll("text.footers").remove();
            svg
              .selectAll("text.footers")
              .data(totals)
              .enter()
              .append("text")
              .attr({
                "class":"footers",
                "x" : function(d,i){
                  return i*(radius*2+5)+radius+margin.left;
                },
                "y" : height+margin.bottom+10
              })
              .style({
                "font-size" : "12px",
                "text-anchor" : "middle",
                "font-weight" : "bold"
              })
              .text(total_formater);

            svg.selectAll("text.total_").remove();
            svg
              .append("text")
              .attr({
                "class" : "total_",
                "x" : 50 + display_cols.length *(2*radius + 5),
                "y" : height+margin.bottom+10
              })
              .style({
                "font-size" : "12px",
                "font-weight" : "bold"
              })
              .text("Total");

            cells
              .append("circle")
              .attr({
                "cx": radius,
                //"cy": radius-5,         
                "cy" : function(d){
                  return 2*radius - scale(Math.abs(d.val));
                },
                "r" : function(d){return scale(Math.abs(d.val));}
              })
              .style({
                "fill" : function(d,i){ 
                  if (d.val < 0 ){
                    return "red";
                  }
                  return colors(d.row_count);
                },
                "fill-opacity" : 0.5,
                "stroke" : function(d,i){ 
                  if (d.val < 0 ){
                    return "red";
                  }
                  return colors(d.row_count);
                },
                "stroke-width" : "2px",
                "stroke-opacity" : 0.5
              });

            cells
              .append("text")
              .attr({
                "x" : radius,
                "y" : radius,
                "font-weight" : "bold",
                "text-anchor" : "middle",
                "font-size" : "16px",
                "fill" : function(d,i){
                  if (d.val < 0){
                    return "red";
                  }
                }
              })
              .style("fill-opacity",0)
              .text(function(d){return formater(d.val);});

            var labels = html
              .selectAll("div.label")
              .data(rows,function(d,i){return i+d[text_key];});

            labels.exit().remove();

            labels
              .enter()
              .append("div")
              .attr("class","label ")
              .style({
                "width": width - display_cols.length*(2*radius+5)+ "px",
                "height" : 20 +"px",
                "position" : "absolute",
                "top" :  function(d,i){
                  return choices_y_offset + i*(2*radius+5)+radius+"px";
                },
                "left" : 50 + display_cols.length *(2*radius + 5) +"px"
              })
              .append("a")
              .attr("title", function(d){
                var el = document.createElement('div');
                el.innerHTML = d[text_key];
                if (d3.select(el).select(".original").node()){
                  return d3.select(el).select(".original").html();
                }
              })
              .attr("href","#")
              .style({
                "font-size":"12px",
                "color":"black",
                "text-decoration" : "none"
              })
              .html(function(d){
                return d[text_key];
              })
              .on("click", html_toggle)
              .on("focus", html_toggle);

            // mouseenter events don't play well on mobile'
            if (!is_mobile){
              row_groups.selectAll("rect")
                .on("mouseenter", svg_toggle)
                .on("mouseleave", svg_toggle);
              html.selectAll("div.label").on("mouseenter", html_toggle);
            }
          };

      if (summary_choices.length > 1) {
        var last_two = _.last(summary_choices,2);
        if (last_two[0] === last_two[1]-1){
          summary_choices = _.head(summary_choices,summary_choices.length-1 );
        }
      }

      if (summary_choices[1] > summary_choices[0]) {
        var ul =html.insert("div","svg")
          .attr("class","choice")
          .style({"height":"30px"})
          .append("ul")
          .style({"margin-bottom":"0px","margin-top":"0px"})
          .attr("class","list-bullet-none");

        choices_y_offset = 30;

        ul.selectAll("li")
          .data(summary_choices)
          .enter()
          .append("li")
          .style({
            "display": "inline",
            "list-style-type" : "none",
            "padding-left": "10px",
            "padding-right": "10px"
          })
          .append("a")
          .attr("href","#")
          .html(Object)
          .on("click",function(d){
            html.selectAll("div.choice li")
                .classed("background-medium",false);
            d3.select(this.parentNode).classed("background-medium",true);
            update(d);
          })
          .filter(function(d,i){
            return i === 0;
          })
          .each(function(d){
            d3.select(this.parentNode).classed("background-medium",true);
          });
      }

      svg
        .attr({ width : width+margin.left+margin.right})
        .append("g")
          .attr("class","container")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

     update(summary_choices[0]);
    });
})();
