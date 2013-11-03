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
      var bar_height = 30,
          margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};

      this.width = this.width - margin.left - margin.right,
      this.x_scale.range([0,this.width]);
      this.xAxis = d3.svg.axis()
            .scale(this.x_scale)
            .tickPadding(5)
            .orient("top");
      this.padding = 0.2;
      this.chart.update = _.bind(update,this);
      this.height = (bar_height*(1+this.padding))*this.data.length

      this.svg  = svg
        .attr({
          width : this.width+margin.left+margin.right,
          height : this.height+margin.top+margin.bottom})
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,0)")
      this.chart.update();
    });

    function update(options){
       _.extend(this,options);

       var y = d3.scale.ordinal()
                 .domain(_.pluck(this.data, "name"))
                 .rangeRoundBands([0,this.height],this.padding),
           extent = d3.extent(this.data, function(d){return d.val}),
           x_left = extent[0] > 0 ? 0 : extent[0],
           x_right = extent[1] < 0 ? 0 : extent[1],
           x_scale,
           g = this.svg.selectAll("g.bar")
            .data(this.data,function(d){return d.name;});

      
      x_scale = this.x_scale.domain([x_left,x_right]);
      this.svg.select(".x.axis").call(this.xAxis);

      var newg =  g
         .enter()
         .append("g")
         .attr("class" , "bar" )

      newg
         .append("rect")
         .attr({ "height" : 0, 
                  "width": "100%",
                  "height" : y.rangeBand(),
                  "y": "0px",
         })
         .style({
           "fill" : "#f5f5f5"
         });

       newg
         .append("rect")
         .attr({ "height" : 0, 
                  "width": 0,
                  "height" : y.rangeBand()-8+"",
                  "y": "4px",
                  'class' : "fill"
         })
         .style({
            "fill" : "#1f77b4",
            "fill-opacity" : 0.5
         });

       newg
         .append("text")
           .attr({
             "x":  this.width- 20+"px",
             "y": (1+this.padding)*y.rangeBand()/2+"px" ,
             "dy" : "4px",
             "text-anchor": "end"
           })
          .style({
           "font-weight":"bold",
           "fill":"#000"
          })
       
       g
         .transition()
         .duration(1500)
         .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; }); 

       g
         .selectAll("rect.fill")
         .transition()
         //.duration()
         .attr({
           "x": function(d) { return x_scale(Math.min(0, d.val)); },
           "width": function(d) { return Math.abs(x_scale(d.val) - x_scale(0)); }
         });

       g
         .selectAll("text")
         .text(function(d){ return d.name + " - "+ d.val;});

    }


})();
