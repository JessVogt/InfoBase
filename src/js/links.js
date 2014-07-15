(function() {
  var APP = ns('APP'),
      TABLES = ns('TABLES'),
      HORIZONTAL = ns("D3.HORIZONTAL"),
      LINKS = ns('TABLES.LINKS');

  LINKS.create_link = function(options){
    if (options.dept){
      return  LINKS.craete_details_link(options);
    } else {
      // check if options.dept exists as maybe undefined or null
      // and delete
      if (_.has(options,"dept")){
        delete options.dept;
      }
      return LINKS.create_analytics_link(options);
    }
  };

  LINKS.craete_details_link = function(options){
    dept = options.dept;
    table = options.table;
    lang = options.lang;
    return {
      href : "t-"+dept+"-"+table.id.replace("table",""),
      html : table.name[app.lang]
    };
  };

  LINKS.create_analytics_link = function(options){
    var table = options.table = options.table || null,
        lang = options.lang = options.lang || null,
        cols = options.cols = options.cols || null,
        hef;

    delete options.table;
    delete options.lang;
    delete options.cols;

    if (_.isString(table)){
      table = _.find(TABLES.tables, function(t){return t.id === table;});
    }

    if (_.isArray(cols)){

      _options =  {
        table : table.id,
        display_as : "table",
        column_choice : _.map(cols, function(col){
          return table.col_from_nick(col).fully_qualified_name;
        }),
        period : table.coverage[lang],
        data_type : table.data_type[lang],
        nu : true
      };
    } else {
      _options =  {
        table : table.id,
        column : table.col_from_nick(cols).fully_qualified_name,
        data_type : table.data_type[lang],
        period : table.coverage[lang],
        nu : true
      };
    }
    href = HORIZONTAL.Config.create_link(_.extend(_options,options));
    return {
      html : table.name[lang],
      href : href
    };
  };

})();
