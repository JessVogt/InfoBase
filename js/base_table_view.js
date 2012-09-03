$(function () {
  var TABLES = ns('TABLES');
  var APP = ns('APP');

  /***********HEADER VIEW*************/
  var headerView = Backbone.View.extend({
    template: _.template($('#header_t').html()),
    tagName: "tr",
    initialize: function () {
      _.bindAll(this);
      this.types = this.options['types'];
      this.headers = this.options['header']; //read argument [object w/ only one key,val pair] to get headers
      this.render(); //self-rendering
    },
    render: function () {
      var args, header;
      //append each data value to tr to make a header that is ready to be appended to thead, later
      _.each(this.headers,

      function (h) {
        var header;
        if (_.isString(h)) args = {
          header: h,
          colspan: 1,
          class_: this.types[_.indexOf(this.headers,h)]
        };
        else args = _.extend({class_: ''},h);
        header = this.template(args);
        $(this.el).append(header); //append header
      },
      this //scope of map is rowView
      );
      return this;
    }
  });
  /*************ROW VIEW***************/
  var rowView = Backbone.View.extend({
    tagName: "tr",
    initialize: function () {
      _.bindAll(this);
      this.row = this.options['row']; //read argument [object w/ only one key,val pair] to get row data
      this.types = this.options['types'];
      if (this.options['info_row']) {
        this.$el.addClass('info');
      }
      this.render(); //self-rendering
    },
    render: function () {
      //append each data value to tr to make a row that is ready to be appended to tbody, later
      _.map(
      _.zip(this.row, this.types),

      function (data_type) {
        var data = data_type.shift();
        var type = data_type.shift();
        var el = $('<td><div>');
        this.$el.append(el);
        var div = el.find('div')
        div.addClass(type);
        if (_.isString(data) && data.length > 80){
          el.attr("title", data);
          el.attr("data-placement", "top");
          el.attr("rel", "tooltip");
          data = data.substring(0,77) + "...";
        }
        else  if (type == 'float') {
          data = $.formatNumber(data, {
            format: "#,##0",
            locale: APP.app.state.get('lang')
          });
        }
        else if (type == 'percentage'){
          data = $.formatNumber(data, {
            format: "0%",
            locale: APP.app.state.get('lang')
          });
        }
        div.html(data);
      },
      this //scope of map is rowView
      );
      return this;
    }
  });

  /***********BASE TBL VIEW************/
  TABLES.BaseTableView = Backbone.View.extend({
    data_table_args : {
        "bAutoWidth" : false,
        "bFilter": false,
        "bInfo" : false,
        "bPaginate" : false,
        "bSort" : false
    }
    ,width_map : {
      "int" : 90,
      "float" : 90,
      "str" : 150,
      "wide-str" : 300,
      "percentage" : 90,
      "date" : 90
    }
    ,template: _.template($('#list_t').html())
    ,hide_col_ids: []
    ,initialize: function () {
      _.bindAll(this);
      // retrieve passed in data
      this.key = this.options["key"];
      this.rows = this.options["rows"];
      this.app = this.options["app"];
      this.def = this.options["def"];
      this.print_btn =this.options["print_btn"] ;
      this.details_btn =this.options["details_btn"] ;
      this.copy_btn =this.options["copy_btn"];
      this.fs_btn =this.options["fs_btn"];
      // set some useful state based on these inputs
      this.state = this.app.state;
      this.gt = APP.app.get_text;
      this.lang = this.state.get('lang');
      this.col_defs = this.def['col_defs'];
       //
      this.info_rows = [];
      this.copied_row_data = _.map(this.rows, this.make_copy); // copy the rows so we can modify them
      this.row_data = _.map(this.copied_row_data, this._mapper); //local var declared to store rows manipulated by mapper
      this.init_row_data();
      //
      this.headers = this.def['headers'][this.lang];
      this.$el = $(this.template({
        title: this.def['title'][this.lang]
      }));
       //
      this.setup_useful_this_links();
      this.setup_event_listeners();
    }
    ,setup_useful_this_links : function(){
      //
      this.header = this.$el.find('thead');
      this.body = this.$el.find('tbody');
      this.footer = this.$el.find('tfoot');
    }
    ,setup_event_listeners : function(){
      if ( this.hide_col_ids.length > 0){
        this.details_btn.click(this.on_details_click);
      }
      else {
        this.details_btn.hide();
      }
      this.fs_btn.click(this.on_fs_click);
      this.copy_btn.click(this.on_copy_click);
      this.print_btn.click(this.on_print_click);
    }
    ,on_fs_click : function(){
      var self = this;
      var home = this.$el.parent();
      var txt =  this.gt("full_screen");
      this.print_btn.hide();
      APP.app.hide();
      this.$el.detach().appendTo("body");
      this.fs_btn.html("Return")
        .unbind('click',this.on_fs_click)
        .click(function(){
          APP.app.show();
          self.$el.detach().appendTo(home);
          self.print_btn.show();
          self.fs_btn.html(txt)
             .click(self.on_fs_click)
        });
    },
    on_details_click : function(){
      var txt = this.details ?  "details" : "hide";
      this.details = !this.details;
      this.details_btn.html(this.gt(txt));  
      this.datatable.fnDestroy();
      this.activate_dataTable();
    },
    on_print_click : function(e){
     (new APP.printView({
       state : this.state,
       table : this.to_text()
     }));
    },
    to_text : function(){
      return this.$el.find('table')
          .wrap('<p></p>')
          .parent()
          .html(); 
    },
    on_copy_click : function(e){
      // this will only work with IE7/8
      try {
        window.clipboardData.setData("Text",this.to_text() );
      }
      catch(err){}
    },
    make_copy: function (row) {
      // creates a copy of the row
      return $.extend([], row);
    },
    _mapper: function (row) {
      return this.mapper(row)
    }
    , make_headers: function () {
      _.each(_.map(this.headers, function (h) {
        return new headerView({
          types : this.col_defs,
          header: h
        });
      },this),

      function (hv) {
        this.header.append(hv.$el)
      },
      this)
    }
    , make_footers: function () {
      if (_.size(this.row_data) > 15 ) {
        var views = _.map(this.headers, function (h) {
          return new headerView({
            types : this.col_defs,
            header: h
          });
        },this)
        views.reverse();
        _.each(views,
        function (fv) {
          this.footer.append(fv.$el)
        },
        this)
      }
    }
    ,make_body: function () {
      _.each(_.map(this.row_data,

      function (r) {
        return new rowView({
          row: r,
          types: this.col_defs,
          info_row: _.indexOf(this.info_rows,r) != -1
        });
      }, this),

      function (lineview) {
        this.body.append(lineview.$el)
      },
      this)
    },
    activate_dataTable : function(){
      if (_.isUndefined(this.details)){
        this.details = false;
      }
      var options  = _.extend({},this.data_table_args);
      var showing_defs  = this.col_defs;
      if (!this.details && this.hide_col_ids.length > 0){
        showing_defs = _.map(_.filter(_.range(_.size(this.col_defs)),
              function(i){
                return _.indexOf(this.hide_col_ids,i) == -1},this),
            function(i){
              return this.col_defs[i]},this);

        options["aoColumnDefs"]  = [{
          "bVisible" : false,
          "aTargets" : this.hide_col_ids
        }];
      }
      this.datatable = $('table',this.$el).dataTable(options);
      
      var tables_width = _.reduce(_.map(showing_defs,
            function(def){
               return this.width_map[def]},this),
          function(x,y){
            return x+y});
      this.datatable.css({"width" : tables_width+"px"});
    },
    perform_fnc_on_group : function(group,txt,fnc,impacted_cols){
      var cols = _.range(0, group[0].length);
      var sum_row = _.map(cols,

      function (col_idx) { // takes a column index
        // the first column will always be text
        if (col_idx == 0) {
          return txt;
        }
        // this column should not be subtotaled
        if (_.indexOf(impacted_cols,col_idx) == -1) {
          return ''
        } else {
          return fnc(group,col_idx);
        }
      });
      this.info_rows.push(sum_row);
      group.push(sum_row);
    },
    add_rows : function(rows,i){
      // this column will be subtotaled
      // check for the data type, floats and ints
      return _.reduce(_.map(rows,

      function (row) {
        return row[i]
      }),

      function (x, y) {
        return x + y
      });
    },
    avg_rows : function(rows,i){
      return this.add_rows(rows,i) / rows.length;
    },
    group_rows: function (group_func,fnc,txt) {
      // group the rows
      groups = _.groupBy(this.row_data,group_func );
      _.each(groups,
          function(group){
              this.perform_fnc_on_group(group,txt,fnc,this.sum_cols);
          },this);
      // stitch the groups back together into one array
      if (groups.length == 1) {
        this.row_data = groups[0];
      } else {
        this.row_data = _.reduce(groups,

        function (x, y) {
          return x.concat(y)
        });
      }
    } // end of group_rows
  }) // end of BaseTableView
}); // end of scope

