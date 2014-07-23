(function() {
  var APP = ns('APP');

  APP.OrgHeader = function(app, org,alternative,container){
    var template = APP.t( '#org_header');
    $(template({ org : org, alternative : alternative })).appendTo(container);
    APP.other_mins(app,org,container);
  };

})();
