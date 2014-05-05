(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var HORIZONTAL = ns("D3.HORIZONTAL");
  var TABLES = ns('TABLES');
  var DETAILS = ns('DETAILS');
  var STORY = ns('D3.STORY');

  DETAILS.OrgTabletView = function(app,table, container){
    var template = APP.t("#details_t");
    var org = app.state.get("dept");
    APP.OrgHeader(app,org,container);
    container.append($(template({org:org})));
    add_text(app,org,table, container);
    add_graph(app,org,table, d3.select(container[0]));
    add_table(app,org,table, d3.select(container[0]));
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
  };

  var add_text = function(app, org, table, container){
    var lang = app.lang,
        id = table.id,
        selector = "#"+id +"_"+lang,
        to_be_appended = $(selector).html();

    container.find(".table_description").append(to_be_appended);
  };

  make_graph_context = function(app,org){
    var data = TABLES.Info({dept:org}),
        written = app.make_formater("compact_written"),
        compact = app.make_formater("compact");
    return {
      app : app,
      dept : org,
      lang : app.lang,
      data : data,
      height : 200,
      written_data : TABLES.format_info(written, data),
      compact_data : TABLES.format_info(compact, data),
      percent : app.make_formater("percentage"),
      compact1 : app.make_formater("compact1"),
      written : written,
      compact : compact,
      bigintreal : app.make_formater("big-int-real")
    };
  };

  var add_graph = function(app, org, table, container){
    var graph_context = make_graph_context(app,org.accronym);
    container = container.select(".graph_payload");
    _.each(table.graphics.details_display_order, function(func_name){

       var chapter = STORY.chapter({
         header : "h4",
         target : container,
         span : "span-8"
       });

       graph_context.graph_area = chapter.graph_area();
       graph_context.text_area =  chapter.text_area();

       var result = table.graph(func_name,graph_context).render();
       if (result === false){
         chapter.remove();
       }
    });
  };


  var add_table = function(app, org, table, container){
    container = container.select(".table_payload");
    var lang = app.state.get("lang"),
        // get list of all visible column names
        // unique_headers is a list of all the lowest level headers
        cols = _.filter(table.unique_headers, function(header){
            col =  table.col_from_nick(header);
            return col.hidden !== true;
        }),
        // tranform each column name back to it's column object
        col_objs = _.map(cols, table.col_from_nick),
        // get the breakout of the rows for this department
        // by the standard horizontal breakdown
        _map = get_key_to_horizontal(table,cols,org),
        // grab reference to the raw data for this table and department
        raw_data =table.depts[org.accronym],
        // create a list of equal length to the number of rows containing 
        // a row type as provided by the horizontal function
        map = _.map(raw_data, function(row ){
          return _.find(_map, function(row_tag){ return row_tag[0]=== row;})[1];
        }),
        // transform the data for presentation in the table
        data = _.chain(raw_data)
          // transform the row object into an array whose values 
          // line up with the columns
          .map(function(row){
            return _.map(cols,function(col){
              return row[col];
            });
          })
          // transform each array into an object having the following properties
          // val: the newly created array
          // href: a link to the horizontal analysis section
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
                    data_type : table.data_type[app.lang],
                    shown : row_type
                  }).href
              };
            });
          })
          .value(),
        total_data = _.map(col_objs, function(col_obj,i){
          var val, href='';
          if (i === 0){
            val = app.get_text("total");
          } else if (col_obj.type === 'big-int' || col_obj.type === 'big-int-real'){
            val = d3.sum(_.map(data, function(row){
              return row[i].val;
            }));
            href = HORIZONTAL.create_analytics_link(table,
                  col.nick || col.wcag,
                  lang,
                  {
                    pres_level : "depts",
                    data_type : table.data_type[app.lang],
                  }).href;
          } else {
            val = '';
          }            
          return { val : val, href : href };
        }),
        goc_rows = _.map(table.GOC, function(row){
             return _.map(cols, function(c,i){
               var col = col_objs[i];
               if (i === 0){
                 val = app.get_text("goc_total");
                 href = '';
               } else {
                 val =  row[c];
                 href =  HORIZONTAL.create_analytics_link(table,
                  col.nick || col.wcag, lang,
                  {  data_type : table.data_type[app.lang],
                    pres_level : "depts" }).href;
               }
               return { val : val, href : href };
           });
        }),
        total_rows = [total_data].concat(goc_rows);

    container.append("a")
      .attr("class","router")
      .attr("href", function(){
        return  HORIZONTAL.create_analytics_link(
                  table,
                  _.difference(cols, table.keys),
                  lang,
                  { pres_level : "depts",
                    data_type : table.data_type[app.lang],
                    display_as : "table" }).href;
      })
      .html(function(){
        return "Compare totals with all other organizations";
      });

    TABLES.d3_build_table({
      table_class : "table-condensed table-medium",
      node : container.node(),
      theach : function(d,i){
        d3.select(this)
          .attr("colspan",d.col_span)
          .attr("id",d.id)
          .attr("headers",d.headers);
      },
      headers : table.presentation_ready_headers,
      rowseach : function(d,i){
        if (_.contains(total_rows, d)){
          d3.select(this).classed("background-medium",true);
        }
        if (i % 2 === 1 ){
          d3.select(this).classed("odd",true);
        }
      },
      tdseach : function(d,i){
        var el, col = col_objs[i];
        if (!col.key && d.href.length > 0){
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
        el.html(app.formater(col.type,d.val));
      },
      rows : data.concat(total_rows)
    });
  };

})();

