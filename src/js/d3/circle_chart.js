(function() {

    var D3 = ns('D3');
    var PACK = ns('D3.PACK');

    PACK.simple_circle_chart = D3.extend_base(function(svg,index){

      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      this.width = $(svg.node().parentNode).width() ;
      var formater = this.formater || _.identity;
      var padding = 5;
      this.width = this.width - margin.left - margin.right;
      this.height = this.height - margin.top - margin.bottom;

      // based on the height of the pane
      var scale = d3.scale.linear()
        .domain([0,d3.max(this.data, function(d){return d.value;})])
        .range([0,this.height/2]);
      // set the font scale
      var font_size = d3.scale.linear()
        .domain([100,500])
        .rangeRound([16,40])(this.height);
         

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
          .on("click", this.dispatch.dataClick)

      circle
        .attr({
          "cx": function(d) { return d.x; },
          "cy": function(d) { return d.y; },
          "r" : function(d) { return  d.r; }
        })
        .style({
          "fill" : function(d,i){ return D3.tbs_color(i);},
          "fill-opacity" : 0.8,
          "stroke" : function(d,i){ return D3.tbs_color(i);},
          "stroke-width" : "2px",
          "stroke-opacity" : 1
        });

      text_style = {
          "text-align": "center",
          "position" : "absolute",
          "color" : "#222",
          "font-size" : font_size+"px",
          "width" : function(d){ return d.r*2+"px";},
          "left"  : function(d){ return x_offset+d.x-d.r+"px";}
        }

      toptext.exit().remove();
      toptext.enter().append("div");
      toptext
        .html(function(d){ return d.top_text})
         .attr("class", "font-serif")
        .style(_.extend({ "top"  : "0px"
                        },text_style)
        );

      bottomtext.exit().remove();
      bottomtext.enter().append("div");
      bottomtext
        .html(function(d){ return d.bottom_text})
         .attr("class", "font-serif")
        .style(_.extend({ "top"  : this.height+margin.bottom+"px"
                        },text_style)
        );

     middletext.exit().remove();
     middletext.enter().append("div");
     middletext
        .html(function(d){ return formater(d.value);})
         .attr("class", "font-serif")
        .style(_.extend({ "top"  : function(d){return d.y+font_size/2+"px"}
                        },text_style)
        );
                   
    });

    PACK.circle_pie_chart = D3.extend_base(function(svg,index){

      var margin = this.margin || {top: 30, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      this.width = this.width - margin.left - margin.right;
      var height = this.height = this.height - margin.top - margin.bottom;

      // based on the height of the pane
      var scale = d3.scale.linear()
        .domain([0,d3.max(this.data, function(d){return d.value;})])
        .range([0,this.height/2]);


      var x_offset = margin.left+this.width/2;

      svg  = svg
        .attr("width", this.width+margin.left+margin.right)
        .attr("height", this.height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(" + x_offset + "," + margin.top + ")");

      var html = d3.select(D3.get_html_parent(svg));
      _.each(this.data, function(d,i,col){
        d.r = scale(d.value);
      });

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
          .on("click", this.dispatch.dataClick)

      circle
        .attr({
          "cy": function(d) { return d.r; },
          "cx": "0px",
          "r" : function(d) { return  d.r; }
        })
        .style({"fill" : function(d,i){ return D3.tbs_color(i);}});

      text.exit().remove();
      text.enter().append("div");
      text
        .html(function(d){ return d.value;})
        .style({
          "text-align": "center",
          "position" : "absolute",
          "width" : this.width+margin.bottom+margin.left+margin.right+"px",
          "top"  : function(d,i){
            if (i===0){
              return height+"px";
            } else {
              return height-d.r-10+"px";
            }
          },
          "left"  : "0px"
        });

    })
})();
