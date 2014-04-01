(function() {

    var D3 = ns('D3');
    var STACKED = ns('D3.STACKED');
    var APP = ns('APP');

    STACKED.relaxed_stacked = D3.extend_base(function(svg,index){
      /* data provided
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
          rows = this.rows,
          radius = this.radius,
          formater = this.formater,
          col_attrs = this.col_attrs,
          text_key = this.text_key,
          colors = this.colors || D3.tbs_color,
          margin = this.margin || {top: 20, 
                                    right: 20, 
                                    bottom: 20, 
                                    left: 40},
          all_vals = d3.merge(_.map(col_attrs, function(col){
            return _.map(rows, function(row){
               return Math.abs(row[col]);
            });
          })),
          max = d3.max(all_vals),
          html = d3.select(D3.get_html_parent(svg)),
          height =  2*(radius+5) * rows.length - (rows.length-2)*5 ,
          width = this.width - margin.left - margin.right,
          scale = d3.scale.linear()
            .domain([0,max])
            .range([2,radius]),
          graph_area  = svg
            .attr({
              width : width+margin.left+margin.right,
              height : height+margin.top+margin.bottom})
            .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
          row_groups = graph_area.selectAll("g.row")
            .data(rows)
            .enter()
            .append("g")
            .attr("class","row")
            .each(function(d){d.active = false;})
            .attr("transform",function(d,i){
              return "translate(0,"+i*(2*radius+5)+")";
            }),
          toggle = function(row){
            var data = row.datum();
            var other_rows = row_groups.filter(function(d){
              return d !== data;
            }).each(function(d){
              var row = d3.select(this);
              d.active = false;
              row.selectAll("text").style("display","none");
              row.selectAll("circle").transition().style({"fill-opacity":0.5,"stroke-opacity":1});
            });
            if (d3.event.type === 'mouseenter'){
               data.active = true;
            } else if (d3.event.type === 'mouseleave'){
               data.active = false;
            } else if (d3.event.type === 'click'){
               data.active = !data.active;
            } else if (d3.event.type === 'focus'){
               data.active = !data.active;
            }
            if (data.active){
              row.selectAll("circle").transition().style({"fill-opacity":0.1,"stroke-opacity":0.3});
              row.selectAll("text").style("display","inline");
            } else {
              row.selectAll("text").style("display","none");
              row.selectAll("circle").transition().style({"fill-opacity":0.5,"stroke-opacity":1});
            }
          },
          svg_toggle = function(d){
            var row = d3.select(d3.event.target.parentNode);
            toggle(row);
          },
          html_toggle = function(d){
            var row = row_groups.filter(function(_d){return d === _d;});
            toggle(row);
          },
          cells = row_groups.selectAll("g.cell")
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

          svg
            .selectAll("text.headers")
            .data(display_cols)
            .enter()
            .append("text")
            .attr({
              "class":"headers",
              "text-anchor" : "middle",
              "font-weight" : "bold",
              "x" : function(d,i){
                 return i*(radius*2+5)+radius+margin.left;
              },
              "y" : 10
            })
            .text(Object);
          // add background shading for even lines
          row_groups
            .append("rect")
            .attr({ "x" : 0, "y" : -5, "width" : width, "height" : 2*radius+5 })
            .style({
              "fill" : "CCC",
              "fill-opacity" : function(d,i){
                return i%2 === 0 ? 0.05 : 0;
              }
            })
            .on("click", svg_toggle)
            .on("mouseenter", svg_toggle)
            .on("mouseleave", svg_toggle);

          // add divider lines
          row_groups
            .append("line")
            .style({
              "stroke":"#CCC",
              "stroke-width" : 2
            })
            .attr({ "x1" : 0, "x2" : width, "y1" : 2*radius, "y2" : 2*radius });


          var circles = cells
            .append("circle")
            .attr({
              "cx": radius,
              "cy": radius-5,         
              "r" : function(d){return scale(Math.abs(d.val));}
          })
          .style({
            "fill" : function(d,i){ return colors(d.row_count);},
            "fill-opacity" : 0.5,
            "stroke" : function(d,i){ return colors(d.row_count);},
            "stroke-width" : "2px",
            "stroke-opacity" : 1
          });

          text = cells
            .append("text")
            .attr({
              "x" : radius,
              "y" : radius,
              "text-anchor" : "middle",
              "font-size" : radius/3,
              "font-weight" : "bold",
            })
            .style("display","none")
            .text(function(d){return formater(d.val);});


          html
            .selectAll("div.label")
            .data(rows)
            .enter()
            .append("div")
            .attr("class","label wrap-none")
            .style({
              "width": width - display_cols.length*(2*radius+5)+ "px",
              "height" : 20 +"px",
              "position" : "absolute",
              "overflow":"hidden",
              "top" :  function(d,i){
                return i*(2*radius+5)+radius+"px";
              },
              "left" : 50 + display_cols.length *(2*radius + 5) +"px"
            })
            .on("click", html_toggle)
            .on("mouseenter", html_toggle)
            .on("mouseleave", html_toggle)
            .append("a")
            .attr("href","#")
            .style({
              "font-size":"12px",
              "color":"black",
              "text-decoration" : "none"
            })
            .html(function(d){
               return d[text_key];
            })
            .on("focus", html_toggle);
    });
})();
