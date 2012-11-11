$(function () {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var GROUP = ns('GROUP');

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
      this.app = this.options['app'];
      this.row = this.options['row']; //read argument [object w/ only one key,val pair] to get row data
      this.types = this.options['types'];
      if (this.options['summary_row']) {
        this.$el.addClass('info').css('font-weight','bold');
      }
      else if (this.options['min_row']) {
        this.$el.addClass('warning').css('font-weight','bold');
      }
      else if (this.options['goc_row']) {
        this.$el.addClass('success').css('font-weight','bold');
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
            locale: this.app.state.get('lang')
          });
        }
        else if (type == 'percentage' && data != ''){
          data = $.formatNumber(data, {
            format: "0%",
            locale: this.app.state.get('lang')
          });
        }
        div.html(data);
      },
      this //scope of map is rowView
      );
      return this;
    }
  });

  /***********BASE Table VIEW************/
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
      this.rows = _.map(this.options["rows"],function(row){return row});
      this.app = this.options["app"];
      this.def = this.options["def"];
      this.print_btn =this.options["print_btn"] ;
      this.details_btn =this.options["details_btn"] ;
      this.copy_btn =this.options["copy_btn"];
      this.min_data = this.options['min_data'];
      // set some useful state based on these inputs
      this.state = this.app.state;
      this.gt = this.app.get_text;
      this.lang = this.state.get('lang');
      this.col_defs = this.def['col_defs'];
      this.dept = this.state.get('dept')
       // set up holders for different types of rows
      this.summary_rows = [];
      this.goc_data = _.map(this.options['goc_data'], 
          function(row){
            row[0] = this.gt('goc_total');
            return row;
          },
          this);

      this.row_data = this.rows;
      this.init_row_data();
      //
      this.headers = this.def['headers'][this.lang];
      this.title = this.dept.dept[this.lang] +  " - " + this.def['title'][this.lang];
    }
    ,setup_useful_this_links : function(){
      //
      this.header = this.$el.find('thead');
      this.body = this.$el.find('tbody');
      this.footer = this.$el.find('tfoot');
    }
    ,setup_event_listeners : function(){
      this.details_btn.off("click");
      this.copy_btn.off("click");
      this.print_btn.off("click");
      this.state.off("change:goc_tot change:min_tot");

      if ( this.hide_col_ids.length > 0){
        this.details_btn.on("click",this.on_details_click);
      }
      else {
        this.details_btn.hide();
      }
      this.copy_btn.on("click",this.on_copy_click);
      this.print_btn.on("click",this.on_print_click);
      this.state.on("change:goc_tot change:min_tot",this.render);
    }
    ,on_details_click : function(){
      var txt = this.details ?  "details" : "hide";
      this.details = !this.details;
      this.details_btn.html(this.gt(txt));  
      this.activate_dataTable();
    }
    ,to_text : function(){
      var clone = this.$el.find('table').clone();
      clone.find('tfoot').remove();
      return clone
        .wrap('<p></p>')
        .parent()
        .html()
    }
    ,on_print_click : function(e){
     (new APP.printView({
       state : this.state,
       table : this.to_text()
     }));
    }
    ,excel_format : function(){
      var clone = this.$el.find('table').clone();
      clone.find('tfoot').remove();
      clone.find('th').css({"vertical-align" : "bottom"});
      clone.find('table,td,th').css({'border' : '1px solid black'});
      clone.find('table,td,th').css({'border-width' : 'thin'});
      clone.find('td,th').css({"width" : '200px'});
      clone.find('tr:even').css({'background-color' : 'rgb(245,245,245)'})
      clone.find('tr.info').css({'background-color' : '#d9edf7'});
      clone.find('tr.warning').css({'background-color' : '#fcf8e3'});
      clone.find('tr.success').css({'background-color' : '#dff0d8'});
      return clone
        .wrap('<p></p>')
        .parent()
        .html()
    }
    ,on_copy_click : function(e){
      // this will only work with IE7/8
      try {
        window.clipboardData.setData("Text",this.excel_format() );
      }
      catch(err){}
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
                  app : this.app,
                  types: this.col_defs,
                  summary_row: _.indexOf(this.summary_rows,r) != -1,
                });
              }, this
            ),
            function (lineview) {
              this.body.append(lineview.$el)
            },
            this) ;
      if (this.state.get('min_tot')){
      _.each(_.map(this.min_func(),
              function (r) {
                return new rowView({
                  row: r,
                  app : this.app,
                  types: this.col_defs,
                  min_row: true
                });
              }, this
            ),
            function (lineview) {
              this.body.append(lineview.$el)
            },
            this) ;
      }
      if (this.state.get('goc_tot')){
      _.each(_.map(this.goc_data,
              function (r) {
                return new rowView({
                  row: r,
                  app : this.app,
                  types: this.col_defs,
                  goc_row: true
                });
              }, this
            ),
            function (lineview) {
              this.body.append(lineview.$el)
            },
            this) ;
      }
    },
    activate_dataTable : function(){
      if (_.isUndefined(this.details)){
        this.details = false;
      }
      if (this.datatable){
        this.datatable.fnDestroy();
      }
      var options  = _.extend({},this.data_table_args);
      var showing_defs  = this.col_defs;
      // hide columns 
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
      // activate datatables
      this.datatable = $('table',this.$el).dataTable(options);
      
      // set table widths
      var tables_width = _.reduce(_.map(showing_defs,
            function(def){
               return this.width_map[def]},this),
          function(x,y){
            return x+y});
      this.datatable.css({"width" : tables_width+"px"});
      this.$el.find('td').on("click", this,function(event){
        var view = event.data
        // return an array, where the last index is what
        // we need
        var index_ar = view.datatable.fnGetPosition(this);
        var index = index_ar[2];

      })
    }
    ,merge_group_results : function(results){
      // results is in the form of 
      // [[group,result],[group,results]]
      _.each(results,
          function(result){ //each func
            this.summary_rows.push(result[1]);
          },this);
      this.row_data = _.flatten(_.map(results,
          function(result){
            return result[0].concat([result[1]]);
          }),true);
    }
    ,render: function () {
      this.$el.html("");
      this.$el.append( $(this.template({
        title:this.title 
      })));
      this.setup_useful_this_links();
      this.setup_event_listeners();

      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    }
  }) // end of BaseTableView
  TABLES.add_ministry_sum = function(){
    return  [GROUP.fnc_on_group(this.min_data,
        {txt_cols: {0:this.gt('min_total')},
          func_cols : this.sum_cols,
          func : GROUP.sum_rows})];
    }
   TABLES.add_ministry_year_sums = function(){
      var min_totals = GROUP.group_rows(
          this.min_data,
          function(row){ return row[2]},
          {txt_cols : {0 : this.gt('min_total'),
                       2 : function(g){return _.first(g)[2]} },
           func_cols : this.sum_cols,
           func : GROUP.sum_rows}); 
      return _.pluck(min_totals,1);
    }

}); // end of scope

