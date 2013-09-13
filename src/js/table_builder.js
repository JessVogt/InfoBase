$(function () {
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var HORIZONTAL = ns("HORIZONTAL");
  var APP = ns('APP');

  var TableBuilderSideBar = Backbone.View.extend({
    template : ""
    ,initialize : function(){
      this.table = this.options['table'];
      this.app = this.options['app'];
      this.def = this.table.attributes;
      this.state = this.app.state;
      this.lang = this.state.get('lang');
    }
  });

  TABLES.TableBuilder = Backbone.View.extend({
    template : ""
    ,initialize : function(){
      this.table = this.options['table'];
      this.app = this.options['app'];
      this.def = this.table.attributes;
      this.state = this.app.state;
      this.lang = this.state.get('lang');
    }

  });

});
