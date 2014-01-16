(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');

  function add_arrow(sel){
    return sel
        .append("path")
        .style({
          "stroke-width":1,
          "stroke-opacity":1,
          "fill-opacity":0.5
        })   
        .attr({
          "d" :  "M 29.653912,-0.10968436 0.36255227,38.029976 l 12.51457473,0 0,61.44578 33.074233,0 0,-61.41987 12.929135,0 -29.226583,-38.16557036 z",
          "class" : "arrow"
        })
  }

  D3.arrows = D3.extend_base(function(svg,index){

      this.width = $(svg.node().parentNode).width() ;
      var margin = this.margin || {top: 30, 
                                    right: 10, 
                                    bottom: 30, 
                                    left: 10};
      var formater = this.formater;
      var arrow_width = 60;
      var arrow_height = 100;
      var padding = 10;
      this.width = this.width - margin.left - margin.right;
      var height = this.height = this.height - margin.top - margin.bottom;

      // based on the height of the pane
      var scale = d3.scale.linear()
        .domain([0,d3.max(this.data, function(d){return Math.abs(d.value);})])
        .range([1,this.height/arrow_height])
        .clamp(true);

      // get offset to shift the circles into the middle of the 
      // pane
      var required_width = d3.sum(this.data, function(d){
        return scale(d.value)*arrow_width;
      }) + this.data.length * padding;

      var x_offset = (this.width - required_width)/2+margin.left;
    
      svg  = svg
        .attr("width", this.width+margin.left+margin.right)
        .attr("height", this.height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(" + x_offset + "," + margin.top + ")");

      var html = d3.select(D3.get_html_parent(svg));

      // join the filtered data to the circles
      var arrow = svg.selectAll("g.arrow")
          .data(this.data,function(d){ return d.name;});
      var bottomtext = html.selectAll("div.bottomtext")
          .data(this.data,function(d){ return d.name;});

      _.each(this.data, function(d,i,col){
        d.scale = scale(Math.abs(d.value))
        d.width = d.scale * arrow_width;
        d.height = d.scale * arrow_height;
        d.y = height -  d.height ;
        d.x = 0;
        if (i>0){
          d.x = col[i-1].x + col[i-1].width;
        }
      },this);

      arrow.exit().remove();

      arrow
        .enter()
        .append("g")
        .attr("class","arrow")
        .attr("transform",function(d,i){
          return "translate(" + d.x+ "," +d.y + ")";
        })
        .each(function(d,i){
          add_arrow(d3.select(this));
        })

      arrow
        .selectAll("path.arrow")
        .attr("transform",function(d,i){
          var transform = '';
          if (d.value <0){
            transform += "rotate(180,"+d.width/2+","+d.height/2+")";
          }
          transform += "scale("+ d.scale+ ") ";
          return transform;
        })
        .style({
          "fill" : function(d,x,i){ return D3.tbs_color(i);},
          "stroke": function(d,x,i){ return D3.tbs_color(i);}
        });

        arrow
          .append("text")
          .attr({
            "x" : function(d){
              return d.width/2;
            } ,
            "y" :  function(d){
              return d.height/2;
            }
          })
          .style({
            "text-anchor" : "middle"
          })
          .text(function(d){
            return formater(d.value);
          })

      bottomtext.exit().remove();
      bottomtext.enter().append("div");
      bottomtext
        .html(function(d){ return d.name})
         .attr("class", "font-serif bottomtext")
         .style({
          "top"  : this.height+margin.bottom+"px",
          "text-align": "center",
          "position" : "absolute",
          "color" : "#222",
          "font-size" : "12px",
          "width" : function(d){ return d.width+"px";},
          "left"  : function(d){ return x_offset+d.x+"px";}
         });


  });


})();

