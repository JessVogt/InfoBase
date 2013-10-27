(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var MAPPERS = ns('MAPPERS');
  var WAIT = ns('WAIT');

  TABLES.tables = [];

  function setup_tables(app){
    // all tables should register themselves
    APP.dispatcher.trigger("load_tables",app);
    // all tables should download their respective datasets
    $.when.apply(null, load_data(app))
      .done(function(){
        APP.dispatcher.trigger("data_loaded",app);
      });
  }
  APP.dispatcher.once("init", setup_tables);

  var load_data = function(app){
    return _.map(TABLES.tables, function(table){
      var key = table.name[app.state.get("lang")];
      var promise1= $.Deferred(),promise2 =$.Deferred();
      WAIT.w.update_item(key,"download")
       var req = $.ajax({
         url: "data/"+table.id+".csv",
         context : table
       });
       req.done(function(data){
          WAIT.w.update_item(key,"loading");
          setTimeout(function(){
            promise1.resolve(data);
          })
       })
       promise1.done(function(data){
        var mapper = map_objs(app.state.get("lang"),table);
        table.data = _.map(_.tail(d3.csv.parseRows(data)),mapper);
        table.cf = crossfilter(table.data);
        table.depts = table.cf.dimension(function(row){return row['dept']});
        WAIT.w.update_item(key,"finished");
          setTimeout(function(){
            promise2.resolve();
          })
       })
      return promise2;
    });
  }

  function map_objs(lang,table){
    var mapper = new MAPPERS.mapper(lang,table);
    return function(row){
      var row_obj =  _.object(table.unique_headers,mapper.map(row));
      _.each(row_obj, function(val, key){
        var type =  table.col_from_nick(key).type ;
        if ( type == 'big-int'){
          row_obj[key]=accounting.unformat($.trim(val));
        } else if (type == 'int' && !_.isNaN(parseInt(val))){
          row_obj[key]=parseInt(val);
        }
      },this);
      return row_obj;
    };
  }

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
      return col.nick === nick || col.wcag === nick;
    }) || false;
  };

  APP.dispatcher.on("new_table", function(table){
    TABLES.tables.push(table);
    // setup the mappers
    table._cols = [];
    table.flat_headers = [];
    table._levels = [];

    // add in new functions
    table.col_from_nick = _.memoize(col_from_nick);
    table.add_col = col_adder;

    // register callbacks
    _.each(table.on,function(func, signal){
      // bind the listener to the table 
      APP.dispatcher.on(signal,_.bind(func,table));
    });

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
      .map(function(h){ return h.nick || h.wcag;})
      .value();
  });

})(this);

