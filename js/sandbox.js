(function() {

  window.root_namespace = function(root) {
    var ns;
    return ns = function(ns_string, context) {
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
  };

  window.ns = window.root_namespace({});

}).call(this);

(function() {
   var UTILS = ns('UTILS');

   UTILS.to_obj = function(ar1,ar2){
     var new_obj = {}
     var zipped = _.zip(ar1, ar2);
     for (var i in zipped){
       new_obj[zipped[i][0]] = zipped[i][1];
     }
     return new_obj;
   }
   UTILS.filter_obj_by_vals = function(obj,vals){
     var new_obj = {}
     var filtered_keys = _.filter(_.keys(obj),
         function(key){
           return _.indexOf(vals,obj[key]) != -1
         });
     for (var i in filtered_keys){
       new_obj[filtered_keys[i]] = obj[filtered_keys[i]];
     }
     return new_obj;
   }
   UTILS.sum_ar = function(ar){
     ar = _.filter(ar,function(x){return _.isNumber(x)});
     return _.reduce(ar,function(x,y){return x+y});
   }
   UTILS.zip_obj = function(obj){
    return _.map(_.keys(obj),
        function(key){
          return [key,obj[key]];
        });
   }

}).call(this);

