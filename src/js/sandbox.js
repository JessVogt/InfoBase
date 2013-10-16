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
})(this);

