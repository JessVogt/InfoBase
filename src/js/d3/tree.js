$(function(){
  var D3 = ns('D3');
  var TREE = ns('D3.TREE');

  TREE.make_horizontal_tree = D3.extend_base(function(svg, index){
    var dispatch  = this.dispatch;
    var root = this.root;
    var height = this.height;
    var width = this.width;
    var maxLabelLength  = 100;
    var translate=[width/3,0], scale=1;
    var font_size = 10;
    var nodeRadius = 8;
    var html = d3.select(D3.get_html_parent(svg));
    // create the zoom/pan listener, one zoomy/pany events like using the click
    // wheel or pinching on a touch browser, the zoomlistener will 
    // perform some funky math and then call the on_zoom function 
    // with scale(zoom) and translation(pan) coordinates
    var zoomListener = d3.behavior.zoom()
      .scaleExtent([0.1, 3])
      .translate(translate)
      .on("zoom", on_zoom);

    // set the tree layout assuming an initial size of 300 width and 200
    // height
    // *** this function assumes the tree will be laid out vertically, 
    // therefore the x,y coordinates will be flipped to make it a horizontal
    // tree
    var tree = d3.layout.tree()
        .size([300, 200]);

    // setup the svg element, provide lots of space for expansion
    // all the extra space will be invisible and empty initially
    var vis = svg
          .attr("width", 2000)
          .attr("height", 2000)
        .append("g")
          .attr("transform", "translate("+translate+")"); 

    // create the links
    // diagonal, will be called when the links are drawn and will calculate
    // a nice smooth path based on the starting and ending coordinates
    // 1 - set up the diagonal function which
    // sweaps the x,y coordinates
    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; }
    );

    // based on the value of scale and translate, this function will
    // position the 
    var position = function(d){
      if (d3.event && d3.event.type === "focus"){
        // switch the coordinates here so subsequent calculations aren't confusing'
        var x = d.y,y=d.x,children = d.children || d._children || [];
        if (children.length === 0){
          translate[0] = width-200 - x;
        } else {
          translate[0] = (width/2) - x;
        }
        translate[1] = (height/2) - y;
      }
        vis  
          .attr("transform", "scale(" + scale + ")translate(" + translate + ")");

        html.selectAll("div.label")
          .style({
            "top" : function(d){ return scale*(d.x+translate[1])+7+"px"; },
            "left" : function(d){ return scale*(d.y+translate[0])+"px"; }
        });

    };

    // function for handling zoom event
    function on_zoom() {
      scale = parseFloat(d3.event.scale.toFixed(1));
      translate = d3.event.translate;
      translate[0] = Math.abs(translate[0]) <= width ? translate[0] : width*translate[0]/translate[0];
      translate[1] = Math.abs(translate[1]) <= height ? translate[1] : height*translate[1]/translate[1];
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
    
    var walk_back_up_tree = function(d){
      if (d === undefined){
        return;
      }
      svg.selectAll(".link")
        .filter(function(_d){
            return _d.target === d;
        })
        .style({ 
          "stroke" : "green",
          "stroke-width" : "3px" 
        });

      svg.selectAll("g.node circle")
        .filter(function(_d){
          return _d === d;
        })
       .style("stroke",  "green" );

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
        .size([Math.max(3,max_height*0.75) * 100, 200*_.keys(nodes_by_depth).length]);
      // now recompute the layout with the new, relaxed layout
      nodes = tree.nodes(root);
      // signal the recently select node along with all open nodes 
      dispatch.dataClick(updated, nodes);

      // tree.links will create all the necessary objects with 
      // the source and end points for each link
      var links = vis.selectAll("path.link")
          .data(tree.links(nodes));
      // for each of the links, which is provided by
     // tree.links, create a path
      var new_links = links.enter()
          .append("path")
          .attr("class", "link")
          .on("click",function(d){
            toggle(d.target);
          });

      // remove links for nodes which have been collapsed
      links.exit().remove();
      // remove links for nodes which have been collapsed
      links
         .style({ 
           "stroke" : "#CCC",
           "stroke-width" : "1px" 
         })
         .transition()
         .attr("d", diagonal);

      // create the svg:g which will hold the circle
      // and text
      var g_nodes = vis.selectAll("g.node")
          .data(nodes,function(d){return d.id;});

      g_nodes.exit().remove();

      var new_nodes = g_nodes.enter()
          .append("g")
          .attr("class", "node clickable");

      g_nodes
        .transition()
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      new_nodes.append("circle")
          .attr("r", nodeRadius);

      new_nodes.append("rect")
        .attr({
          "x" : "-20",
          "y" : "-20",
          "width" : "40",
          "height": "40"
        })
        .style({
          "fill" : "#CCC",
          "fill-opacity" : "0"
        })
        .on("click",toggle);

      svg.selectAll("circle")
          .style({
            "fill" : "#ccc",
            "stroke-width" : 3,
            "stroke-opacity" : 0.5,
            "stroke" : function(d){
              if (d._children && d._children.length === 0) {
                return "black";
              }
              return "blue";
            }
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
        .style({
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
        .html(function(d){return d.name;});

      html.selectAll("div.label")
        .style({
          "font-size" : font_size + "px",
          'max-width' : "200px" ,
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
