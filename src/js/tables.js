(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');

  TABLES.tables = [];

  function map_data(lang,table){
    // this === a department
    var mapper = new MAPPERS.mapper(lang,table)
    return  mapper.map(this.tables[table.id]);
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


  _queries  = function(app,table){
    return new queries(app,table);

  }
  _queries.hasher = function(app,table){
    var lang = app.state.get("lang");
    var dept = app.state.get("dept").accronym;
    var table = table.id;
    return lang+dept+table;
  }

  TABLES.queries = _.memoize(_queries,_queries.hasher);

  var queries = function(app,table){
    this.dept = app.state.get("dept");
    this.lang = app.state.get("lang");
    this.mapped_data = this.dept.mapped_data(this.lang,table);
    this.mapped_objs = this.dept.mapped_objs(this.lang,table);
    _.extend(this,table.data_access);
    return this;
  };

  var p = queries.prototype;

  p.sort = function(func,reverse){
    reverse = reverse || false;
    var sorted =  _.sortBy(mapped_objs,func);
    if (reverse){
      sorted.reverse();
    }
    return sorted;
  };

  p.sum_cols = function(rows,cols){
    // ar will be an array of 
    var initial = _.map(cols,function(){return 0;});
    function reducer(x,y){
      return _.map(x, function(__,i){
        return x[i] + y[i];
      });
    };
    var total = _(rows)
      .map(function(row){ return _.map(cols,function(col){ return row[col];})})
      .reduce(reducer, initial)
    return _.object(cols, total);
   };

  p.get_total = function(cols, options){
    options = options || {include_defaults : false};
    var include_defaults = options.include_defaults || true;
    if (_.isUndefined(cols)){
      cols = this.default_cols;
    } else if (!_.isArray(cols)){
      cols = [cols];
    }
    if (options.include_defaults){
      cols = _.uniq(cols.concat(this.default_cols));
    }
    return this.sum_cols(this.mapped_objs,cols);
  };

  p.get_subtotal = function(cols, options){

  };

  p.get_cols = function (cols, options){
    var sorted = options.sorted || false;
    var data = sorted ? this.sort(function(x){return x[cols[0]]},sorted) : this.mapped_objs;
    var filter_zeros = options.filter_zeroes || false;
    function each_mapped_obj(obj){
      return _.pick(obj,cols);
    };
    var rows_with_cols= _.map(data, each_mapped_obj);
    if (filter_zeroes){
      rows_with_cols = _.filter(rows_with_cols,function(row){
        return row[cols[0]] != 0;
      });
    }
    return rows_with_cols;
  };

  p.  get_top_x = function(col,x){
    return _.head(this.get_cols([col],{sorted:true}),x);
  };

  p.get_row = function (col, val, options) {
    var only_one = options.only_one || true;
    var each_mapped_obj = function(obj){
      return obj[col] == bal;
    };
    var found =  _.find(this.mapped_objs, each_mapped_obj);
    if (only_one){
      return _.head(found);
    }
    return found;
  };
  
  function add_child(x){
    // this === a column parent
    if (!_.isArray(x)){
      x = [x];
    }
    _.each(x, function(col){
       col.parent = this;
       col_adder.call(col.parent.table,col);
       var fully_defined = col.parent.wcag+"-"+col.header.en;
       col.wcag =  fully_defined.replace(/\W|_| /g,"");
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
      x.wcag =  this.id+x.header.en.replace(/\W|_| /g,"")
      this._cols.push(x);
    }   
    this.unique_headers.push(x);
    x.add_child = add_child;
    return x;
  };

  function col_from_nick(nick){
    return _.find(this._flat_cols, function(col){
      return col.nick === nick;
    }) || false;
  };

  APP.dispatcher.on("new_table", function(table){
    TABLES.tables.push(table);
    // setup the mappers
    table._cols = [];
    table.unique_headers = [];

    table.col_from_nick = _.memoize(col_from_nick);
    table.add_col = col_adder;

    table.add_cols();

    table._flat_cols = table.unique_headers;
    table.unique_headers = _.chain(table.unique_headers)
      .filter(function(h){ return !h.children;})
      .map(function(h){ return h.nick || h.wcag;})
      .value();
  });

})(this);

