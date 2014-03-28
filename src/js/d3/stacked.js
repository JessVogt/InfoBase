(function() {

    var D3 = ns('D3');
    var STACKED = ns('D3.STACKED');

    BAR.relaxed_stacked = D3.extend_base(function(svg,index){
      /* data in the format of 
      *   {"cols" : ["y1","y2","y3"],
      *    rows : [{
      *      label : '',
      *      y1 : val,
      *      y2 : val,
      *      y3 : val
      *    }, {
      *      label : '',
      *      y1 : val,
      *      y2 : val,
      *      y3 : val
      *    }]
      *  }
      */

      var cols = this.data.cols,
          rows = this.data.rows,
          margin = this.margin || {top: top_margin, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40},
          row_height = this.row_height || 50,
          height = this.height - margin.top - margin.bottom,
          width = this.width - margin.left - margin.right,
          formater = this.formater,
          label_width = 60,
          col_width = (width - label_width)/cols.length,
          all_vals = d3.merge(_.map(cols, function(col){
            return Math.abs(_.pluck(rows, col));
          })),
          extent = d3.extent(all_vals),
          max_r = Math.max(row_height, col_width),
          scale = d3.scale.linear()
            .domain(extent)
            .range([3,max_r]),
          html = d3.select(D3.get_html_parent(svg)),
          graph_area  = svg
            .attr({
              width : width+margin.left+margin.right,
              height : height+margin.top+margin.bottom})
            .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    });
})();



          

