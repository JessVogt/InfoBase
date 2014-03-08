(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');
    var TABLES = ns('TABLES');

  APP.DetailsView = Backbone.View.extend({
    template : '#dataview_t'
    ,initialize: function(){
      this.template = APP.t(this.template);
      _.bindAll(this,"render","tear_down","setup_useful_this_links",
                "on_about_click", "on_min_tot_click","on_goc_tot_click");
      // retrieve passed in data
      this.app = this.options["app"];
      this.def = this.options["def"];

      this.key = this.def["id"];
      this.gt = this.app.get_text;
      this.state = this.app.state;
      this.dept = this.state.get("dept");
      this.lang = this.state.get("lang");
    }

    ,render: function(){

    }
  })

})();

