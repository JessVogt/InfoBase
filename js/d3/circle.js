(function() {
    var D3 = ns('D3');


    D3.pack = D3.extend_base(function(svg,index){
      /*
      {
        name: '' ,
        value : 10000,
        children : [
      ]
      }
      */
      var k;
      var offset = D3.get_offset(svg);
      var dispatch = this.dispatch;
      var data = this.data;
      var radius = this.width;
      var x_scale = d3.scale.linear()
                       .range([0,this.width]);
      var y_scale = d3.scale.linear()
                       .range([0,this.width]);
      var pack=  d3.layout.pack()
                   .size([this.width,this.width]);

      nodes = pack.nodes(data);
      if (this.is_mini){
        nodes = _.filter(nodes,function(d){ return d.depth <= 1;});
      }

      svg = svg
        .attr({
          "width": radius,
          "height":radius})
        .append('g');
      on_circle_click(nodes[0]);

      function draw(node){
        _.each(nodes,apply_scales);
        var depth = node.depth;

        // filter to the ondes which are being drawn
        // i.e. the current depth plus 2 down
        var nodes_shown = _.filter(nodes,function(d){
          return d.depth <= depth +2 ;
        });
        // filter to the ondes which are being drawn
        // i.e. only those who are children of the current node
        var nodes_with_text =  _.filter(nodes,function(d){
          return _.indexOf(node.children,d) != -1;
        });           
        // join the filtered data to the circles
        var circle = svg.selectAll(".node")
            .data(nodes_shown,function(d){ return d.name+d.depth;});
        // join the filtered data to any divs with labels
        var text = d3.selectAll("div.svg_label")
              .data(nodes_with_text,function(d){ return d.name+d.depth;});

        circle.exit().remove();

        var new_circles = circle
          .enter()
            .append("g")
            .attr("class","node")
            .append("circle")
            .on("mouseover", dispatch.dataHover)
            .on("click", dispatch.dataClick);

        if (!this.is_mini){
          new_circles.on("click", on_circle_click)
        }

        circle.selectAll("circle")
          .transition()
          .attr({
            "class" : function(d) { 
               if (d.depth === 0) {
                 return  "grand-parent"; 
               } else if (d.depth <=  depth+1 ) {
                 return "parent" ;
               } else if (d.depth == depth +2){
                 return  "child"; 
               }
            },
            "cx": function(d) { return d.zoom_pos.x; },
            "cy": function(d) { return d.zoom_pos.y; },
            "r" : function(d) { return  d.zoom_r; }
          });

        text.exit().remove();

        text
          .enter()
            .append("div")
            .attr("class","svg_label")
            .on("mouseover", dispatch.dataHover)
            .on("click", on_circle_click);

        text
         .style({
           top : function(d){ 
             return d.absolute_zoom_pos.y - d.zoom_r + 20 + "px";
           },
           left: function(d){ 
             return d.absolute_zoom_pos.x - d.zoom_r/2 + "px";
           },
           position: "absolute",
           "color" : "steelblue",
           'font-size': "6px",
           "text-align" : "centre",
           width: function(d){return d.zoom_r - 10 +'px';}
         })
         .text(function(d) { 
           if (d.zoom_r > 30){
            return d.name; 
           }
         });
      }
      function on_circle_click(data){
         var node = data;
         k = radius / node.r / 2;
         x_scale.domain([node.x - node.r, node.x + node.r]);
         y_scale.domain([node.y - node.r, node.y + node.r]);
         // if the current node has any children
         if (node.children){
           draw(node);
         }
      }
      function zoom_position(x,y){
        return {x: x_scale(x),y:y_scale(y)};
      }
      function apply_scales (node){
        node.zoom_pos = zoom_position(node.x,node.y);
        node.absolute_zoom_pos = absolute_zoom_position(node.x,node.y);
        node.zoom_r = k * node.r;
      }
      function absolute_zoom_position(x,y){
        var pos = zoom_position(x,y);
        return {x:pos.x+offset.left,y:pos.y+offset.top};
      }
    });

    D3.circle_test_data = {
      0 : {vname : '',
          children : [
            {
              name : 'A',
              children : [
                 {
                    name : 'C',
                    value : 4,
                    children : [
                    ]
                  },{
                    name : 'D',
                    value : 7,
                    children : [
                    ] 
                  }
              ]
            },
            {
              name : 'B',
              value : 4 ,
              children : [
              ]
            },{
              name : 'E',
              value : 7 ,
              children : [
              ]
            }
        ]
      },
      1 : [9,7,6,3,1,0.5]
    };
    
    D3.pack_test = function(data){
      $('#app')
        .children()
        .remove() ; 
      var pack = D3.pack({
        data : D3.circle_test_data[data],
        width  : 299
      });
      pack(d3.selectAll("#app"));
    };
    setTimeout(function(){ D3.pack_test(0);}, 3000);

})();

