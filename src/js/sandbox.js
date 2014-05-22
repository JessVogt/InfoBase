// create JS namespace functionality, this is perferable 
// to using global variables, the namespace is just an object
// which stores references to functions/variables which you
// want to share across the application

// an immediate function
(function(root) {
  // function, when passed an empty object will create another
  // function "ns"  which allows you to create/request namespaces
  var root_namespace = function(root) {
    var ns = function(ns_string, context) {
      // example "D3.BAR"
      // first run: ns_string will be the namespace string requested example: "D3.BAR"
      // second run: ns_string will be the namespace string requested example: "BAR"
      // first_run = context will be undefined, will be set to root
      // second_run = context will equal ns("D3")
      var parts;
      // first case, no argument is passed: example window.ns();
      if (typeof ns_string === 'undefined') return root;
      // at this point, ns_string is not undefined
      // first_run: if context is undefined, then make it point to root
      // second_run: context will be defined, do nothing
      if (typeof context === 'undefined') context = root;
      // we are using dots "."  to denote nested namespaces
      // parts => ["D3","BAR"]
      parts = ns_string.split(".");
      // first_run: parts[0] === "D3"
      // second_run part[0] === "BAR"
      //  is context["D3"] undefined ? then create an empty child object
      if (typeof context[parts[0]] === 'undefined') context[parts[0]] = {};
      // firstrun: parts.length === 2, so recursively call ns
      // second_run parts.length === 1, you're done, return the object
      if (parts.length > 1) {
        // parts.slice(1) => ["BAR"]
        // parts.slice(1).join(".")=> "BAR"
        return ns(parts.slice(1).join("."), context[parts[0]]);
      } else {
        return context[parts[0]];
      }
    };
    return ns ;
  };
  window.ns = root_namespace({});
})(this);

(function(root) {
  var UTILS;
})(this);

