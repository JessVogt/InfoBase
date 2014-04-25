$(function(){
  var D3 = ns('D3');
  var TREE = ns('D3.TREE');

  TREE.make_horizontal_tree = D3.extend_base(function(svg, index){
    var text_func = this.text_func;
    var dispatch  = this.dispatch;
    var root = this.root;
    var height = this.height;
    var width = this.width;
    var maxLabelLength  = 100;
    var translate=[width/3,0], scale=1;
    var font_size = 14;
    var nodeRadius = 10;
    var html = d3.select(D3.get_html_parent(svg));
    // create the zoom/pan listener, one zoomy/pany events like using the click
    // wheel or pinching on a touch browser, the zoomlistener will 
    // perform some funky math and then call the on_zoom function 
    // with scale(zoom) and translation(pan) coordinates
    var zoomListener = d3.behavior.zoom()
      .scaleExtent([0.1, 3])
      .scale(scale)
      .translate(translate)
      .on("zoom", on_zoom);

    // set the tree layout assuming an initial size of 300 width and 200
    // height
    // *** this function assumes the tree will be laid out vertically, 
    // therefore the x,y coordinates will be flipped to make it a horizontal
    // tree
    var tree = d3.layout.tree()
        .size([200, 150]);

    // setup the svg element, provide lots of space for expansion
    // all the extra space will be invisible and empty initially
    svg
      .attr("width", 2000)
      .attr("height", 2000)
      .append("rect")
        .attr({"width":width,"height": height})
        .style({"fill":"#CCC","fill-opacity" : "0.1"});
    var vis = svg
        .append("g")
          .attr("transform", "translate("+translate+")"); 
    
    // by separating the paths and the nodes and putting the layers first,
    // it ensures the paths will never overlap the layers
    var paths_layer = vis.append("g").attr("class","paths");
    var nodes_layer = vis.append("g").attr("class","nodes");

    // create the links
    // diagonal, will be called when the links are drawn and will calculate
    // a nice smooth path based on the starting and ending coordinates
    // 1 - set up the diagonal function which
    // sweaps the x,y coordinates
    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; }
    );

    var  straighten_analytical_path = function(nodes,d){
      // this function tried two strategies for aligning the 
      // nodes, first it aligns all children of a given nodes,
      // any nodes missed by this strategy will be adjusted
      // based on their depth

      // recursively walk down all the children of a node and adjust them
      // based on the parent and mark then as adjusted
      var adjust_children = function(nodes,delta){
        _.each(nodes, function(node){
          // if the node doesn't have any children then 
          // node.children || [] will evaluate to the empty array
          // and the function call will fail gracefully
          adjust_children(node.children || [],delta);
          node.x += delta;
          // mark the node as aligned
          node.aligned = true;
        });
      };
      // quick  recursive function to walk up the tree and gather
      // all the parents
      // will produce array of [node, node.parent, node.parent.parent, ..]
      var walk_to_top = function(x){
        return x.parent ? [x].concat(walk_to_top(x.parent)) : [x];
      };
      //  reverse the result so it starts with the root
      var all_parents = walk_to_top(d).reverse();
      var parents =  _.tail(all_parents);
      var root = _.head(all_parents);

      _.each(parents,function(node,i){
        var height_from_middle = root.x-node.x;  
        _.chain(nodes)
         .filter(function(_node){
            return _node.depth === node.depth;
         })
         .each(function(_node){
           _node.x += height_from_middle;
           if (!_node.adjusted ) {
            adjust_children(_node.children,height_from_middle);
           }
         })
         .value();
      });
    };

    // based on the value of scale and translate, this function will
    // position the 
    var position = function(d){
      if (d3.event && d3.event.type === "focus"){
        // switch the coordinates here so subsequent calculations aren't confusing'
        var x = d.y,y=d.x;
        if (d.child_count === 0){
          translate[0] = width-200 - x;
        } else {
          translate[0] = (width/2) - x;
        }
        translate[1] = (height/2) - y;
      }
      vis  
        .attr("transform", "scale(" + scale + ")translate(" + translate + ")");
        setTimeout(function(){
          html.selectAll("div.label")
            .style({
              "font-size" : scale * font_size+"px",
              "top" : function(d){ 
                var offset = d.depth === 0 ? 5*nodeRadius : nodeRadius;
                return scale*(d.x+translate[1]+offset)+"px"; },
              "left" : function(d){ 
                var width = this.offsetWidth || 0;
                return scale*(d.y+translate[0]-width/2)+"px"; 
              }
            });
        });
    };

    // function for handling zoom event
    function on_zoom() {
      scale = parseFloat(d3.event.scale.toFixed(1));
      translate = d3.event.translate;
      position();
    }

    // Toggle children.
    var toggle = function (d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    };
    
    // this will create a green path from the currently clicked node
    // back to the source
    var walk_back_up_tree = function(d){
      if (d === undefined){
        return;
      }
      var filter_func = function(_d){
         return _d === d;
      };
      link = svg.selectAll(".link")
        .sort(function(x,y){{
          return y.target === d  || y.active_link  ? -1 : 1;
        }})
        .filter(function(_d){
          return _d.target === d;
        })
        .each(function(d){
          d.active_link = true;
        })
        .style({ 
          "stroke" : "#7FBF7F",
          "stroke-width" : nodeRadius+"px" 
        });

      svg.selectAll("g.node circle.node")
        .filter(filter_func)
        .style("fill",  "#7FBF7F" );

      html.selectAll("div.label a")
        .filter(filter_func)
        .style("font-weight","bold");

      setTimeout(function(){
        walk_back_up_tree(d.parent);
      },200);
    };

    var update = function(updated) {

      //get a list of all the active nodes from the now 
      // out of date tree
      var nodes = tree.nodes(root);
      // organize the nodes by depth
      var nodes_by_depth = _.groupBy(nodes,"depth");
      // find the tree level with the most number of open nodes
      var max_height = _.max(_.values(nodes_by_depth),"length").length;
      // now create a new tree layout to compensate for squashing
      // as nodes are opened the width and height will slowly increase 
      // the parameters below were arrived by experimentation
      tree = d3.layout.tree()
        .size([Math.max(3,max_height*0.75) * 100, 185*_.keys(nodes_by_depth).length])
        .separation(function separation(a, b) {
          return 1; //a.parent == b.parent ? 1 : 2;
        });
      // now recompute the layout with the new, relaxed layout
      nodes = tree.nodes(root);
      // signal the recently select node along with all open nodes 
      dispatch.dataClick(updated, nodes);

      straighten_analytical_path(nodes,updated,true);

      // tree.links will create all the necessary objects with 
      // the source and end points for each link
      var links = paths_layer.selectAll("path.link")
          .data(tree.links(nodes));
      // for each of the links, which is provided by
     // tree.links, create a path
      var new_links = links.enter()
          .append("path")
          .attr("class", "link")
          .style({
             "fill" : "none"
          });

      // remove links for nodes which have been collapsed
      links.exit().remove();
      // re-draw and reset the link styling
      // do the restyling before the transition
      links
        .each(function(d){
          d.active_link = false;
        })
        .style({
           "stroke": "#ccc",
           "stroke-width": "1.5px"
        })
        .transition()
        .attr("d", diagonal);

      // create the svg:g which will hold the circle
      // and text
      var g_nodes = nodes_layer.selectAll("g.node")
          .data(nodes,function(d){return d.id;});

      g_nodes
        .exit()
        .transition()
        .attr({
            "transform" :  function(d) { return "translate(" + d.parent.y + "," + d.parent.x + ")"; }
        })
        .remove();

      var new_nodes = g_nodes.enter()
          .append("g")
          .attr({
            "class": "node clickable",
            "transform" :  function(d) { return "translate(" + updated.y + "," + updated.x + ")"; }
          });

      g_nodes
        .transition()
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      new_nodes.append("circle")
          .attr("class","node")
          .attr({ "r": function(d){
            if (d.depth === 0){
              return 5*nodeRadius;
            }
            return nodeRadius ;
          }
          });
          
      svg.selectAll("circle.node")
          .style({
            "stroke" : "none",
            "fill" : function(d){
              if (d.child_count === 0) {
                return "#808080";  // grey
              }
              return "#8080FF";  // blue
            }
          });

      new_nodes.append("circle")
        .attr({
          "r" : 2.5*nodeRadius
        })
        .style({
          "pointer-events": "all",
          "stroke" : "none",
          "fill" : "#CCC",
          "fill-opacity" : "0"
        })
        .on("click",toggle)
        .filter(function(d){return d.depth !== 0;})
        .on("mouseenter", function(){
          d3.select(this).style("fill-opacity",0.5);
        })
        .on("mouseleave", function(){
          d3.select(this).style("fill-opacity",0);
        });

      html.selectAll("div.label").remove();

      var labels = html.selectAll("div.label")
          .data(nodes,function(d){return d.id;});

      var new_labels = labels
        .enter()
        .append("div")
        .attr("class","label");

      new_labels
        .append("a")
        .attr("href","#")
        .attr("class","wrap-none")
        .style({
          "opacity" : 1,
          "text-decoration" : "none"
        })
        .on("click", function(d){
           toggle(d);
           setTimeout(function(){
             html.selectAll("a")
               .filter(function(_d){return _d === d;})
               .node()
               .focus();
           });
        })
        .on("focus", function(d){
          position(d);
        })
        .html(text_func);

      html.selectAll("div.label")
        .style({
          "padding" : "1px",
          "background-color" : "#F0F0F0",
          "border-radius" : "5px",
          "border" : "1px solid grey",
          "font-size" : font_size + "px",
          "text-align" : "center",
          position : "absolute"
      });


      position(updated);

      setTimeout(function(){
        walk_back_up_tree(updated);
      });

    };

    html.style({
      "border" : "1px gray solid",
      "height" : height+"px",
      overflow : "hidden"
    });

    zoomListener(svg);
    if (root._children){
      toggle(root);
    } else {
      update(root);
    }
  });
});
