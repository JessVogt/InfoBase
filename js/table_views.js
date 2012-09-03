$(function () {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var BTV = TABLES.BaseTableView;
  TABLES.views = {

  "Table1" : BTV.extend({
    sum_col_ids: _.range(2, 11),
    render: function () {
      return this;
    },
    mapper: function (row) {
      //input text of vote descripton
      var vote_desc_id = in_year_vote[this.options['dept_id'] + ":" + row[0]]; //get id
      var vote_text = vote_type_inyear[vote_desc_id][APP.app.state.get('lang')]; //use id to get text
      row.splice(1, 0, vote_text); // make 2nd column appropriate vote name (text)
      return row;
    }
  })
  ,"Table2" : BTV.extend({
    sum_cols: _.range(2, 8),
  
    render: function () {
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      return _.rest(row,1); 
    },
    init_row_data: function () {
      var txt = this.gt("total");
      this.perform_fnc_on_group(this.row_data,txt,this.add_rows,this.sum_cols);
    }
  })
  ,"Table2a" : BTV.extend({
    sum_cols: _.range(1, 19),
    hide_col_ids : [7,8,9,10,11,13,14,15,16,17],
    render: function () {
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      if (this.lang == 'en'){
        row.splice(2,1);
      }
      else{
        row.splice(1,1);
      }
      return _.rest(row); 
    },
    init_row_data: function () {
      var txt = this.gt("total");
      this.perform_fnc_on_group(this.row_data,txt,this.add_rows,this.sum_cols);
    }
  })
  ,"Table2b" : BTV.extend({ 
    sum_col_ids: _.range(2, 7),
    render: function () {
      return this;
    },
    mapper: function (row) {
      //input text of vote descripton
      return row; // take out dept id since don't need anymore AND return row
    }
  })
  ,"Table3" : BTV.extend({ 
    hide_col_ids: [3,4,5,11,12,13,14,15,16,17],
    sum_cols: _.range(2, 18),
    render: function () {
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      return _.rest(row,1); 
    },
    init_row_data: function () {
      var txt = this.gt("total");
      this.perform_fnc_on_group(this.row_data,txt,
          this.add_rows,
          this.sum_cols);
    }
  })
  ,"Table4" : BTV.extend({ 
    hide_col_ids: [3,4,5,10,11,12],
    sum_cols: _.range(3, 15),
    render: function () {
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      row[1] = votes[this.def['coverage']][row[1]][this.lang];
      return row;
    },
    init_row_data: function () {
      var txt = this.gt("sub_avg");
      this.group_rows( function(row){
        return [row[0],row[1]]},
        this.avg_rows,
        txt);
    }
  })
  ,"Table5" : BTV.extend({ 
    hide_col_ids: [3,4,6,7,9,10,12,13,15,16],
    sum_cols: _.range(3, 21),
    render: function () {
      //caclulate and create listof footers: votes subtotal, stat subtotal, grand total
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      row[1] = votes[this.def['coverage']][row[1]][this.lang];
      return row; // take out dept id since don't need anymore AND return row
    },
    init_row_data: function () {
      var txt = this.gt("sub_avg");
      this.group_rows( function(row){
        return [row[0],row[1]]},
        this.avg_rows,
        txt);
    }
  })
  ,"Table6" : BTV.extend({ 
    hide_col_ids: [3,5,6,8,9,11],
    sum_cols: _.range(3, 15),
    render: function () {
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      row[1] = votes[this.def['coverage']][row[1]][this.lang];
      return row; // take out dept id since don't need anymore AND return row
    },
    init_row_data: function () {
      var txt = this.gt("sub_avg");
      this.group_rows( function(row){
        return [row[0],row[1]]},
        this.avg_rows,
        txt);
    }
  })
  ,"Table7" : BTV.extend({ 
    hide_col_ids: [4,5,6,7,8,9,10,,11,13,14],
    sum_cols: _.range(3, 19),
    render: function () {
      this.make_headers();
      this.make_body();
      this.make_footers();
      this.activate_dataTable();
      return this;
    },
    mapper: function (row) {
      if (row[0] == '(S)') row[0] = '';
      row[1] = votes[this.def['coverage']][row[1]][this.lang];
      return row; // take out dept id since don't need anymore AND return row
    },
    init_row_data: function () {
      var txt = this.gt("sub_avg");
      this.group_rows( function(row){
        return [row[0],row[1]]},
        this.avg_rows,
        txt);
    }
  })};
});
