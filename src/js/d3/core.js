(function() {
    var D3 = ns('D3');
    var TABLES = ns('TABLES');
    var APP = ns('APP');


    D3.orange_purple_color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", 
          "#7b6888", "#6b486b", "#a05d56", "#d0743c", 
          "#ff8c00"]);

    D3.tbs_color = function(){
      return d3.scale.ordinal()
            .range([ '#2b6c7b', '#a3d6e3', '#3e97ab', '#cfc7a9',
                    '#919191', '#e0e0e0', '#c3e4ec', '#4d4d4d','#595959' ]); 
    };

    D3.rotate_2d_point = function(x,y,theta){
      return [
         x*Math.cos(theta) - y*Math.sin(theta),
         x*Math.sin(theta) + y*Math.cos(theta)
        ];
    };

    D3.get_offset = function(elem){
       return $(D3.get_html_parent(elem)).offset();
    };

    D3.get_html_parent = function(elem){
      var node = $(elem.node());
      if (node.prop("tagName").toLowerCase() === 'svg'){
        return node.parent()[0];
      } else {
        return node.parents("svg").parent()[0];
      }
    };

    D3.add_hatching = function(container, width,height){
      container = container.append("g").attr("class","hatching");
      var vertical_lines = d3.scale.ordinal()
        .domain(_.range(height/30))
        .rangePoints([0,height]);
      var horizontal_lines = d3.scale.ordinal()
        .domain(_.range(width/30))
        .rangePoints([0,width]); 
      _.each(vertical_lines.range(),function(y){
        container.append("line")
          .attr({
            "x1" : 0,
            "x2" : width,
            "y1" : y,
            "y2" : y,
          });
      });
      _.each(horizontal_lines.range(),function(x){
        container.append("line")
          .attr({
            "x1" : x,
            "x2" : x,
            "y1" : 0,
            "y2" : height,
          });
      });
      container.selectAll("line")
        .style({
          "stroke" : "#CCC",
          "stroke-opacity" : 0.5,
          "stroke-width" : "1px"
        });
    };

    D3.extend_base = function(chart){
      return function(options){
        options = options || {};
        options.chart = my;
        options.height = options.height || 400;
        options.width = options.width || 800;
        options.hover_legend = options.hover_legend || true;

        function my(selection){
          selection.each(function(i){
            var svg = d3.select(this)
                .append("svg");
            options.width = $(this).width();
            options.html = d3.select(this);
            chart.call(options,svg,i);
          });
          return my;
        }

        my.dispatch = options.dispatch = d3.dispatch(
            'dataMouseEnter',
            'dataFocusIn',
            "dataFocusOut",
            'dataMouseLeave',
            "dataClick");

        my.options =  function(){
          return options;
        };

        my.series = function(value) {
          if (!arguments.length) {return series;}
          options.series = value;
          return my;
        };

        my.width = function(value) {
          if (!arguments.length) {return width;}
          options.width = value;
          return my;
        };

        my.height = function(value) {
          if (!arguments.length) {return height;}
          options.height = value;
          return my;
        };

        return my;
      };
    };

})();
