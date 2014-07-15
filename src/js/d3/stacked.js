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
      var margin = {top: 20, right: 20, bottom: 30, left: 50};
      var legend_width = 150;
      var width = this.width - margin.left - margin.right;
      var height = this.height - margin.top - margin.bottom;
      var html = d3.select(D3.get_html_parent(svg));
      var labels = _.map(this.labels, function(label){
        return {label: label, active:true};
      });
      var color = (this.colors || d3.scale.category10()).domain(this.labels);

      svg = svg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var legend = D3.create_list(
        html.append("div")
        .style({"position": "absolute",
                "right" : "10px",
                "top" : "10px",
        }),
        labels,
        {
          html : function(d){ return d.label;},
          colors : function(d){ return color(d.label);},
          width : legend_width,
          legend : true,
          interactive : true,
          height : color.domain().length * 20 + 40
        });

      var render = function() {

        var data = _.map(source_data, function(row, i){
            var y0 = 0;
            var stacked = _.chain(labels)
               .filter(function(label){return label.active;})
               .map( function(label){
                  return {
                    label : label.label,
                    y0 : y0,
                    y1 : y0 += row.vals[label.label]
                  };
               })
               .value();
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

        rects.exit().remove();

        rects.enter().append("rect");

        rects.transition()
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y1); })
          .attr("height", function(d) { return y(d.y0) - y(d.y1); })
          .style("fill", function(d) { return color(d.label); });

      };

      // add button to toggle between percentage
      // composition and aboslute value
      html
        .append("div")
        .classed("well border-all", true)
        .style({
          "width" : legend_width+"px",
          "padding-left" : "10px",
          "margin-right" : "10px",
          "position" : "absolute",
          "font-size" : "12px",
          "right" : "10px",
          "top" : 10 + 10 +  color.domain().slice().length * 20 + 40  + "px"
        })
        .append("a")
        .html("Alternate")
        .on("click",function(){
           normalized = !normalized;
           render();
        });

      render();

      legend.dispatch.on("click", function(d){
        d.active = !d.active;
        if (_.filter(labels, function(label){return label.active;}).length === 0){
           d.active = true;
           return;
        }
        var tag = legend.list.selectAll(".color-tag")
              .filter(function(_d){ return _d === d;});
        if (d.active){
          tag.style("background-color", color(d.label));
        } else {
          tag.style("background-color", "transparent");
        }
              
        render();
      });
    });
})();

