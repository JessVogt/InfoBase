$(function () {
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var HORIZONTAL = ns("HORIZONTAL");
  var APP = ns('APP');

  var launch_table_builder = function(event){
     var view = $(event.currentTarget).data("view");
     

  }

  $('body').on(
    "click",
    ".horizontal-panels a.details",
    launch_table_builder
  );

  APP.dispatcher.on("horizontal_explore",function(app){
    app.remove();
    var vertical_navbar = _.template($('#hori_navbar_t').html());
    $('.nav_bar_ul').children().remove();
    $('.nav_bar_ul').append(vertical_navbar({
      gt : app.get_text
    }));

    var panels_t = _.template($('#panels_t').html())
    app.app.html(panels_t({
      gt : app.get_text
    }));
    app.app.addClass("horizontal-panels");

    TABLES.tables.each(function(table){
      var hv = table.get("horizontal_view");
      var v = new hv({
        app : app
        ,table : table
      });
      v.render();
    });

    var signals = TABLES.tables.map(function(table){
      return 'base_table_' + table.get("id") +"_rendered";
    })
    APP.size_panels(app,signals)
  });

  APP.dispatcher.once("load_tables",function(app){
    var add_horizontal_view = function(table){
      table.set("horizontal_view", HORIZONTAL.widgets[table.get("id")]);
    }
    TABLES.tables.each(add_horizontal_view);
    TABLES.tables.on("add",add_horizontal_view);
  });

  var BaseHorizontalWidget = Backbone.View.extend({
    template : _.template($('#mini_t').html())
    ,initialize : function(){
      this.table = this.options['table'];
      this.app = this.options['app'];
      this.def = this.table.attributes;
      this.state = this.app.state;
      this.lang = this.state.get('lang');
      _.extend(this,this.def['mini_view']);
      _.bindAll(this);
      this.id = this.def['id'];
      this.$el = $('#'+this.id);
    }
    ,make_title : function(){
      this.$el.find('.title').append(this.def['name'][this.lang]);
    }
    ,render : function(){
      this.$el.append(
       $(this.template({
         gt : this.app.get_text       
       }))
      );
      this.make_title();
      APP.dispatcher.trigger_a(this.make_signal(),this);

      this.$el.find('a.details').data({view:this});
      return this;
    }
    ,make_signal : function(){
     return 'base_table_' + this.def.id +"_rendered";
    }
  });

  HORIZONTAL.widgets = {
   "Table1" : BaseHorizontalWidget.extend({

   })
   ,"Table2" : BaseHorizontalWidget.extend({

   })          
   ,"Table2a" :BaseHorizontalWidget.extend({

   })          
   ,"Table2b" : BaseHorizontalWidget.extend({

   })          
   ,"Table3" : BaseHorizontalWidget.extend({

   })          
   ,"Table4" : BaseHorizontalWidget.extend({

   })          
   ,"Table5" : BaseHorizontalWidget.extend({

   })          
   ,"Table6" : BaseHorizontalWidget.extend({

   })          
   ,"Table7" : BaseHorizontalWidget.extend({

   })          
  };

});

