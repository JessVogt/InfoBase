// 1,043 × 1010
// style="opacity:0.65822784;fill:#000000;fill-opacity:1;stroke:none"
// width="94.350761"
// height="81.185539"

(function(root) {
  
  var APP = ns('APP');
  var D3 = ns("D3");
  var BAR = ns('D3.BAR');
  var CANADA = ns('D3.CANADA');
  var three_year_coord = [818,0];
  var three_year_size = [444,375];

  CANADA.canada = D3.extend_base(function(svg,index){

     var map_svg = d3.select("#canada").html(),
         data = this.data,
         text_fragments = this.text_fragments,
         last_year_data = _.last(data),
         ticks = this.ticks,
         formater = this.formater,
         max = d3.max(d3.values(last_year_data)),
         color_scale = d3.scale.linear().domain([0,max]).range([0.2,1]),
         max_height = 700,
         x_scale = this.width/1396,
         y_scale = max_height / 1346,
         scale = Math.min(x_scale, y_scale),
         height = scale * 1346,
         width = scale * 1396,
         padding = (this.width - width) /2,
         tys = three_year_size,
         scaled_three_year_size = [scale*tys[0],scale*tys[1]],
         scaled_three_year_coord = [818*scale,0];
         html = d3.select(D3.get_html_parent(svg));

     //remove the default svg node, it will be replaced from the template
     html.select("svg").remove();

     //set the html of the svg
     html.html(map_svg);
     html.append("div")
       .style({
          "position" : "absolute",
          "top" : "0px",
          "left" : padding + scaled_three_year_coord[0]+"px"
       })
       .append("div")
       .attr("class","three-year-container border-all")
       .style({
         "position":"relative",
         "margin" : "5px",
         "height" : scaled_three_year_size[1]+'px',
         "width" : scaled_three_year_size[0]+'px',
         "background-color" : "#F4F4F4"
         
       });

     svg = html.select("svg");

     svg
        .attr({
          "height" :  height +"px",
          "width" :  this.width +"px",
        })
        .select("g.container")
        .attr("transform","translate("+padding+",0),scale("+scale+")");
     
     svg.select("g.container")
       .append("g")
       .attr({
         "class" : "legend-background",
         "transform":"translate("+[scale*50,scale*20]+")"
       })
       .append("rect")
       .attr({
         "x" : 0, "y" : 0,
         "width" : 100/scale,
         "height" : (color_scale.ticks(5).length * 14 + 20)/scale
       })
       .style({
         "fill" : "#F4F4F4",
         "stroke-width" : "1px",
         "stroke" : "#CCC"
       });

     var legend = svg.select("g.container").selectAll(".legend")
       .data(color_scale.ticks(5).reverse())
       .enter()
       .append("g")
       .attr({
         "class" :"legend",
         "transform":function(d,i){
            return "translate("+scale*100+","+ 1/scale*(14*i + 20) + ")";
         }
       });

     legend.append("rect")
       .attr({
         'x' : 0,
         "y" : 0,
         "width" : 12/scale,
         "height" : 12/scale
       })
       .style({
         "fill" :  "#1f77b4",
         "fill-opacity" : color_scale
       });

     legend.append("text")
       .attr({
         "x" : 15/scale,
         "y" : 12/scale 
       })
       .style({
         "font-size" : 12/scale + "px"
       })
       .text(function(d,i){
         return formater(d) +"+";
       });

     svg.selectAll(".province")
        .style({
          "fill" : "#1f77b4",
          "fill-opacity" : function(d,i){
             var prov = d3.select(this).attr("id").replace("CA-","");
             var val = last_year_data[prov];
             return color_scale(val);
          },
          "stroke-width" : "2px",
          "stroke" : "#1f77b4",
          "stroke-opacity" : function(d,i){
             var prov = d3.select(this).attr("id").replace("CA-","");
             var val = last_year_data[prov];
             return color_scale(val);
          }
        });


    add_graph = function(prov){
      var prov_data;
      if (prov !== "Canada") {
        prov_data = _.pluck(data, prov);
      } else {
        prov_data = _.map(data,function(year_data){
           return d3.sum(_.values(year_data));
        });
      }
      var container = html.selectAll(".three-year-container");
      if (container.datum() === prov){
        return;
      } else {
        container.datum(prov);
      }
      //empty out the group
      container.selectAll("*").remove();
      // create a bar graph
      BAR.bar({
         title : "Three Year trend for: " + prov,
         add_labels : true,
         add_xaxis : true,
         colors : function(){return "#1f77b4";},
         label_formater : formater,
         series : {"":prov_data},
         width : scaled_three_year_size[0],
         height : scaled_three_year_size[1],
         ticks : ticks
      })(container);

      container.selectAll("rect").style({
        "opacity" :  color_scale(_.last(prov_data))
      });

      // rotate the x-axis ticks
      container.selectAll(".x.axis .tick text")
        .style({ 'font-size' : "10px" });
    };

    html_toggle = function(d){
      add_graph(d[0]);
    };

    html.selectAll("div.label")
      .data(_.pairs(last_year_data))
      .enter()
      .append("div")
      .attr("class","label")
      .on("mouseenter", html_toggle)
      .on("mouseleave", function(){add_graph("Canada");})
      .each(function(d,i){
        var prov = d[0];
        var label = svg.selectAll("g.label").filter(function(){
          return d3.select(this).attr("id").replace("label-","") === prov;
        });
        var coords = label.attr("transform")
                          .replace("translate(","")
                          .replace(")","")
                          .split(",");
        d3.select(this)
           .style({
             "border-radius" : "5px",
             "position" : "absolute",
             "left" : padding+scale*coords[0]+"px",
             "top" : scale*coords[1]+"px",
             "text-align": "center",
             "font-size" : "10px",
             "width" : scale*94+"px",
             "height" : scale*80+"px",
             "background-color" : "#CCC"
           }) ;
        d3.select(this)
          .append("div")
          .html(prov);

        d3.select(this)
           .append("a")
           .attr('href','#')
           .style({
             "color" : "black",
             "text-decoration" : "none"
           })
           .html(formater(d[1]))
           .on("click", html_toggle)
           .on("focus", html_toggle);
      });

    add_graph("Canada");
  });


})();

