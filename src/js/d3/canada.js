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
         last_year_data = _.last(data),
         ticks = this.ticks,
         formater = this.formater,
         max = d3.max(d3.values(last_year_data)),
         color_scale = d3.scale.linear().domain([0,max]).range([0.1,1]),
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
       .attr("class","three-year-container")
       .style({
         "position":"relative",
         "height" : scaled_three_year_size[1]+'px',
         "width" : scaled_three_year_size[0]+'px'
       });

     svg = html.select("svg");

     svg
        .attr({
          "height" :  height +"px",
          "width" :  this.width +"px",
        })
        .select("g.container")
        .attr("transform","translate("+padding+",0),scale("+scale+")");

     svg.selectAll(".province")
        .style({
          "fill" : "#2ca02c",
          "fill-opacity" : function(d,i){
             var prov = d3.select(this).attr("id").replace("CA-","");
             var val = last_year_data[prov];
             return color_scale(val);
          },
          "stroke-width" : "2px",
          "stroke" : "#2ca02c",
          "stroke-opacity" : function(d,i){
             var prov = d3.select(this).attr("id").replace("CA-","");
             var val = last_year_data[prov];
             return color_scale(val);
          }
        });

    svg.selectAll("g.label")
     .append("rect")
     .attr({
       "width" : 94,
       "height" : 80,
       "rx" : 10,
       "ry" : 10
     })
    .style({
      "opacity":0.65822784,
      "fill": "grey",
      "fill-opacity": 0.2,
      "stroke":"none"
    });

    add_graph = function(prov){
      var prov_data = _.pluck(data, prov);
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
         add_labels : true,
         add_xaxis : true,
         html_ticks : true,
         colors : function(){return "#2ca02c";},
         label_formater : formater,
         series : {"":prov_data},
         width : scaled_three_year_size[0],
         height : scaled_three_year_size[1],
         ticks : ticks
      })(container);

      container.selectAll("rect").style({
        "opacity" :  color_scale(_.last(prov_data))
      });
    };

    html_toggle = function(d){
      add_graph(d[0]);
    };

    svg_toggle = function(d){
      add_graph(d);
    };

    svg.selectAll("g.label")
      .each(function(){
         // set the data attribute to the province code
         var prov = d3.select(this).attr("id").replace("label-","");
         d3.select(this).datum(prov);
      })
      .on("click", svg_toggle)
      .on("mouseenter", svg_toggle)
      .append("text")
      .attr("transform","translate(47,30)")
      .style("text-anchor","middle")
      .text(function(d,i){
        return d;
      })
      .on("mouseenter", svg_toggle);

    html.selectAll("div.label")
      .data(_.pairs(last_year_data))
      .enter()
      .append("div")
      .attr("class","label")
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
             "position" : "absolute",
             "left" : padding+scale*coords[0]+"px",
             "top" : 20+scale*coords[1]+"px",
             "text-align": "center",
             "font-size" : "10px",
             "width" : scale*94+"px"
           })
           .append("a")
           .attr('href','#')
           .html(formater(d[1]))
           .on("click", html_toggle)
           .on("mouseenter", html_toggle)
           .on("focus", html_toggle);
      });
  });

})();

