(function(root) {
  var root_namespace = function(root) {
    var ns = function(ns_string, context) {
      var parts;
      if (typeof ns_string === 'undefined') return root;
      if (typeof context === 'undefined') context = root;
      parts = ns_string.split(".");
      if (typeof context[parts[0]] === 'undefined') context[parts[0]] = {};
      if (parts.length > 1) {
        return ns(parts.slice(1).join("."), context[parts[0]]);
      } else {
        return context[parts[0]];
      }
    };
    return ns ;
  };

  root.ns = root_namespace({});

})(this);

(function(root) {
  var UTILS;
  if (typeof exports === 'undefined') {
    UTILS = ns('UTILS');
  } else {
    UTILS = exports.ns('UTILS');
  }

   UTILS.to_obj = function(ar1,ar2){
     var new_obj = {};
     var zipped = _.zip(ar1, ar2);
     for (var i in zipped){
       new_obj[zipped[i][0]] = zipped[i][1];
     }
     return new_obj;
   };
   UTILS.filter_obj_by_vals = function(obj,vals){
     var new_obj = {};
     var filtered_keys = _.filter(_.keys(obj),
         function(key){
           return _.indexOf(vals,obj[key]) != -1;
         });
     for (var i in filtered_keys){
       new_obj[filtered_keys[i]] = obj[filtered_keys[i]];
     }
     return new_obj;
   };
   UTILS.add_ar = function(ar1,ar2){
     return _.map(_.zip(ar1,ar2),function(x){
       return x[0]+x[1];
     });
   };
   UTILS.sum_ar = function(ar,iterator){
     iterator = iterator || _.identity;
     ar = _.filter(_.map(ar,iterator),
         function(x){return _.isNumber(x);});
     return _.reduce(ar,function(x,y){return x+y;});
   };
   UTILS.sum_these_cols = function(ar, cols){
    var initial = _.map(cols,function(){return 0;});
    initial = _.object(cols, intial);
    function reducer(x,y){
      return _.map(cols, function(col){
        return x[col] + y[col];
      });
    };
    return _.reduce(ar, reducer,initial);
   };
   UTILS.zip_obj = function(obj){
    return _.map(_.keys(obj),
        function(key){
          return [key,obj[key]];
        });
   };
   UTILS.to_new_table_format = function(table){
     var TABLES = ns().TABLES;
     return _.chain(table.col_defs) 
       .zip(_.map(_.range(table.col_defs.length), function(i){
                      return  TABLES.extract_headers(table.headers.en,i);
            }),
            _.map(_.range(table.col_defs.length), function(i){
              return  TABLES.extract_headers(table.headers.fr,i);
            })
       )
       .map(function(grp){
         return {
           header : {en: grp[1][0],fr:grp[2][0]},
           child : {
             type : grp[0],
             header : {en: grp[1][1], fr: grp[2][1]}
           }
         };
       })
       .groupBy(function(x){
          return x.header.en;
       })
       .map(function(grp){
         return {header : grp[0].header,
                children : _.pluck(grp, "child")
         };
       })
       .value();
   }

   UTILS.make_col_adder(table){
    function add_child(x){
      this.children = this.children || [];
      if (!_.isArray(x)){
        x = [x];
      }
      _.each(x, function(col){
         col.parent = this;
         adder(col);
      });
      this.children.push(child);
      return this;
    }
    function adder(x){
        if (_.isString(x)){
          x =  {header : {en: x, fr: x}};
        }
        if (!_.has(x,"key")){
           x.key = false;
        }
        if (!_.has(x,"parent")){
           table.cols.append(x);
        }   
        x.add_child = add_child;
     }
    return adder
   }

})(this);

