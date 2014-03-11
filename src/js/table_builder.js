(function(root) {
  
  var TABLES = ns('TABLES');
  var APP = ns('APP');

  TABLES.prepare_data = function(options){
    var x = dup_header_options = options.dup_header_options,
    rows = options.rows,
    headers = options.headers,

    headers_css = options.headers_css || new Array(headers[0].length),
    row_css = x ? headers_css : options.row_css || new Array(headers[0].length),

    headers_class = options.headers_class || new Array(headers[0].length),
    row_class = x ? headers_class : options.row_class || new Array(headers[0].length),

    header_links = _.map(rows[0],function(){return '';});

    _.each(headers, function(header_row,i){
      _.each(header_row, function(header,j){
        var id =  APP.make_unique();
        header_links[j] += ' ' + id;
         if (i > 0){
           var wcag_headers = _.chain(headers)
             .first(i).pluck(j)
             .map(function(d){ return d.id})
             .value().join(" ");
         } else {
           wcag_headers = '';
         }
         header_row[j] = {
           val : header,
           id : id,
           headers : wcag_headers,
           css : headers_css[j],
           class : headers_class[j]
         };
      });
    });

    _.each(rows, function(row,i){
      _.each(row, function(val,j){
         row[j] = {
           val : val,
           headers : $.trim(header_links[j]),
           css : row_css[j],
           class : row_class[j]
         };
      });
    });
  };

  TABLES.d3_build_table = function(options){
    var table = d3.select(options.node).append("table");
    var data_key_func = options.key_func || function(d,i){return i};

    if (options.table_class){
      table.attr("class",options.table_class);
    }

    if (options.table_css){
      table.style(options.table_css);
    }

    var headers = table.append("thead")
        .selectAll("tr")
        .data(options.headers);
    headers.exit().remove();
    headers
      .enter()
      .append("tr")
      .attr("class","table-header")
      .order();

    var ths = headers
        .selectAll("th")
          .data(Object);
    ths.exit().remove();
    ths
      .enter()
      .append("th")
      .html(function(d){return d.val;})
      .style(function(){ return d.css})
      .attr("id",function(d){return d.id;})
      .attr("headers",function(d){return d.headers;})
      .attr("class",function(d){return d.class;});

    if (options.headerseach){
       headers.each(options.headerseach);
    }
    if (options.theach){
      ths.each(options.theach);
    }

    var rows = table.append("tbody")
        .selectAll("tr")
        .data(options.rows,data_key_func)

    rows.exit().remove();
    rows
      .enter()
      .append("tr")
      .order();
    var tds = rows
        .selectAll("td")
          .data(Object)
    tds.exit().remove();

    tds
      .enter()
      .append("td")
      .html(function(d){return d.val;})
      .attr("headers",function(d){return d.headers;})
      .attr("class",function(d){return d.class;})
      .style(function(){ return d.css});

    if (options.rowseach){
       rows.each(options.rowseach);
    }

    if (options.tdseach){
      tds.each(options.tdseach);
    }

    return table.node();
  };

  TABLES.prepare_and_build_table = function(options){
    TABLES.prepare_data(options);
    return TABLES.d3_build_table(options);
  };

})(); 

