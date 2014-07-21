(function() {
    var D3 = ns('D3');
    var PACK = ns('D3.PACK');
    var APP = ns('APP');

    PACK.count_nodes = function(d,test){
      if (d.children){
        return d3.sum(d.children, function(child){return PACK.count_nodes(child,test);});
      } 
      return test(d) ? 1 : 0;
    };

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
          x["__"+attr+"__"] = x[attr];
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
          sorted = _.sortBy(groups,function(g){ return parseInt(g.key,10);}),
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
          current_hover_node,
          parent_width = $(svg.node().parentNode).width(),
          colors = this.colors || D3.tbs_color(),
          rand = Math.round(Math.random()*1000000),
          html = this.html,
          // for accessibility purposes, ensure the labels are in a list
          // this will be helpful later when converting the page to a static
          // HTML version
          ul = html.append("ul")
                   .style("margin","0px")
                   .attr("class"," list-bullet-none"),
          k,
          first = true,
          invisible_grand_parent = _.isUndefined(this.invisible_grand_parent) ? true  : this.invisible_grand_parent,
          hover_text_func = this.hover_text_func || function(){},
          cycle_colours = this.cycle_colours || false,
          top_font_size =  this.top_font_size || 12,
          bottom_font_size =  this.bottom_font_size || 10,
          zoomable = this.zoomable || false,
          dispatch = this.dispatch,
          data = this.data,
          text_func = this.text_func || function(d){return d.name;},
          on_focusout = this.on_focusout || function(){},
          on_focusin = this.on_focusin || function(){},
          radius = Math.min(parent_width, this.height)-11,
          x_scale = d3.scale.linear() .range([0,radius]),
          y_scale = d3.scale.linear() .range([0,radius]),
          value_attr = this.value_attr || "value",
          pack=  d3.layout.pack()
            .size([radius,radius])
            .value(function(d){
              return d[value_attr];
            }),
          nodes = pack.nodes(data),
          translate = [(this.width - radius)/2,10],
          mouse_enter = function(d){
            if (d === current_hover_node){
              return;
            }
            dispatch.dataMouseEnter(d);
          };


      // assign a unique id to each node
      _.each(nodes, function(n){
        n.rid = APP.make_unique();
      });

      // filter to only show the first two depths of the packed circles
      if (!zoomable){
        nodes = _.filter(nodes,function(d){ return d.depth <= 1;});
      }

      // normal svg setuup with the height, width
      svg = svg
        .attr({
          "width": parent_width,
          "height":this.height})
        .append('g')
         .attr("transform", "translate("+translate+")");

      var hover_in = function(d){
        current_hover_node = d;
         // traverse back up to the 
         html.append("div")  
           .attr("class","full_label")
           .style({
             "padding" : "1px",
             "background-color" : "#F0F0F0",
             "border-radius" : "5px",
             "border" : "1px solid grey",
             "font-size" : "12px",
             "top" : d.zoom_pos.y-d.zoom_r + "px",
             "left" : translate[0]+d.zoom_pos.x + "px",
             "text-align": "center",
             "position":"absolute"
           })
           .html(hover_text_func(d));
      };
      var hover_out = function(d){
        current_hover_node = undefined;
        html.selectAll("div.full_label").remove();
      };

      dispatch.on("dataFocusIn.__",hover_in);
      dispatch.on("dataMouseEnter.__",hover_in);
      dispatch.on("dataFocusOut.__",hover_out);
      dispatch.on("dataMouseLeave.__",hover_out);

      // 
      var add_zoom_out_link = function(node){
        html.selectAll(".zoom a").datum(node);

        if (node.depth >=1 && node.children && !html.select(".zoom").node()){
          html
            .insert("div", "svg")
            .attr("class","zoom")
            .style({
              "position" : "absolute",
              "left" : "10px",
              "top" : "10px"
            })
            .append("a")
            .datum(node)
            .attr("href","#")
            .html("Zoom Out")
            .on("click",function(d){
              that.dispatch.dataClick(d.parent);
              d3.event.preventDefault();
            });
        } else if (_.isUndefined(node.parent)){
          html.selectAll(".zoom").remove();
        }
      };

      var setup_for_zoom = function(node){
        if (node.children && node.children.length > 0){
          k = radius / node.r / 2;
          x_scale.domain([node.x - node.r, node.x + node.r]);
          y_scale.domain([node.y - node.r, node.y + node.r]);
          render(node);
        }
      };

      // if the graph is zoomable, setup the event listeners and trigger
      // a zoom event on the root node
      // otherwise, don't handle click events and just render the graph
      // once
      if (zoomable){
        dispatch.on("dataClick.__zoom__",setup_for_zoom);
        _.delay(dispatch.dataClick,1, nodes[0],0);
      } else {
        setup_for_zoom(nodes[0]);
      }

      function render(node){

        add_zoom_out_link(node);
        if ( html.select(".zoom").node() ){
          html.selectAll(".zoom a").node().focus();
        } else if (!first){
          setTimeout(function(){
            html.select("ul a").node().focus();
          });
        }
        first = false;

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
          return _.indexOf(node.children,d) !== -1;
        });           

       var font_scale  = d3.scale.linear()
         .domain(d3.extent(nodes_with_text, function(d){return d.zoom_r;}))
         .rangeRound([bottom_font_size,top_font_size]);

        // join the filtered data to the circles
        var circle = svg.selectAll(".node")
            .data(nodes_shown,function(d){ return d.rid;});
        // join the filtered data to any divs with labels

        circle.exit().remove();

        var new_circles = circle
          .enter()
            .append("circle")
            .attr("class","node")
            .on("click", dispatch.dataClick);

        if (!is_mobile){
          new_circles
            .on("mouseenter", mouse_enter)
            .on("mouseleave", dispatch.dataMouseLeave);
        }

        var circles = circle
          .transition()
          .style({
            "pointer-events": function(d){
              if (d.depth === depth+2) {
                return "none";
              }
              return "all";
            },
            "stroke" : function(d){
              if (d.__value__ && d.__value__ <0){
                return "red";
              }
              return  "steelblue";
            },
            "stroke-opacity" : function(d){
              if (d.depth === 0 && invisible_grand_parent){
                return 0;
              }
              return 1;
            },
            "fill" : function(d){

              if (d.__value__ && d.__value__ <0){
                return "red";
              } 
              return  "#1f77b4";
            },
            "fill-opacity" : function(d){
              if (d.depth === 0 && invisible_grand_parent){
                return 0;
              } else if ((d.depth === 0 && !invisible_grand_parent) || 
                          d.depth <=  depth+1 ){
                return 0.05;
              } else {
                return 0.2;
              }
            }
          })
          .attr({
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
              "fill" : function(d,i){ return colors(i); },
              "stroke" : function(d,i){ return colors(i);},
              "stroke-width" : "2px",
              "fill-opacity" : "0.5"
            });
        }

        text_class = "text"+rand;

        var text = ul.selectAll("li."+text_class)
              .data(nodes_with_text,function(d){ return d.rid;});

        text.exit().remove();
        
        text
          .enter()
          .append("li")
            .attr("class",text_class) 
            .append("a")
            .attr("href","#")
            .style({
              "color" : "#000",
              "text-align": "center",
              "text-decoration" : "none",
              "left" : function(d) { return translate[0]+d.zoom_pos.x-d.zoom_r*1.5/2+"px"; },
              "font-size" : function(d){ return font_scale(d.zoom_r)+"px";},
              "position" : "absolute",
              "width" : function(d){ return d.zoom_r*1.5+"px";},
            })
            .html(text_func)  
            .on("click", function(d){
               d3.event.preventDefault();
               dispatch.dataClick(d);
            })
            .on("focusout", dispatch.dataFocusOut)
            .on("focusin", dispatch.dataFocusIn)
            .transition()
            .duration(10)
            .each(function(d){
              var t = d.zoom_pos.y - $(this).height()/2 + font_scale(d.zoom_r);
              $(this).css("top",t);
            });
         if (!is_mobile){
           text.selectAll("a")
            .on("mouseenter", mouse_enter)
            .on("mouseleave", dispatch.dataMouseLeave);
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
