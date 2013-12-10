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
      this.render();
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
      this.gt = this.app.get_text;
      this.da = TABLES.queries(this.app,this.def);
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
          href : "t" + this.org.accronym +"-"+this.def.id
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

    TABLES.prepare_data = function(options){
      var x = dup_header_options = options.dup_header_options,
      rows = options.rows,
      headers = options.headers,

      headers_css = options.headers_css || new Array(headers[0].length),
      row_css = x ? headers_css : options.row_css || new Array(headers[0].length),

      headers_class = options.headers_class || new Array(headers[0].length),
      row_class = x ? headers_class : options.row_class || new Array(headers[0].length),

      header_links = _.map(rows[0],function(){return '';});

      _.each(headers, function(header_row,i){
        _.each(header_row, function(header,j){
          var id =  APP.make_unique();
          header_links[j] += ' ' + id;
           if (i > 0){
             var wcag_headers = _.chain(headers)
               .first(i).pluck(j)
               .map(function(d){ return d.id})
               .value().join(" ");
           } else {
             wcag_headers = '';
           }
           header_row[j] = {
             val : header,
             id : id,
             headers : wcag_headers,
             css : headers_css[j],
             class : headers_class[j]
           };
        });
      });

      _.each(rows, function(row,i){
        _.each(row, function(val,j){
           row[j] = {
             val : val,
             headers : $.trim(header_links[j]),
             css : row_css[j],
             class : row_class[j]
           };
        });
      });
    };

    TABLES.d3_build_table = function(options){
      var table = d3.select(options.node).append("table");
      var data_key_func = options.key_func || function(d,i){return i};

      if (options.table_class){
        table.attr("class",options.table_class);
      }

      if (options.table_css){
        table.style(options.table_css);
      }

      var headers = table.append("thead")
          .selectAll("tr")
          .data(options.headers);
      headers.exit().remove();
      headers
        .enter()
        .append("tr")
        .order();

      var ths = headers
          .selectAll("th")
            .data(Object);
      ths.exit().remove();
      ths
        .enter()
        .append("th")
        .html(function(d){return d.val;})
        .style(function(){ return d.css})
        .attr("id",function(d){return d.id;})
        .attr("headers",function(d){return d.headers;})
        .attr("class",function(d){return d.class;});

      if (options.headerseach){
         headers.each(options.headerseach);
      }

      var rows = table.append("tbody")
          .selectAll("tr")
          .data(options.rows,data_key_func)

      rows.exit().remove();
      rows
        .enter()
        .append("tr")
        .order();
      var tds = rows
          .selectAll("td")
            .data(Object)
      tds.exit().remove();

      tds
        .enter()
        .append("td")
        .html(function(d){return d.val;})
        .attr("headers",function(d){return d.headers;})
        .attr("class",function(d){return d.class;})
        .style(function(){ return d.css});

      if (options.rowseach){
         rows.each(options.rowseach);
      }

      if (options.tdseach){
        tds.each(options.tdseach);
      }

      return table.node();
    }

})(this); // end of scope

