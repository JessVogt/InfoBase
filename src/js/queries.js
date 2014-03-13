(function() {
  var TABLES = ns('TABLES');

  TABLES.setup_table_for_queries = function(app,table,data){
    // attached mapped data to the table object
    table.data = data[false];
    table.GOC = data[true];
    // create a departmental mapping which sums up all the values
    // for a particular column
    var _dept_rollup = make_horizontal_func(app,undefined,table);
    table.dept_rollup = function(col){
      return _dept_rollup(col,true,true);
    };
    // create the departments mapping 
    table.depts = _dept_rollup(undefined,true,false);
    // create additional, more specialized horizontal dimensions
    var include_in_analytics = table.dimensions.include_in_analytics || [];
    include_in_analytics.unshift("horizontal");

    _.each(table.dimensions, function(attr,d){
      if (_.isFunction(attr)) {
        table[d] =  make_horizontal_func(app,attr,table);
      }
    });

    table.dimensions = include_in_analytics;
    // add in query object for each table
    table.q = function(dept){
      if (!_.isUndefined(dept))
        if (table.depts[dept]){
          return new queries(app, table,table.depts[dept]);
        } else {
          return new queries(app, table, []);
        }
      return new queries(app, table,data[false]);
    }
  }

  var make_horizontal_func = function(app,func,table){
    /*
     *  based on some grouping function, a table will be first grouped
     *  then an optional sub-grouping of each department will be applied,
     *  finally, an optional rollup sum can be performed
     *
     */
     var f = function(col,include_dept,rollup ){
        var nest = d3.nest(), data;
        if (table.depts && table.depts[include_dept]){
          data = table.depts[include_dept];
          include_dept = false;
        } else {
          data = table.data;
          include_dept =  include_dept == false ? false : true;
        }
        rollup =   rollup == false ? false : true;
        if (_.isFunction(func)){
          nest = nest.key(func({
            app:app,
            table:table,
            col:_.isArray(col) ? col[0] : col
          }));
        }
        if (include_dept) {
          nest.key(function(d){return d.dept;});
        }
        if (rollup) {
            nest.rollup(function(leaves){
               if (_.isArray(col)){
                  return _.map(col, function(_col){
                    return d3.sum(leaves,function(leaf){
                      return leaf[_col]
                    })
                  });
               } else {
                  return d3.sum(leaves, function(leaf){
                    return leaf[col];});
               }
            });
        }
        return nest.map(data);
     };

     f.resolver = function (col,include_dept,rollup){ 
       /// distinction for col is needed because [col].toString() === col
       // and if col is an array, a different response is returned
       if (_.isArray(col)){
        return "col_array"+[col,include_dept,rollup].join("");
       }
       return [col,include_dept,rollup].join("");
     }
     return _.memoize(f,f.resolver);
  };

  var queries = function(app,table,data){
    this.table = table;
    this.app = app;
    this.dept = app.state.get("dept");
    this.lang = app.state.get("lang");

    this.data = data;
    _.extend(this,table.queries);
    return this;
  };

  var p = queries.prototype;

  p.sort = function(func,reverse){
    reverse = reverse || false;
    var sorted =  _.sortBy(this.data,func);
    if (reverse){
      sorted.reverse();
    }
    
    return sorted;
  };

  p.sum_col = function(col){
     this.grouping()
  }

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
      .reduce(reducer, initial);

    // deal with percentage columns
    _.each(cols, function(col,i){
      var type = this.table.col_from_nick(col).type;
      if (type === 'percentage'){
        total[i] = total[i]/total.length;
      }
    },this);
    return _.object(cols, total);
   };

  p.sum = function(cols, options){
    options = options || {include_defaults : false};
    var include_defaults = options.include_defaults || true;
    var format = options.format || false;
    var as_object = options.as_object === undefined ? true : options.as_object;
    if (_.isUndefined(cols)){
      cols = this.default_cols;
    } else if (!_.isArray(cols)){
      cols = [cols];
    }
    if (options.include_defaults){
      cols = _.uniq(cols.concat(this.default_cols));
    }
    var vals= this.sum_cols(this.data,cols);
    if (format){
      _.each(cols, function(col){
         var type = this.table.col_from_nick(col).type;
         vals[col]= this.app.formater(type,vals[col]);
      },this);
    }
    if (!as_object){
      if (cols.length === 1){
        return vals[cols[0]];
      } else {
        return _.map(cols,function(col){return vals[col]});
      }
    }
   if (cols.length === 1){
      return vals[cols[0]];
   }
    else {
      return vals;
    }
  };

  p.get_subtotals = function(cols,group_func, options){
    var groups = _.groupBy(this.data, group_func)
    _.each(groups, function(group, key){
      groups[key] = this.sum_cols(group,cols);
    },this);
    return groups;
  };

  p.get_cols = function (cols, options){
    var data, each_mapped_obj;
    var options = options || {};
    var sorted = options.sorted || false;
    var reverse = options.reverse || false;
    var gross_percentage = options.gross_percentage;
    var format = options.format;
    var col = cols[0];

    if (!_.isArray(cols)){
      cols = [cols];
    }

    if (sorted){
      var data =  this.sort(cols[0],reverse);
    } else {
      var data = this.data;
    }

    var vals = _.object(_.map(cols, function(col){
      return [col,_.pluck(data,col)];
    }));

    if (gross_percentage){
      var gp_colname = col+'gross_percentage';
      vals[gp_colname] = [];
      var sum = _.chain(vals[col])
        .filter(function(val){return val >=0})
        .reduce(function(x,y){return x+y}) + 1;
      _.each(vals[col], function(val,i,list){
        vals[gp_colname][i] = val/sum;
      });
    }
    if (format){
      _.each(cols, function(col){
         var type = this.table.col_from_nick(col).type;
         vals[col]= this.app.formater(type,vals[col]);
      },this);
      if (gross_percentage){
         vals[gp_colname]=  this.app.formater("percentage",vals[gp_colname]);
      }
    }
    return vals;
  };

  p.get_top_x = function(cols,x,options){
    // sorts by the first col 
    options = options || {};
    _.extend(options,{sorted:true,reverse:true} );
    var all_vals = this.get_cols(cols,options);
    _.each(all_vals, function(list,key){
       all_vals[key] =  _.head(list,x);
    });
    return all_vals;
  };

  p.get_row = function (criteria, options) {
    /*
     * col = either a string or an array of strings for several columns
     * val =
     * options =
     */
    options = options || {};
    var only_one = options.only_one || true;
    var each_mapped_obj = function(obj){
        return _.all(_.map(criteria, function(val,key){
           return obj[key] === criteria[key];
        }));
    };
    return _.find(this.data, each_mapped_obj);
  };

  p.get_rows = function (criteria, options) {
    /*
     * col = either a string or an array of strings for several columns
     * val =
     * options =
     */
    var each_mapped_obj = function(obj){
        return _.all(_.map(criteria, function(val,key){
          if (_.isArray(criteria[key])){
            return _.contains(criteria[key],obj[key]);
          } else {
            return obj[key] === criteria[key];
          }
        }));
    };
    return _.filter(this.data, each_mapped_obj);
  };


  p.get_row_by_key = function(key){
    var key_rows = this.key_rows();
    var i = _.findIndex(key_rows,function(row){
      return _.isEqual(row, key);
    })
    return this.data[i];
  }

  p.key_rows = function(){
    var key_vals = this.get_cols(this.table.keys);
    if (_.keys(key_vals).length === 1){
      return key_vals[_.keys(key_vals)[0]];
    }
    return _.zip.apply(this,_.map(key_vals,function(vals,key){ 
      return key_vals[key];
    }));
  }


})();
