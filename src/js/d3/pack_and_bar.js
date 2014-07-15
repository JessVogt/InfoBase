(function (root) {

  var PACK = ns('D3.PACK');
  var BAR = ns('D3.BAR');
  var D3 = ns('D3');

  D3.pack_and_bar = function(options){

    var current_object;
    var height = options.height;
    var graph_area = options.graph_area;
    var pack_data = options.pack_data;
    var packed_data_to_bar = options.packed_data_to_bar;
    var formater = options.formater;
    var post_bar_render = options.post_bar_render;
    var ticks = options.ticks;
    var text_fragments = options.text_fragments
    var data =  PACK.pack_data(pack_data,text_fragments.other, {
      force_positive : true,
      filter_zeros : true
    });

    graph_area
      .classed("border-all",true)
      .style({
      "background-color":"#F4F4F4",
      "height" : height+"px",
      "overflow" : "hidden"
    });
    var pack_container = graph_area;

    var bar_container =  graph_area.append("div")
       .style({
          "position" : "absolute",
          "top" : "0px",
          "right" : "0px"
       });

    var add_bar_chart = function(d){
      // don't redraw the graph if the currently selected object
      // hasn't changes
      if (d.name === current_object){
        return;
      }
      // update the currently selected object
      current_object = d.name;
      // remove the contents
      bar_container.selectAll("*").remove();

      if (d.name === text_fragments.other || d.name === ''){
        return;
      }

      var inner_bar_container = bar_container.append("div")
       .attr("class","border-all")
       .style({
         "position":"relative",
         "margin" : "5px",
         "height" : '200px',
         "width" : '300px',
         "background-color" : "#F4F4F4"
       });


      BAR.bar({
        title : d.name,
        add_labels : true,
        add_xaxis : true,
        label_formater : formater,
        series : {"":packed_data_to_bar(d)},
        width : bar_container.offsetWidth,
        height : 200,
        ticks : ticks(d),
      })(inner_bar_container);
      post_bar_render(inner_bar_container,d);
    };

    var graph = PACK.pack({
      height : height,
      formater : formater,
      top_font_size : 12,
      data : data,
      zoomable : true,
      hover_text_func : function(d){
        return d.name;
      },
      text_func : function(d){
        var val = formater(d.__value__ || d.value) ;
        if (d.zoom_r > 60) {
          return d.name + " - "+ val;   
        } else if (d.zoom_r > 40) {
          return _.first(d.name.split(" "),2).join(" ")+ " - "+ val;  
        } else  {
          return val.replace(" - ","");
        }
      }
    });
    graph(pack_container);
    graph.dispatch.on("dataFocusIn", add_bar_chart)
                  .on("dataMouseEnter", add_bar_chart)
                  .on("dataClick", add_bar_chart);
  };

})();
