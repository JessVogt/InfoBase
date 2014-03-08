(function(root) {
  
  var TABLES = ns('TABLES');
  var APP = ns('APP');

  var make_select = function (app,options) {
      var m = TABLES.m;
      var rand = APP.make_unique();
      var sel = $('<select>').attr("id", rand);
      d3.select(sel[0]).selectAll("option")
        .data(options)
        .enter()
        .append("option")
        .html(function(d){ return m(d.val);})
        .attr("val",function(d){return d.val;})
        .filter(function(d){return d.selected == true;})
        .attr("selected","selected");
      return $('<span>')
        .append($("<label>")
        .attr({ "for": rand, 'class': 'wb-invisible' })
        .html(app.get_text("select_fy"))
        ).append(sel);
  };

  var miniTableSelectMixin = {
    selectmixininit : function(){
      this.option = _.find(this.drop_down_options ,function(x){
        return x.selected;
      }) || this.drop_down_options[0];
    },
    post_render: function () {
      var desc = this.$el.find('.description');
      desc.find('.minisel').remove();
      var select =  make_select(this.app,this.drop_down_options)
        .addClass("minisel");
      desc.append(select);
      desc.find("select")
        .on("change", this.on_select)
    },
    on_select: function (e) {
      this.option = $(":selected",e.target)[0].__data__;
      _.each(this.drop_down_options, function(o){o.selected = false;});

      this.option.selected = true;
      APP.dispatcher.once(this.make_signal(),this.focus);
    },
    focus : function(){
      this.$el.find("select").focus();
    }                          
  };


  TABLES.miniTableVew = Backbone.View.extend({

    template : '#mini_t'
    ,initialize : function(){
      this.template = APP.t(this.template);
      this.def = this.options.table;
      this.app = this.options.app;
      this.org = this.app.state.get("dept");
      this.lang = this.app.state.get('lang');
      this.ttf = this.app.formater;
      this.list_ttf = this.app.list_formater;
      this.gt = this.app.get_text;
      this.da = this.def.q(this.org.accronym);
      _.extend(this,this.def.mini_view);

      if (_.has(this, "drop_down_options")){
        _.extend(this,miniTableSelectMixin);
        this.selectmixininit();
      }
      _.bindAll.apply(this,[this].concat(_.functions(this)));

      // find the target div for this minigraph
      // based on the def which was provided
      this.$el = $('#'+this.def.id);
    },
    header_lookup : function(nick){
       return this.def.col_from_nick(nick).header[this.lang];
    }
    ,make_title : function(){
      this.$el.find('.title')
        .html("")
        .append(this.def['name'][this.lang]);
    }
    ,add_description: function(){
      if (this.description){
        this.$el.find('.description')
          .html("")
          .append(
            TABLES.m(this.description[this.lang])
        );
      }
    }
    ,set_no_content : function(){
      this.content = $("<p >").html(this.gt("no_data"));
      this.$el.find('div.details_button').remove();
      this.$el.find('p.description').remove();
    }
    ,render : function(){
      // why this if?
      if (this.$el.children().length ===0 ){
        this.$el.append(this.template({
          details_title : this.gt("more_details") + " " + this.def.name[this.lang],
          href : "t-" + this.org.accronym +"-"+this.def.id.replace(/[a-zA-Z_-]+/,"")
        }));
      }
      this.make_title();
      this.add_description();
      if (this.da.data){
        this.prep_data();
        if (this.rows && this.headers) {
          TABLES.prepare_data({
            rows : this.rows,
            headers : this.headers,
            headers_class : this.classes || this.headers_classes,
            row_class : this.classes || this.row_classes
          });
          this.content = $('<div>');
          TABLES.d3_build_table({
            node : this.content[0],
            headers : this.headers,
            rows : this.rows
          });
          this.content.find("table")
            .addClass("well-table")
            .css({"width" : "100%"});
        }
      } else {
        this.set_no_content();
      }
      this.$el.find('.mini_payload')
        .children()
        .remove()
      this.$el.find('.mini_payload')
        .append(this.content);

      if (this.da.data){
        this.post_render();
      }

      APP.dispatcher.trigger_a(this.make_signal(),this);
      return this;
    }
    ,post_render : function(){}
    ,resize_my_row : function(){
       this.$el.parents('.widget-row').each(APP.size_row);
    }
    ,make_signal : function(){
      return 'table_' + this.def.id +"_rendered";
    }
    ,trigger_click : function(){
      this.$el.find('a.details').trigger("click");
    }
  });

  APP.listen_for_tables = function(container,app, dept){
    var signals = _.map(TABLES.tables,function(table){
      return 'table_' + table.id +"_rendered";
    });
    APP.size_panels(container, app,signals);
  };

  APP.dispatcher.on("dept_selected", APP.listen_for_tables);

  APP.size_row = function(container, i,row)   {
     var panels =  $('.mini_t',row);
     var width = $(window).width();
     if ( width >= 1400){
      panels.width( (container.width() - 60)/3  - 1);
     } else if (width >= 1000){
      panels.width( (container.width() - 50)/2  - 1);
     } else {
      panels.width( (container.width() - 20 - 1));
     }
     _.each(['.section-header', 'p.description','th','.mini_payload'],
         function(selector){
            $(selector,row)
            .css("height","")
            .height(_.max($(selector,row).map(function(x,y){
              return $(y).height();
            })));
     })
  };

  APP.size_panels = function(container, app,signals){
    // once all the mini table signals have been sent
    // do some prettying up on the page
    APP.dispatcher.on_these(signals, function(){
      var current_view;
      var dept = app.state.get("dept");
      var views = _.toArray(arguments);
      var current_table = app.state.get("table");
      // figure out the currently selected table, if any
      if (current_table){
        current_view = _.first(_.filter(views,function(v){
          // compare the views table deifnition with the current
          // table AND make sure the currently selected
          // department has data for that kind of table
          return (v.def.id === current_table.get('id') &&
                  _.has(dept.tables,v.def.id));
        }));
      } else {
        current_view = undefined;
      }

      $('.widget-row').each(function(i,row){ APP.size_row(container, i,row)});
    });
  };

})();

