(function() {
  var APP = ns('APP');

  APP.OrgHeader = function(app, org,container){
    var template = APP.t( '#org_header');
    $(template({ org : org })).appendTo(container);
    APP.other_mins(app,org,container);
  };

})();
