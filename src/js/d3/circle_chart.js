(function() {

    var D3 = ns('D3');
    var PACK = ns('D3.PACK');

    PACK.simple_circle_chart = D3.extend_base(function(svg,index){

      this.width = $(svg.node().parentNode).width() ;
      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      var formater = this.formater || _.identity;
      var padding = 5;
      var colors = this.colors || D3.tbs_color;
      this.width = this.width - margin.left - margin.right;
      this.height = this.height - margin.top - margin.bottom;
      var smallest_dimension = Math.min(this.height, this.width/this.data.length);
      var font_range = this.font_range || [16,30];

      // based on the height of the pane
      var scale = d3.scale.linear()
        .domain([0,d3.max(this.data, function(d){return d.value;})])
        .range([30,smallest_dimension/2]);
      // set the font scale
      var font_size = d3.scale.linear()
        .domain([0,d3.max(this.data, function(d){return d.value;})])
        .rangeRound(font_range);
         

      // get offset to shift the circles into the middle of the 
      // pane
      var required_width = d3.sum(this.data, function(d){
        return 2*scale(d.value);
      }) + this.data.length * padding;

      var x_offset = (this.width - required_width)/2+margin.left;

      svg  = svg
        .attr("width", this.width+margin.left+margin.right)
        .attr("height", this.height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(" + x_offset + "," + margin.top + ")");

      var html = d3.select(D3.get_html_parent(svg));

      _.each(this.data, function(d,i,col){
        d.r = scale(d.value);
        d.y = this.height - d.r;
        if (i>0){
          d.x = d.r + col[i-1].r + col[i-1].x + padding;
        } else {
          d.x = d.r;
        }
      },this);

      // join the filtered data to the circles
      var circle = svg.selectAll("circle")
          .data(this.data,function(d){ return d.name;});
      var toptext = html.selectAll("div.toptext")
          .data(this.data,function(d){ return d.name;});
      var middletext = html.selectAll("div.middletext")
          .data(this.data,function(d){ return d.name;});
      var bottomtext = html.selectAll("div.bottomtext")
          .data(this.data,function(d){ return d.name;});
      // join the filtered data to any divs with labels

      circle.exit().remove();

      circle
        .enter()
          .append("circle")
          .on("mouseenter", this.dispatch.dataMouseEnter)
          .on("mouseleave", this.dispatch.dataMouseLeave)
          .on("click", this.dispatch.dataClick);

      circle
        .attr({
          "cx": function(d) { return d.x; },
          "cy": function(d) { return d.y; },
          "r" : function(d) { return  d.r; }
        })
        .style({
          "fill" : function(d,i){ return colors(i);},
          "fill-opacity" : 0.5,
          "stroke" : function(d,i){ return colors(i);},
          "stroke-width" : "2px",
          "stroke-opacity" : 1
        });

      text_style = {
          "text-align": "center",
          "position" : "absolute",
          "color" : "#222",
          "font-size" : "20px",
          "width" : function(d){ return d.r*2+"px";},
          "left"  : function(d){ return x_offset+d.x-d.r+"px";}
        };

      toptext.exit().remove();
      toptext.enter().append("div");
      toptext
        .html(function(d){ return d.top_text;})
         .attr("class", "font-serif")
        .style(_.extend({ "top"  : "0px"
                        },text_style)
        );

      bottomtext.exit().remove();
      bottomtext.enter().append("div");
      bottomtext
        .html(function(d){ return d.bottom_text;})
         .attr("class", "font-serif")
        .style(_.extend({ "top"  : this.height+margin.top+"px"
                        },text_style)
        );

     middletext.exit().remove();
     middletext.enter().append("div");
     middletext
        .html(function(d){ return formater(d.value);})
         .attr("class", "font-serif")
        .style(_.extend(_.clone(text_style),{ 
                          "top"  : function(d){ return d.y + margin.top - font_size(d.value)/2+"px";},
                          "font-size" : function(d){ return font_size(d.value)+"px";}
                        })
        );
                   
    });

    PACK.circle_pie_chart = D3.extend_base(function(svg,index){
      this.width = $(svg.node().parentNode).width() ;
      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      this.width = this.width - margin.left - margin.right;
      var centre = this.centre || false;
      var height = this.height = this.height - margin.top - margin.bottom;
      var formater = this.formater || _.identity;
      var font_size = this.font_size || 16;
      var data = this.data;
      // based on the height of the pane
      var scale = d3.scale.pow()
        .exponent(0.5)
        .domain([1,d3.max(this.data, function(d){return d.value;})])
        .range([1,this.height/2]);


      var x_offset = margin.left+this.width/2;

      svg  = svg
        .attr("width", this.width+margin.left+margin.right)
        .attr("height", this.height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(" + x_offset + "," + margin.top + ")");

      var html = d3.select(D3.get_html_parent(svg));


      // join the filtered data to the circles
      var circle = svg.selectAll("circle")
          .data(this.data,function(d){ return d.name;});
      var text = html.selectAll("div.middletext")
          .data(this.data,function(d){ return d.name;});
      // join the filtered data to any divs with labels

      circle.exit().remove();

      circle
        .enter()
          .append("circle")
          .on("mouseenter", this.dispatch.dataMouseEnter)
          .on("mouseleave", this.dispatch.dataMouseLeave)
          .on("click", this.dispatch.dataClick);

      circle
        .attr({
          "cy": function(d,i) { 
            if (centre && i > 0){
              return scale(data[0].value);
            } else {
              return scale(d.value); 
            }
          },
          "cx": "0px",
          "r" : function(d) { return  scale(d.value); }
        })
        .style({
          "fill" : function(d,i){ return D3.tbs_color(i);},
          "fill-opacity" : 0.5,
          "stroke" : function(d,i){ return D3.tbs_color(i);},
          "stroke-width" : "2px",
          "stroke-opacity" : 1
        });

      text.exit().remove();
      text.enter().append("div");
      text
        .html(function(d){ return formater(d.value);})
        .style({
          "text-align": "center",
          "position" : "absolute",
          "text-weight" : "bold",
          "font-size" : font_size + "px",
          "width" : this.width+margin.bottom+margin.left+margin.right+"px",
          "top"  : function(d,i){ 
            if (i === 0) {
              // the containing circle, the text should be located below
              return margin.top +height+"px"; 
            } else if (centre){
              return scale(data[0].value)+"px";
            } else {
              // the contained circle, the text should be located below
              return margin.top+scale(d.value)-font_size+"px"; 
            }},
          "left"  : "0px"
        });

    });
})();
