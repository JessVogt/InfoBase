(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var HORIZONTAL = ns("D3.HORIZONTAL");
  var TABLES = ns('TABLES');
  var DETAILS = ns('DETAILS');

  DETAILS.OrgTabletView = function(app,table, container){
    var org = app.state.get("dept");
    APP.OrgHeader(app,org,container);
    add_table(app,org,table, d3.select(container[0]))
  };

  var get_key_to_horizontal = function(table,cols,org){
    return _.chain(table.horizontal(undefined,org.accronym,false))
      .map(function(rows, key){
        return  _.map(rows, function(row){
          return [row, key];
        });
      })
      .flatten(true)
      .value();
  }

  var add_table = function(app, org, table, container){
    container = container.append("div").style("overflow-x","auto");
    var lang = app.state.get("lang");
    var cols = _.filter(table.unique_headers, function(header){
      col =  table.col_from_nick(header);
      return col.hidden !== true;
    });
    var col_objs = _.map(cols, table.col_from_nick);
    var _map = get_key_to_horizontal(table,cols,org);
    var raw_data =table.depts[org.accronym];
    var map = _.map(raw_data, function(row ){
      return _.find(_map, function(row_tag){ return row_tag[0]=== row})[1];
    });
    var data = _.chain(raw_data)
      .map(function(row){
        return _.map(cols,function(col){
          return row[col];
        });
      })
      .map(function(row,i){
        var row_type = map[i];
         return _.map(row, function(d,i){
           var col = col_objs[i];
           return {
             val : d,
             href : HORIZONTAL.create_analytics_link(table,
               col.nick || col.wcag,
               lang,
               {
                pres_level : "depts",
                shown : row_type
               }).href
           };
         });
      })
      .value();


    TABLES.d3_build_table({
      node : container.node(),
      theach : function(d,i){
        d3.select(this)
          .attr("colspan",d.col_span)
          .attr("id",d.id)
          .attr("headers",d.headers);
      },
      headers : table.presentation_ready_headers,
      rowseach : function(d,i){
        if (d === _.last(data)){
          d3.select(this).classed("background-medium",true);
        }
        if (i % 2 === 1 ){
          d3.select(this).classed("odd",true);
        }
      },
      tdseach : function(d,i){
        var el;
        if (!col_objs[i].key){
          el = d3.select(this)
            .html("")
            .append("div")
            .attr("class",col_objs[i].type)
            .append("a")
            .attr("class","router")
            .attr("href",d.href);
        } else {
          el = d3.select(this)
            .html("")
            .append("div")
            .attr("class",col_objs[i].type);
        }
        el.html(app.formater(col_objs[i].type,d.val));
      },
      rows : data
    });
  };

})();

