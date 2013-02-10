$(function () {
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');

  // attach all the graphs to their respective views
  APP.dispatcher.once("tables_loaded",function(app){
    TABLES.tables;
  });

  var BaseTableWidget = Backbone.View.extend({
    initialize : function(){
      this.table = this.options['table'];
      this.def = this.table.attributes;
      this.app = this.options['app'];
      _.extend(this,this.def['mini_view']);
      _.bindAll(this);
      this.org = this.state.get("dept");
      this.lang = this.state.get('lang');
      this.id = this.def['id'];
    }
    ,render : function(){


    }
  });

  var widgets = {
   "Table1" : BaseTableWidget.extend({

   })
   ,"Table2" : BaseTableWidget.extend({

   })          
   ,"Table2a" :BaseTableWidget.extend({

   })          
   ,"Table2b" : BaseTableWidget.extend({

   })          
   ,"Table3" : BaseTableWidget.extend({

   })          
   ,"Table4" : BaseTableWidget.extend({

   })          
   ,"Table5" : BaseTableWidget.extend({

   })          
   ,"Table6" : BaseTableWidget.extend({

   })          
   ,"Table7" : BaseTableWidget.extend({

   })          
  };

});

