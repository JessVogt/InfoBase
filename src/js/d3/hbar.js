(function() {

    var D3 = ns('D3');
    var BAR = ns('D3.BAR');

    BAR.hbar = D3.extend_base(function(svg,index){
      /* data in the format of 
        [{ "val" : 10, "name" : "XYZ" },
        { "val" : 12, "name" : "XYZ" },
        { "val" : 11, "name" : "XYZ" }
        ]
      */
      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      this.bar_height = 30;
      this.margins = margin;
      this.width = this.width - margin.left - margin.right;
      this.x_scale.range([0,this.width]);
      this.padding = 0.1;
      this.chart.update = _.bind(update,this);

      this.svg  = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,0)");

      this.html = d3.select(D3.get_html_parent(this.svg));

      if (this.data) {
        this.chart.update();
      }
    });

    function update(options){

       _.extend(this,options);

      this.height = (this.bar_height*(1+this.padding))*this.data.length;

      d3.select(this.svg.node().parentNode)
        .attr("width", this.width+this.margins.left+this.margins.right)
        .attr("height", this.height+this.margins.top+this.margins.bottom);

      var y = d3.scale.ordinal()
                 .domain(_.pluck(this.data, "name"))
                 .rangeRoundBands([0,this.height],this.padding,0),
           margins = this.margins,
           href = this.href || function(d,i){return '#';},
           offset = D3.get_offset(this.svg),
           extent = d3.extent(this.data, function(d){return d.value;}),
           x_left = extent[0] > 0 ? 0 : extent[0],
           x_right = extent[1] < 0 ? 0 : extent[1],
           x_scale,
           data = this.data,
           formater = this.formater || _.identity,
           g = this.svg.selectAll("g.bar")
            .data(this.data,function(d){return d.name;});
           text = this.html.selectAll("div.hbar_chart_labels")
            .data(this.data,function(d){return d.name;});

      x_scale = this.x_scale.domain([x_left,x_right]);

      this.xAxis = d3.svg.axis()
            .scale(this.x_scale)
            .ticks(7)
            .orient("top");
      if (this.ticks){
        this.xAxis.ticks(this.ticks);
      }
      if (this.axisFormater){
        this.xAxis.tickFormat(this.axisFormater);
      }

      this.svg
        .select(".x.axis")
        .call(this.xAxis);
        
      g.exit().remove();

      var newg =  g
         .enter()
         .append("g")
         .attr("class" , "bar" );

      newg
         .append("rect")
         .attr({ "width": this.width +"px",
                  "height" : y.rangeBand()+"px",
                  "y": "0px",
         })
         .style({
           "fill" : "#f5f5f5"
         });

       newg
         .append("rect")
         .attr({  "width": '0px',
                  "height" : y.rangeBand()-8+"px",
                  "y": "4px",
                  'class' : "fill"
         })
         .style({
            "fill" : function(d){return d.value > 0 ?  "#1f77b4" : '#A52A2A';},
            "fill-opacity" : 0.5
         });

      text
        .enter()
        .append("div")
        .attr("class","hbar_chart_labels")
        .style({
          "text-align" : "right",
          "position" : "absolute",
          "width" : this.width+"px",
          "left" : margins.left+"px",
          "font-size" : "10px"
        })
        .append("a")
        .style("color","black");

      text.exit().remove();

       //newg .append("text") .attr({ "x":  this.width- 20+"px", "y": (1+this.padding)*y.rangeBand()/2+"px" , "dy" : "4px", "text-anchor": "end" }) .style({ "font-weight":"bold", "fill":"#000" })

       text.order();

       text.each(function(d,i){
         single = d3.select(this);
         single
           .transition()
           .duration(1000)
           .style({
              "top" : margins.top +4+ y(d.name) + "px"
           });
         single.selectAll("a")
           .html(d.name + " - "+ formater(d.value))
           .attr("class","router")
           .attr("href",href);
       });

       g.each(function(d,i){
         var x_val = y(d.name);
         var width =  Math.abs(x_scale(d.value) - x_scale(0));
         single = d3.select(this);
         single
          .transition()
          .duration(1000)
          .attr("transform", "translate(0,"+x_val+")" ); 

         single
           .selectAll("rect.fill")
           .transition()
           .delay(1000)
           .duration(500)
           .attr({
             "x": x_scale(Math.min(0, d.value)),
             "width": Math.abs(x_scale(d.value) - x_scale(0))
           })
           .style({
             "fill" : d.value > 0 ?  "#1f77b4" : '#A52A2A'
           });

         //single .transition() .duration(2000) .text( d.name + " - "+ formater(d.value)); 
       });

    }


})();
