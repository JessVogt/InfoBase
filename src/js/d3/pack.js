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

    PACK.pack_data = function(data, level_name,options){
      //
      // expects an array of objects
      //
      //
      var soften = typeof options.soften == undefined ? true : soften,
       levels = options.levels || 2,
       attr = options.attr || 'value',
       accessor = function(d){return d[attr]},
       extent = d3.extent(_.map(data,accessor)),
       scale = options.scale || d3.scale.log()
         .domain(extent)
         .rangeRound([0,levels]),
       groups = d3.nest()
        .key(function(d){ return scale(accessor(d));})
        .entries(data),
       pointer = { name: '' },
       rtn = pointer,
       group_extent = d3.extent(groups,function(d){return parseInt(d.key)}),
       softened,group,_i;
      for (_i=group_extent[1];_i>=group_extent[0]; --_i){
        group = _.find(groups,function(x){return parseInt(x.key) === _i});
        softened = soften ? PACK.soften_spread(group.values,attr):  group.values;
        pointer.children = softened;
        if (_i>group_extent[0]){
          pointer = {name:level_name};
          softened.push(pointer);
        }
      }
      return rtn;
    };

    PACK.soften_spread = function(data,attr,p){
      // expected array of objects with one particular attribute
      // whose value ranges from 0 upwards
      p = p || 0.005;
      attr = attr || 'value';
      var accessor = function(d){return d[attr]};
      var max = d3.max(data,accessor);
      var map = d3.scale.linear().domain([0,max]).range([p*max,max]);
      _.each(data, function(d){
        d[attr] = map(d[attr]);
      });
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
      var that = this,
          rand = Math.round(Math.random()*1000000),
          k,
          is_mini = this.is_mini,
          dispatch = this.dispatch,
          data = this.data,
          radius = this.width,
          x_scale = d3.scale.linear() .range([0,this.width]),
          y_scale = d3.scale.linear() .range([0,this.width]),
          pack=  d3.layout.pack() .size([this.width,this.width]),
          nodes = pack.nodes(data);
      this.nodes = nodes;
      if (is_mini){
        nodes = _.filter(nodes,function(d){ return d.depth <= 1;});
      }

      svg = svg
        .attr({
          "width": radius,
          "height":radius})
        .append('g');

      var on_circle_click = function(node){
        if (node.children && node.children.length > 0){
          k = radius / node.r / 2;
          x_scale.domain([node.x - node.r, node.x + node.r]);
          y_scale.domain([node.y - node.r, node.y + node.r]);
          draw(node);
        }
      }
      if (!is_mini){
        dispatch.on("dataClick.__zoom__",on_circle_click);
        dispatch.dataClick.call(null, nodes[0],0);
      } else {
        on_circle_click(nodes[0]);

      }


      function draw(node){
        _.each(nodes,apply_scales);
        var depth = that.depth = node.depth;
        that.node = node;

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

       var font_scale  = d3.scale.linear()
         .domain(d3.extent(nodes_with_text, function(d){return d.zoom_r}))
         .range([4,30]);

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
            .on("mouseenter", dispatch.dataMouseEnter)
            .on("mouseleave", dispatch.dataMouseLeave)
            .on("click", dispatch.dataClick)

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

        var text = svg.selectAll("text")
              .data(nodes_with_text,function(d){ return d.name+d.depth;});

        text.exit().remove();

        text
          .enter()
          .append("svg:text")
            .on("mouseover", dispatch.dataHover)
            .on("click", dispatch.dataClick)

        text
         .transition()
         .each(function(d){
           if (d.zoom_r > 30){
            d.zoom_text= _.first(d.name.split(" "),2).join(" "); 
           } else {
            d.zoom_text  = '...'
           }
           var first_word = d.zoom_text.split(" ")[0];
           d.zoom_text = d.zoom_text.replace(" and ",'').replace(" et ",'');
           d.font_size =  font_scale(d.zoom_r);
         })
         .attr({
           "x": function(d) { return d.zoom_pos.x; } ,
           "y": function(d) { return d.zoom_pos.y; } ,
           "dy": ".35em",
           "text-anchor": "middle"
         })
         .style("font-size" , function(d){ return d.font_size})
         .text(function(d) { return d.zoom_text; });  
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

