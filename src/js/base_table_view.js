(function(root) {
  
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var GROUP = ns('GROUP');

  // attach all the tables to their respective views
  APP.dispatcher.once("load_tables",function(app){
    var add_table_view = function(table){
      // setup the table views
      table.table_view= TABLES.BaseTableView.extend(table.table_view);
    };
    _.each(TABLES.tables,add_table_view);
    APP.dispatcher.on("new_table",add_table_view);
  });

  var table_template = '#list_t';

  var headerView = Backbone.View.extend({
    template: '#header_t',
    tagName: "tr",
    initialize: function () {
      this.template = APP.t(this.template)
      _.bindAll(this,"render");
      this.types = this.options['types'];
      this.header = this.options['header']; //read argument [object w/ only one key,val pair] to get headers
      this.headers = _.clone(this.options['headers']);
      // chop the headers to just the ones above
      this.headers.splice(_.indexOf(this.headers,this.header)); 

      this.m= TABLES.m;
      this.render(); //self-rendering
    },
    render: function () {
      var args, header;
      //append each data value to tr to make a header that is ready to be appended to thead, later
      _.each(this.header,

      function (h,i) {
        var header,parent_headers,header_id;
        if (_.isString(h)) {
          args = {
            header: h
            ,colspan: 1
            ,class_: this.types[_.indexOf(this.header,h)]};
          args['el'] = h ? "th" : "td";
        }
        else {
          args = _.extend({class_: ''},h);
          args['el'] = h.header ? "th" : "td";
        }
        var header_id = args['header'].replace(/\W|_/g,"");
        args['header'] = this.m(args['header']);
        header = $(this.template(args));
        // figure out the WCAG header link
        if (this.headers.length > 0) {
          parent_headers = TABLES.extract_headers(this.headers,i)
          parent_headers = _.map(parent_headers ,function(s){return s.replace(/\W|_/g,"")});
          header.attr("headers",$.trim(parent_headers.join(" ")));
          header_id = parent_headers.join(" ")+header_id;
        }
        header.attr("id",header_id);
        $(this.el).append(header); //append header
      },
      this //scope of map is rowView
      );
      return this;
    }
  });

  var rowView = Backbone.View.extend({
    tagName: "tr",
    initialize: function () {
      _.bindAll(this,"render");
      this.app = this.options['app'];
      this.row = this.options['row']; //read argument [object w/ only one key,val pair] to get row data
      this.wcag = this.options['wcag'];
      this.types = this.options['types'];
      this.table = this.options['table'];
      if (this.options['summary_row']
          ||this.options['min_row']
          ||this.options['goc_row']) {
        this.$el.addClass('info-row').css('font-weight','bold');
      }
      this.render(); //self-rendering
    },
    render: function () {
      //append each data value to tr to make a row that is ready to be appended to tbody, later
      _.map(
        _.zip(this.wcag,this.row, this.types),
        function (data_type,index) {

          var wcag = data_type.shift();
          var data = data_type.shift();
          var type = data_type.shift();
          // IE7 workaround
          if (_.isUndefined(data)){return};
          var el = $('<td><div>');
          el.attr("headers",wcag);

          this.$el.append(el);
          var div = el.find('div')
          div.addClass(type);
          // add the anchor element which can be clicked on 
          // if this data element isn't a table key
          if (this.table.not_key(index) 
              && !this.options['min_row']
              && !this.options['summary_row']
              && !this.options['goc_row']) {
            div.addClass('table_a');
            div.append("<a href='#'></a>");
            div = div.find("a");
            div.attr("title",this.app.get_text("horizontal_compare"));
          }
          if (type == 'big-int') {
            data = this.app.formater(type,data);
          }
          else if (type == 'percentage' && data != ''){
            data = this.app.formater(type,data);
          }
          div.html(data);
        },
        this //scope of map is rowView
        );
        this.$el.data("row",this.row);
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
    ,hide_col_ids: []
    ,initialize: function () {
      _.bindAll(this,"setup_useful_this_links","setup_event_listeners",
                "on_details_click","to_text","on_print_click",
                "on_copy_click", "make_headers","make_body",
                "make_footer","activate_dataTable","merge_group_results",
                "not_key","render","on_td_click");
      // retrieve passed in data
      this.key = this.options["key"];
      this.rows = _.map(this.options["rows"],function(row){return row});
      this.app = this.options["app"];
      this.def = this.options["def"];
      this.print_btn =this.options["print_btn"] ;
      this.details_btn =this.options["details_btn"] ;
      this.copy_btn =this.options["copy_btn"];
      this.min_data = this.options['min_data'];
      this.mapper = this.options['mapper'];
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
          this
      );

      this.min_data =  this.min_func();

      this.row_data = this.rows;
      this.init_row_data();
      //
      this.headers = this.def['headers'][this.lang];
      this.title = TABLES.m(this.dept.dept[this.lang] +  " - " + this.def['title'][this.lang]);

      this.$el.on("click", 'td .table_a', this.on_td_click);
    }
    ,setup_useful_this_links : function(){
      //
      this.header = this.$el.find('thead');
      this.body = this.$el.find('tbody');
      this.footer = this.$el.find('tfoot');
    }
    ,setup_event_listeners : function(){
      if (this.details_btn){
        this.details_btn.off("click");
        if ( this.hide_col_ids.length > 0){
          this.details_btn.on("click",this.on_details_click);
        }
        else {
          this.details_btn.hide();
        }
      }

      if (this.copy_btn){
        this.copy_btn.off("click");
        this.copy_btn.on("click",this.on_copy_click);
      }
      if (this.print_btn){
        this.print_btn.off("click");
        this.print_btn.on("click",this.on_print_click);
      }

      this.state.off("change:goc_tot change:min_tot");
      this.state.on("change:goc_tot change:min_tot",this.render);
    }
    ,on_details_click : function(){
      var txt = this.details ?  "details" : "hide";
      this.details = !this.details;
      this.details_btn.html(this.app.get_text(txt));  
      this.render();
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
       app: this.app,
       table : this.to_text()
     }));
    }
    ,on_copy_click : function(e){
        TABLES.excel_format( this.for_copying.find('table'),true);
    }
    ,make_headers: function () {
      _.each(_.map(this.headers, function (h) {
        return new headerView({
          types : this.col_defs,
          header: h,
          headers : this.headers
        });
      },this),

      function (hv) {
        this.header.append(hv.$el)
      },
      this)
    }
    ,make_body: function () {
        // add in WCAG links
      var wcag_links = _.map(this.row_data[0],function(x,i){
        var headers = TABLES.extract_headers(this.headers,i);
        return $.trim(_.map(headers, function(header,index){
          return _.first(headers,index+1).join("").replace(/\W|_/g,"");
        }).join(" "));
      },this);
      _.each(_.map(this.row_data.concat(this.min_data).concat(this.goc_data),
              function (r) {
                is_min = _.indexOf(this.min_data,r) != -1; 
                is_goc = _.indexOf(this.goc_data,r) != -1;
                if ((is_min && !this.state.get("min_tot")) ||
                    (is_goc && !this.state.get("goc_tot"))){
                  return;    
                 }
                is_summary = _.indexOf(this.summary_rows,r) != -1;
                return new rowView({
                  row : r,
                  wcag : wcag_links,
                  types : this.col_defs,
                  app : this.app,
                  table : this,
                  summary_row: is_summary,
                  goc_row: is_goc,
                  min_row: is_min
                });
              }, 
              this
            ),
            function (lineview) {
              if (!lineview){ return;}
              this.body.append(lineview.$el)
            },
            this
      );
    }
    ,make_footer: function () {
      if (_.size(this.row_data) > 15 && this.state.get("use_footer")) {
        _.each(_.map(this.headers, function (h) {
          return new headerView({
            types : this.col_defs,
            header: h,
            headers : this.headers
          });
        },this).reverse(),
        function (hv) {
          this.footer.append(hv.$el)
        },
        this);
      }
    }
    ,activate_dataTable : function(){
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
    ,not_key : function(index){
        return (_.all(this.def.key, 
              function(key){return key!= index}))
    }
    ,render: function () {
      this.details = this.details || false;
      if (this.datatable){
        this.datatable.fnDestroy();
      }
      this.$el.children().remove();

      this.$el.append( $(APP.t(table_template)({
        title:this.title
        ,extra_table_classes : 'wet-boew-zebra table-medium'
      })));
      this.setup_useful_this_links();
      this.setup_event_listeners();

      this.make_headers();
      this.make_body();
      this.make_footer();

      this.for_copying = this.$el.clone();

      var tds = this.$el.find('td div');


      this.activate_dataTable();
      var that = this;
      setTimeout(function(){
        APP.dispatcher.trigger("table_rendered",that);
      });
      return this;
    }
    ,on_td_click : function(event){
      var self = this;
      var td = $(event.target).parents('td');
      var tr = td.parent();
      var row = tr.data('row');
      if (_.indexOf(this.row_data,row) == -1 || tr.hasClass("background-highlight")){
        return;
      }
      var index_ar = self.datatable.fnGetPosition(td.get(0));
      var index = index_ar[2];

      // return an array, where the last index is what
      // we need
      var av = new TABLES.AnalyticsView({
        original_el : td.find('a'),
        dept : self.dept,
        key : self.key,
        row : row,
        col_index : index,
        app : self.app,
        def : self.def,
        mapper : self.mapper
      });
      av.render();
    }
    ,remove : function(){
      this.$el.off("click");
    }
  }) // end of BaseTableView

  TABLES.miniTableVew = Backbone.View.extend({

    template : '#mini_t'
    ,initialize : function(){
      this.template = APP.t(this.template);
      this.table = this.options.table;
      this.def = this.table;
      this.app = this.options.app;
      _.extend(this,this.def.mini_view);
      _.bindAll.apply(this,[this].concat(_.functions(this)));
      this.state = this.app.state;
      this.org = this.state.get("dept");
      this.lang = this.state.get('lang');
      this.id = this.def.id;

      if (this.org['mapped_objs'][this.id][this.lang].length > 0){
        this.data = this.org['mapped_objs'][this.id][this.lang];
      } else {
        this.data = null;
      }
      this.headers = _.last(this.def['headers'][this.lang])
      this.h_lookup = this.def['header_lookup']['en'];
      this.gt = this.app.get_text;
      // find the target div for this minigraph
      // based on the def which was provided
      this.$el = $('#'+this.id);
    }
    ,to_lang : function(header){
      return this.headers[this.h_lookup[header]];
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
      if (this.$el.children().length ===0 ){
        this.$el.append(this.template({
          details_title : this.gt("more_details") + " " + this.def.name[this.lang]
        }));
      }
      this.make_title();
      this.add_description();
      if (this.data){
        this.prep_data();
        this.render_data();
        this.content.css({"width" : "100%"});
      } else {
        this.set_no_content();
      }
      this.$el.find('.mini_payload')
        .html("")
        .append(this.content);

      if (this.data){
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

    TABLES.excel_format = function(table,strip_footer){
      strip_footer = strip_footer | false;
      var clone = $(table).clone();
      if (strip_footer){
        clone.find('tfoot').remove();
      }
      clone.find('th').css({"vertical-align" : "bottom"});
      clone.find('table,td,th').css({'border' : '1px solid black'});
      clone.find('table,td,th').css({'border-width' : 'thin'});
      clone.find('td,th').css({"width" : '200px'});
      clone.find('tr:even').css({'background-color' : 'rgb(245,245,245)'})
      clone.find('tr.info').css({'background-color' : '#d9edf7'});
      clone.find('tr.warning').css({'background-color' : '#fcf8e3'});
      clone.find('tr.success').css({'background-color' : '#dff0d8'});
      var table_text =  clone .wrap('<p></p>') .parent() .html();
      // this will only work with IE7/8/9
      try {
        window.clipboardData.setData("Text",table_text );
      }
      catch(err){}
    }

    TABLES.build_table = function(options){
      options.classes = options.classes || new Array(options.css.length);
      var table = $(APP.t(table_template)({title:false}));
      var id_base = "r"+_.random(0,1000000);
      table.find('table').removeClass('table-striped');
      if (options.headers){
        _.each(options.headers, function(header_row){
           var row = $('<tr>');
           row.append( _.map(header_row,function(x,index){
             if (!x){
               el = $('<td>')
             } else {
               el = $('<th>')
             }
             return el
              .html(x)
              .css(options.css[index])
              .attr("id",(id_base+x).replace(/\W|_| /g,"")) ;
           }));
           table.find('thead').append( row);
        });
      }
     _.each(options.body, function(data_row){
        var row = $('<tr>');
        row.append( _.map(data_row,function(x,index){
          return $('<td>')
          .html(x)
          .css(options.css[index])
          .addClass(options.classes[index])
          .attr("headers", _.map(options.headers, function(h){
            return id_base+h[index].replace(/\W|_| /g,"")
          }).join(" "));
        }));
        table.find('tbody').append(row);
     });
     return table;
    }

})(this); // end of scope

