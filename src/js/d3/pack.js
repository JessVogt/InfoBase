(function() {
    var D3 = ns('D3');
    var PACK = ns('D3.PACK');
    var APP = ns('APP');

    PACK.count_nodes = function(d){
      if (d.children){
        return d.children.length + d3.sum(d.children, PACK.count_nodes);
      } 
      return 0;
    }

    PACK.create_data_nodes = function(data,labels){
      if (_.isUndefined(labels)){
        return _.map(data, function(d){
          return {name : d[0],value: d[1] };
        });
      } 
      return _.map(data, function(d,i){
        return {value: d, name : labels[i]};
      });
    };

    PACK.pack_data = function(data, level_name,options){
      //
      // expects an array of objects
      //  and then packs them into a structure suitible for exploring
      //  this is useful for when there are large difference between the numbers
      //
      options = options || {};
      var  attr = options.attr || 'value';
      if (options.force_positive){
        _.each(data, function(x){
          x[attr] = Math.abs(x[attr]);
        });
      }
      if (options.filter_zeros){
        data = _.filter(data, function(x){
          return x[attr] !== 0;
        });
      }
      var soften = typeof options.soften === "undefined" ? true : options.soften,
          levels = options.levels || 2,
          accessor = function(d){return d[attr];},
          extent = d3.extent(_.map(data,accessor)),
          scale = options.scale || d3.scale.log()
            .domain(extent)
            .rangeRound([0,levels]),
          groups = d3.nest()
           .key(function(d){ return scale(accessor(d));})
           .entries(data),
          sorted = _.sortBy(groups,function(g){ return parseInt(g.key);}),
          // the value of pointer will be reassigned to new lower levels
          rtn; 
      
      _.each(sorted,function(group,i){
        var softened = soften ? PACK.soften_spread(group.values,attr):  group.values;
        if (i === 0){
          rtn = {name:level_name, children:softened};
        } else if (i === groups.length -1){
          softened = softened.concat(rtn);
          rtn = {name:"", children:softened};
        } else {
          softened = softened.concat(rtn);
          rtn = {name:level_name, children:softened};
        }
        if (options.per_group){
          options.per_group(rtn);
        }
      });
      return rtn;
    };

    PACK.soften_spread = function(data,attr,p){
      // expected array of objects with one particular attribute
      // whose value ranges from 0 upwards
      p = p || 0.005;
      attr = attr || 'value';
      var accessor = function(d){return d[attr];};
      var max = d3.max(data,accessor);
      var map = d3.scale.linear().domain([0,max]).range([p*max,max]);
      _.each(data, function(d){
        d[attr] = map(d[attr]);
      });
      return data;
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
          parent_width = $(svg.node().parentNode).width(),
          rand = Math.round(Math.random()*1000000),
          html = d3.select(D3.get_html_parent(svg)),
          k,
          html_tags = this.html_tags || false,
          cycle_colours = this.cycle_colours || false,
          top_font_size =  this.top_font_size,
          zoomable = this.zoomable || false,
          dispatch = this.dispatch,
          data = this.data,
          text_func = this.text_func || function(d){return d.name;},
          radius = Math.min(parent_width, this.height),
          x_scale = d3.scale.linear() .range([0,radius]),
          y_scale = d3.scale.linear() .range([0,radius]),
          pack=  d3.layout.pack().size([radius,radius]),
          nodes = pack.nodes(data);

      _.each(nodes, function(n){
        n.rid = APP.make_unique();
      })
      this.nodes = nodes;
      if (!zoomable){
        nodes = _.filter(nodes,function(d){ return d.depth <= 1;});
      }

      svg = svg
        .attr({
          "width": parent_width,
          "height":radius})
        .append('g')
         .attr("transform", "translate(0,0)");

      if (html_tags){
          html = html.append("ul").attr("class"," list-bullet-none");
      }

      var on_circle_click = function(node){
        if (node.children && node.children.length > 0){
          k = radius / node.r / 2;
          x_scale.domain([node.x - node.r, node.x + node.r]);
          y_scale.domain([node.y - node.r, node.y + node.r]);
          draw(node);
        }
      };
      if (zoomable){
        dispatch.on("dataClick.__zoom__",on_circle_click);
        dispatch.dataClick.call(null, nodes[0],0);
      } else {
        on_circle_click(nodes[0]);
      }

      function draw(node){
        _.each(nodes,apply_scales);
        var depth = that.depth = node.depth,
            text_element,
            text_class,
            sel;
        
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
         .domain(d3.extent(nodes_with_text, function(d){return d.zoom_r;}))
         .rangeRound([10,top_font_size]);

        // join the filtered data to the circles
        var circle = svg.selectAll(".node")
            .data(nodes_shown,function(d){ return d.rid;});
        // join the filtered data to any divs with labels

        circle.exit().remove();

        var new_circles = circle
          .enter()
            .append("circle")
            .on("mouseover", dispatch.dataMouseOver)
            .on("mouseout", dispatch.dataMouseOut)
            .on("click", dispatch.dataClick);

        var circles = circle
          .transition()
          .attr({
            "class" : function(d) { 
               if (d.depth === 0) {
                 return  "node grand-parent"; 
               } else if (d.depth <=  depth+1 ) {
                 return "node parent" ;
               } else if (d.depth == depth +2){
                 return  "node child"; 
               }
            },
            "cx": function(d) { return d.zoom_pos.x; },
            "cy": function(d) { return d.zoom_pos.y; },
            "r" : function(d) { return  d.zoom_r; }
          });

        if (cycle_colours){
          circles
            .filter(function(d){
               return  d.depth ===  depth+1;
            })
            .style({
              "fill" : function(d,i){ return D3.tbs_color(i); },
              "stroke" : function(d,i){ return D3.tbs_color(i);},
              "stroke-width" : "2px",
              "fill-opacity" : "0.5"
            });
        }

        if (html_tags ){
          text_element = "li";
          text_class = "text"+rand;
          sel = html;
        } else {
          text_element = "text";
          text_class = "text"+rand;
          sel = svg;
        }
        var text = sel.selectAll(text_element+"."+text_class)
              .data(nodes_with_text,function(d){ return d.rid;});

        text.exit().remove();

        text
          .enter()
          .append(text_element)
            .attr("class",text_class) 
            .on("mouseover", dispatch.dataHover)
            .on("click", dispatch.dataClick);

        if (html_tags){
          text
            .style({
              "text-align": "center",
              "position" : "absolute",
              "width" : function(d){ return d.zoom_r*1.5+"px";},
              "font-size" : function(d){ return font_scale(d.zoom_r)+"px";},
              "left" : function(d) { return d.zoom_pos.x-d.zoom_r*1.5/2+"px"; }
            })
            .html(text_func)  
            .transition()
            .duration(10)
            .each(function(d){
              var t = d.zoom_pos.y - $(this).height()/2;
              $(this).css("top",t);
            })

        } else {
          text.each(function(d){
            if (d.zoom_r > 40){
              d.zoom_text= _.first(d.name.split(" "),2).join(" "); 
            } else {
              d.zoom_text  = '...';
            }
            var first_word = d.zoom_text.split(" ")[0];
            d.zoom_text = d.zoom_text.replace(" and ",'').replace(" et ",'');
            d.font_size =  font_scale(d.zoom_r)+"px";
          })
          .attr({
            "x": function(d) { return d.zoom_pos.x; },
            "y": function(d) { return d.zoom_pos.y; },
            "dy": ".35em",
            "text-anchor": "middle"
          })
          .style("font-size" , function(d){ return d.font_size;})
          .text(function(d) { return d.zoom_text; });  
        
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

