(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var MAPPERS = ns('MAPPERS');

  TABLES.tables = [];

  function map_data(lang,table){
    // this === a department
    var mapper = new MAPPERS.mapper(lang,table)
    return mapper.map(this.tables[table.id]);
  }
  map_data.hasher = function(lang,table){
    return lang+table.id;
  }

  function map_objs(lang,table){
    // this === a department
    var mapped = this.mapped_data(lang, table);
    return _.map(mapped,function(mapped_row){
      return _.object(table.unique_headers,mapped_row);
    });
  }
  map_objs.hasher = function(lang,table){
    return lang+table.id;
  }                  

  function setup_tables(app){
    //setup each department with data mapper functions
    _.each(depts, function (org){
      org.mapped_data = _.memoize(map_data,map_data.hasher);
      org.mapped_objs = _.memoize(map_objs,map_objs.hasher);
    });
    APP.dispatcher.trigger("load_tables",app);
    APP.dispatcher.trigger("tables_loaded",app);
  }
  APP.dispatcher.once("app_ready", setup_tables);


  function add_child(x){
    // this === a column parent
    if (!_.isArray(x)){
      x = [x];
    }
    _.each(x, function(col){
       col.parent = this;
       col_adder.call(col.parent.table,col);
       col.wcag =  APP.make_unique();
       col.level = col.parent.level +1;
       col.table = col.parent.table;
    },this);
    this.children = (this.children || []).concat(x);
    return this;
  };

  function col_adder(x){
    // this === a table obj or null
    if (_.isString(x)){
      x =  {header : {en: x, fr: x}};
    }
    x.table = this;
    if (!_.has(x,"key")){
       x.key = false;
    }
    if (!_.has(x,"parent")){
      x.wcag =  APP.make_unique()
      this._cols.push(x);
      x.level = 0;
    }   
    this.flat_headers.push(x);
    x.add_child = add_child;
    return x;
  };

  function col_from_nick(nick){
    return _.find(this.flat_headers, function(col){
      return col.nick === nick;
    }) || false;
  };

  APP.dispatcher.on("new_table", function(table){
    TABLES.tables.push(table);
    // setup the mappers
    table._cols = [];
    table.flat_headers = [];
    table._levels = [];

    table.col_from_nick = _.memoize(col_from_nick);
    table.add_col = col_adder;

    table.add_cols();

    var to_chain = _.chain(table.flat_headers);

    table._nicks = to_chain
      .map(function(x){ return x.nick})
      .compact()
      .value();
    table._levels = to_chain
      .map(function(col){ return col.level})
      .unique()
      .value();
    table.keys = to_chain
      .filter(function(h){ return h.key})
      .map(function(h){return h.nick || h.header.en})
      .value();
    table.unique_headers = to_chain
      .filter(function(h){ return !h.children;})
      .map(function(h){ return h.nick || h.header.en;})
      .value();
  });

})(this);

