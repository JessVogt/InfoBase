(function() {
    var LANG = ns("LANG");
    LANG.l = function (entry,lang){
      return LANG.lookups[entry][lang];
    }
})();

