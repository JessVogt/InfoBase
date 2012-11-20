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

      this.val = this.row[this.col_index];
      this.gt = this.app.get_text;
      this.original = this.row.original;
      this.state = this.app.state;
      this.lang = this.state.get('lang');
      this.type = this.def['col_defs'][this.col_index];
      this.line_key = _.map(this.def.key,
          function(key){return this.row[key]},
          this
      );

      this.ministry_depts = APP.find_all_in_ministry(this.dept,this.lang,this.key);
      this.headers = TABLES.extract_headers(this.def['headers'][this.lang],this.col_index);

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
             return [dept_lines[0],mapped_line[this.col_index]];
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
            return lines[1];
          }
      ).reverse();
      this.index = _.indexOf(_.pluck(this.sorted_lines,0),this.dept);
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
            return memo + val[1];
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
            return memo + line[1]
          },
          0
      );
      this.all_average = this.all_total / this.all_lines.length;
      // get column headers
      // get GoC average
      // create department links
      // create template

      this.render(); //self-rendering
    }
    ,create_th : function(header,index,headers){
      var thead = this.$el.find('thead');
      var tr = $('<tr>');
      thead.append(tr);

      tr.append("<th>");
      tr.append("<th>");
      tr.append("<th>"+header+"</th>");
    }
    ,create_row_from_array : function(row,index,rows){
      if (!row) { return}
      // row is in the format of [dept,[data]]
      var self = this;
      var this_dept = (row[0] === this.dept &&
          row[1] === this.val) ;
      var dept_name = row[0]['dept'][this.lang];
      var col = row[1];
      if (this.type == 'float') {
          col = $.formatNumber(col, {
            format: "#,##0",
            locale: this.lang
          });
      }
      else if (this.type == 'percentage' ){
          col = col || 0;
          col = $.formatNumber(col, {
            format: "0%",
            locale: this.lang
          });
      }
      var new_row = $(this.row_template({
        index : index+1,
        dept_name : dept_name,
        col : col,
        active_dept : this_dept
      }));
      this.$el.find('tbody').append(new_row);
      new_row.find('a').on("click",
          function(e){
            self.$el.find('a').off("click");
            self.$el.dialog("close");
            self.app.state.set("dept",row[0]);
          }
      );
    }
    ,render : function (){
      this.$el.append(this.template2({gt : this.gt}));
      var buttons = {}
      buttons[this.gt("close")] = function(){ 
            $(this).dialog("close")}; 
      this.$el.dialog({
        autoOpen : true,
        title : this.gt("statistics"),
        closeOnEscape : true,
        buttons : buttons,
        width : 800
      });

      this.$el.find('.btn-group:last button').on("click",
          this.on_button_click);
      this.$el.find('button.active').trigger("click");
    }
    ,on_button_click : function(e){
      var button_text = $.trim($(e.target).html()); 
      if (button_text == this.gt('summary_stats')){
        this.render_table(this.summary_lines);
      }else if (button_text == this.gt('ministry_stats')){
        this.render_table(this.ministry_lines);
      }else {
        this.render_table(this.sorted_lines);
      }
    }
    ,render_table : function(active_array){
      // empty out current table
      this.$el.find('.table_div').children().remove();
      //create new empty table
      var empty_table = $(this.template({'title' : ""}));
      this.$el.find('.table_div').append(empty_table);
      _.each(this.headers, this.create_th);
      _.each(active_array, this.create_row_from_array);
      this.$el.find('table').dataTable({
        "bPaginate" : false,
        "bFilter": false,
        "bSort" : false,
        "bInfo" : false
      })

      this.$el.find('tr.info').get(0).scrollIntoView();
    }

  });//end of view

});
