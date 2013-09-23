(function() {
    var D3 = ns('D3');
    var PACK = ns('D3.PACK');

    PACK.create_data_nodes = function(data,labels){
      if (_.isUndefined(labels)){
        return _.map(data, function(d){
          return {name : d[0],value: d[1] };
        });
      } 
      return _.map(data, function(d,i){
        return {value: d, name : labels[i]};
      });
    }

    PACK.pack_data = function(data, level_name,attr,levels,soften){
      //
      // expects an array of objects
      //
      //
      soften = soften || true;
      levels = levels || 2;
      attr = attr || 'value';
      var softened;
      var accessor = function(d){return d[attr]};
      var extent = d3.extent(_.map(data,accessor));
      var scale = d3.scale.log().domain(extent).rangeRound([0,levels]);
      var groups = d3.nest()
        .key(function(d){ return scale(accessor(d));})
        .sortKeys(d3.descending)
        .entries(data);
      var rtn = {
        name: '',
        children: soften ? PACK.soften_spread(groups[0].values,attr) : groups[0].values
      };
      var pointer = rtn.children;
      for (var _i=1;_i<groups.length; ++_i){
        if (soften) {
          softened = PACK.soften_spread(groups[_i].values,attr);
        } else {
          softened = groups[_i].values;
        }
        pointer.push({
          name : level_name,
          children : softened
        });
        pointer = _.last(pointer).children;
      }
      return rtn;
    };

    PACK.soften_spread = function(data,attr,p){
      // expected array of objects with one particular attribute
      // whose value ranges from 0 upwards
      p = p || 0.1;
      attr = attr || 'value';
      var accessor = function(d){return d[attr]};
      var max = d3.max(data,accessor);
      var map = d3.scale.linear().domain([0,max]).range([p*max,max]);
      _.each(data, function(d){
        d[attr] = map(d[attr]);
      });
      return data
    };

    PACK.pack = D3.extend_base(function(svg,index){
      /*
      {
        name: '' ,
        value : 10000,
        children : [
      ]
      }
      */
      var rand = Math.round(Math.random()*1000000);
      var k;
      var is_mini = this.is_mini;
      var dispatch = this.dispatch;
      var data = this.data;
      var radius = this.width;
      var x_scale = d3.scale.linear()
                       .range([0,this.width]);
      var y_scale = d3.scale.linear()
                       .range([0,this.width]);
      var pack=  d3.layout.pack()
                   .size([this.width,this.width]);

      var nodes = pack.nodes(data);
      if (is_mini){
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

        circle.exit().remove();

        var new_circles = circle
          .enter()
            .append("g")
            .attr("class","node")
            .append("circle")
            .on("mouseover", dispatch.dataHover)
            .on("click.external", dispatch.dataClick)

        if (!is_mini){
          new_circles.on("click.drill", on_circle_click)
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

        var text = d3.select("body").selectAll("div.label_"+rand)
              .data(nodes_with_text,function(d){ return d.name+d.depth;});

        text.exit().remove();

        text
          .enter()
            .append("div")
            .attr("class","label_"+rand)
            .on("mouseover", dispatch.dataHover)
            .on("click", on_circle_click);

        text
         .transition()
         .style({
           top : function(d){ 
             return d.absolute_zoom_pos.y -10 + "px";
           },
           left: function(d){ 
             return d.absolute_zoom_pos.x - d.zoom_r + 10 + "px";
           },
           position: "absolute",
           "color" : "steelblue",
           'font-size': "6px",
           "text-align" : "centre",
           "width": function(d){return d.zoom_r +'px';}
         })
         .text(function(d) { 
           if (d.zoom_r > 30){
            return d.name; 
           }
         });
      }
      function on_circle_click(node){
        if (node.children && node.children.length > 0){
          k = radius / node.r / 2;
          x_scale.domain([node.x - node.r, node.x + node.r]);
          y_scale.domain([node.y - node.r, node.y + node.r]);
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
        var offset = D3.get_offset(svg);
        var pos = zoom_position(x,y);
        return {x:pos.x+offset.left,y:pos.y+offset.top};
      }
    });


})();

