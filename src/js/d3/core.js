(function() {
    var D3 = ns('D3');
    var TABLES = ns('TABLES');
    var APP = ns('APP');


    D3.orange_purple_color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", 
          "#7b6888", "#6b486b", "#a05d56", "#d0743c", 
          "#ff8c00"]);

    D3.tbs_color = d3.scale.ordinal()
      .range([ '#2b6c7b', '#a3d6e3', '#3e97ab', '#cfc7a9',
              '#919191', '#e0e0e0', '#c3e4ec', '#4d4d4d','#595959' ]);

    D3.rotate_2d_point = function(x,y,theta){
      return [
         x*Math.cos(theta) - y*Math.sin(theta),
         x*Math.sin(theta) + y*Math.cos(theta)
        ];
    }

    D3.get_offset = function(elem){
       return $(D3.get_html_parent(elem)).offset();
    }

    D3.get_html_parent = function(elem){
       return $(elem.node()).parents("svg").parent()[0];
    }

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
                .append("svg")
             chart.call(options,svg,i);
          });
          return my;
        }

        my.dispatch = options.dispatch = d3.dispatch(
            'dataMouseEnter',
            'datahFocus',
            'dataMouseLeave',
            "dataClick");

        my.options =  function(){
          return options;
        };

        my.series = function(value) {
          if (!arguments.length) return series;
          options.series = value;
          return my;
        };

        my.width = function(value) {
          if (!arguments.length) return width;
          options.width = value;
          return my;
        };

        my.height = function(value) {
          if (!arguments.length) return height;
          options.height = value;
          return my;
        };

        return my;
      }
    };


})();
