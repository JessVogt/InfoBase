$(function () {
  var APP = ns('APP');
  var MAPPERS = ns('MAPPERS');
  var TABLES = ns('TABLES');

  TABLES.AnalyticsView = Backbone.View.extend({
    template : _.template($('#list_t').html())
    ,template2 : _.template($('#analytics_t').html())
    ,row_template : _.template($("#stat_tr").html())
    ,initialize: function () {
      _.bindAll(this);
      this.dept = this.options['dept'];
      this.key = this.options['key'];
      this.row = this.options['row'];

      this.app = this.options['app'];
      this.col_index = this.options['col_index'];
      this.mapper = this.options['mapper'];
      this.def = this.options['def'];

      this.formater = this.app.formater;
      this.val = this.row[this.col_index];
      this.gt = this.app.get_text;
      this.original = this.row.original;
      this.state = this.app.state;
      this.lang = this.state.get('lang');
      this.core_types = ['int','str'];
      this.line_key = _.map(this.def.key,
          function(key){return this.row[key]},
          this
      );
      this.type = this.def['col_defs'][this.col_index];

      this.line_key_types = _.map(this.def.key,
          function(key){
            return this.def.col_defs[key]
          },
          this
      );
      this.types = this.core_types.concat(
      this.line_key_types.concat([this.type]));

      // stitch together the headers
      this.headers = [TABLES.extract_headers(this.def['headers'][this.lang],this.col_index)];
      if  (this.headers[0].length == 2){
        this.core_headers = [
          ["",this.gt("rank")],
          ["", this.gt("org")]]
      } else {
        this.core_headers = [[this.gt("rank")],[this.gt('org')]];
      }
      this.line_key_headers = _.map(this.def.key,
          function(key){
            return TABLES.extract_headers(this.def['headers'][this.lang],key);
          },
          this
      );
      this.combined_headers = _.zip.apply(this,
          this.core_headers.concat(
            this.line_key_headers.concat(
              this.headers)));

      this.ministry_depts = APP.find_all_in_ministry(this.dept,this.lang,this.key);

      // all_lines in the format of 
      // [ [dept,[rows]], [dept,[rows]],...]
      this.all_lines = this.mapper.find_similar(this.original,depts);
      this.all_lines = _.map(this.all_lines,
        function(dept_lines){
          // map each of the lines to a table ready format
          var mapped_lines = this.mapper.map(dept_lines[1]);
          // reduce each line to just the line key + the selected
          // data
          return _.map(mapped_lines,
            function(mapped_line) {
              var line_key = _.map(this.def.key,
                function(key){ return mapped_line[key]});
              var val = mapped_line[this.col_index];
             return [dept_lines[0]].concat(line_key).concat([val]);
            },
            this
          );
        },
        this
      );

      // flatten the lines to the form of [[dept,row],[dept,row],...]
      this.all_lines = _.flatten(this.all_lines,true);

      this.total_num = this.all_lines.length;
      this.sorted_lines = _.sortBy(this.all_lines,
          function(lines){
            return _.last(lines);
          }
      ).reverse();
      this.index = _.indexOf(_.pluck(this.sorted_lines,0),this.dept);
      // summary_lines will be a sparse array, all the null values
      // will be filtered ignored during render
      this.summary_lines = _.map(this.sorted_lines,
        function(val,index,list){
          if (index <= 2 ||
              (index <= Math.round(this.total_num/2)+1 && 
              index >= Math.round(this.total_num/2) -1) ||
              index >= this.total_num-2 || 
              index == this.index) {
               return val
          }
        },
        this
      );
      // extract just the ministry lines
      this.ministry_lines = _.filter(this.sorted_lines,
          function(line){
            return _.indexOf(this.ministry_depts,line[0]) != -1
          },
          this
      );
      this.min_total = _.reduce(this.min_lines,
          function(memo,val){
            return memo + _.last(val);
          },
          0
      );
      this.min_average = this.all_total / this.all_lines.length;

      // sort the lines based on the selected detail
      // calculate some basic stats like total and average
      // when this.type == percentage, the total line 
      // is meaningless
      this.all_total = _.reduce(this.sorted_lines,
          function(memo,line){
            return memo + _.last(line);
          },
          0
      );
      this.all_average = this.all_total / this.all_lines.length;

      this.modal = $("#modal_skeleton");
      this.modal_header = this.modal.find(".modal-header h3");
      this.modal_body = this.modal.find(".modal-body p");
      this.modal_footer = this.modal.find(".modal-footer a");

      this.render(); //self-rendering
    }
    ,create_th : function(header,index,headers){
      var tr = $('<tr>');
      _.each(header,function(h,index){
        var type = this.types[index];
        var div = $('<div>')
          .addClass(type)
          .html(h)
        $('<th>')
          .append(div)
          .appendTo(tr)
      },this);
      return tr;
    }
    ,create_row_from_array : function(row,index,rows){
      if (!row) { return}
      // row is in the format of [dept,[data]]
      var self = this;
      var dept = row[0];
      var dept_name = dept['dept'][this.lang];
      // change row to be the format of 
      // rank,dept_name,line_keys,val
      row = [index+1,dept_name].concat(_.tail(row));
      var tr = $('<tr>');

      if ( dept === this.dept &&
           _.last(row)  === this.val) {
          tr.addClass("info");
       }

      _.each(_.zip(this.types,row),function(type_val,index){

        var type = type_val[0];
        var val = type_val[1];
        var td = $('<td class="'+type+'"><div>');
        var div = td.find('div');
        div.addClass(type);
        if (index === 1){
          div.append("<a href='#' >"+val+"</a>");
        } else {
          if (_.isString(val) && val.length > 80){
            div.attr("title", val);
            div.attr("data-placement", "top");
            div.attr("rel", "tooltip");
            val = val.substring(0,77) + "...";
          }
          val = val || 0;
          val = this.formater(type,val);
          div.html(val);
        }
        tr.append(td);
      },
      this);

      tr.find('a').on("click",
          function(e){
            self.$el.find('a').off("click");
            self.modal.modal("hide"); 
            self.app.state.set("dept",dept);
          }
      );
      return tr;
    }
    ,render : function (){
      this.$el.append(this.template2({gt : this.gt}));
      // clear out the modal
      // the modal should probably be its own view
      this.modal_body.html("");
      this.modal_header.html(this.gt("statistics"));
      this.modal_footer.html(this.gt("close"));
      this.modal_body.append(this.$el);

      this.modal.modal();

      this.$el.find('.btn-group:last button').on("click",
          this.on_button_click);
      this.$el.find('.copy').on("click",
          this.on_copy_click);

      this.$el.find('button.active').trigger("click");
    }
    ,on_copy_click : function(e){
        TABLES.excel_format( this.$el.find('table'));
    }
    ,on_button_click : function(e){
      $(e.target).siblings().removeClass("active");
      $(e.target).addClass("active");

      var button_text = $.trim($(e.target).html()); 
      /// horrible, fix  below
      if (button_text == this.gt('summary_stats')){
        if (this.type === 'percentage'){
          this.display_total = null;
          this.display_average = this.all_average;
        }else {
          this.display_total = this.all_total;
          this.display_average = this.all_average;
        }
        this.render_table(this.summary_lines);
      }else if (button_text == this.gt('ministry_stats')){
        if (this.type === 'percentage'){
          this.display_total = null;
          this.display_average = this.min_average;
        }else {
          this.display_total = this.all_total;
          this.display_average = this.min_average;
        }
        this.render_table(this.ministry_lines);
      }else {
        if (this.type === 'percentage'){
          this.display_total = null;
          this.display_average = this.all_average;
          }else {
          this.display_total = this.all_total;
          this.display_average = this.all_average;
        }
        this.render_table(this.sorted_lines);
      }
    }
    ,create_footer : function(){
      //create an empty array of same size as the header row
      this.footers = [];
      if (this.display_total){
        this.display_total = this.formater(this.type,this.display_total);
        var new_header = _.map(this.combined_headers[0],function(){return ""});
        new_header[new_header.length-2] = "total";
        new_header[new_header.length-1] = this.display_total;
        this.footers.push(new_header);
      }
      if (this.display_average){
        this.display_average = this.formater(this.type, this.display_average);
        new_header = _.map(this.combined_headers[0],function(){return ""});
        new_header[new_header.length-2] = this.gt("sub_avg");
        new_header[new_header.length-1] = this.display_average;
        this.footers.push(new_header);
      }
    }
    ,render_table : function(active_array){
      // empty out current table
      this.$el.find('.table_div').children().remove();
      //create new empty table
      var empty_table = $(this.template({'title' : ""}));
      this.$el.find('.table_div').append(empty_table);

      this.create_footer();
      this.$el.find('thead').append(_.map(this.combined_headers, this.create_th));
      this.$el.find('tbody').append(_.compact(_.map(active_array, this.create_row_from_array)));
      this.$el.find('tfoot').append(_.map(this.footers, this.create_th));

      this.$el.find('table').dataTable({
        "bPaginate" : false,
        "bFilter": false,
        "bInfo" : false,
        "aoColumns" : _.map(this.types, 
          function(type){
           if (type == 'str' || 
               type == 'wide-str' ||
               type == 'date'){
                 type = "string"}
            return {"sType" : type}}
          
          )
      })
      //this.$el.find('tr.info').get(0).scrollIntoView();
    }

  });//end of view

});