$(function () {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  /***********TBL 1 VIEW************/
  table1 = {
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
  };
  /***********TBL 2 VIEW************/
  table2 = {
    sum_cols: _.range(2, 8),
    render: function () {
      this.make_headers();
      this.make_body();
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
    },
    make_graphs: function () {
      //returns data vote vs. stat items data for net expenditures column, to be used in pie chart
      var data1 = [
        ['Vote Total', this.vote_footer[7]],
        ['Stat Total', this.stat_footer[7]]
      ];
      new pieView({
        pie_data: data1,
        id: 'stat_vote_net_exp',
        title: 'Stat vs. Vote Items',
        tab_id: this.tab_id
      });
      var data2 = _.map(this.lo_vote, function (vote_row) {
        return [vote_row[1], vote_row[7]]
      });
      new pieView({
        pie_data: data2,
        id: 'vote_net_exp',
        title: 'Vote Net Expenditures',
        tab_id: this.tab_id
      });
    }
  };
  /***********TBL 2A VIEW************/
  table2a = {
    sum_cols: _.range(1, 19),
    hide_col_ids : [7,8,9,10,11,13,14,15,16,17],
    render: function () {
      this.make_headers();
      this.make_body();
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
    //make_graphs: function () {
    //  var names = this.get_columns(this.row_data, 0);
    //  var totals = this.get_columns(this.row_data, 6);
    //  var zip_name_tot = _.zip(names, totals);
    //  var reversed_data = _.sortBy(zip_name_tot, function (pair) {
    //    return pair[1]
    //  });
    //  var ordered_data = reversed_data.reverse();
    //  var top_data = ordered_data.slice(0, 4);
    //  var other_sum = this.sum_column(_.map(ordered_data.slice(4), function (pair) {
    //    return Math.abs(pair[1])
    //  }))
    //  top_data.push(['Other', other_sum]);
    //  //returns top 4 and other data for latest year column, to be used in pie chart
    //  new pieView({
    //    pie_data: top_data,
    //    id: 'program_activity',
    //    title: 'Program Activity Total',
    //    tab_id: this.tab_id
    //  })
    //},
    ////not being displayed
    //pie_vote_net_exp: function () {
    //  var data = _.map(this.lo_vote, function (vote_row) {
    //    return [vote_row[1], vote_row[7]]
    //  });
    //  new pieView({
    //    pie_data: data,
    //    id: 'vote_net_exp',
    //    title: 'Vote Net Expenditures',
    //    tab_id: this.tab_id
    //  })
    //}
  };
  /***********TBL 2B VIEW************/
  table2b = {
    sum_col_ids: _.range(2, 7),
    render: function () {
      return this;
    },
    mapper: function (row) {
      //input text of vote descripton
      return row; // take out dept id since don't need anymore AND return row
    }
  };
  /***********TBL 3 VIEW************/
  table3 = {
    hide_col_ids: [3,4,5,11,12,13,14,15,16,17],
    sum_cols: _.range(2, 18),
    render: function () {
      this.make_headers();
      this.make_body();
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
  };
  /***********TBL 4 VIEW************/
  table4 = {
    hide_col_ids: [3,4,5,10,11,12],
    sum_cols: _.range(3, 15),
    render: function () {
      this.make_headers();
      this.make_body();
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
  };
  /***********TBL 5 VIEW************/
  table5 = {
    hide_col_ids: [3,4,6,7,9,10,12,13,15,16],
    sum_cols: _.range(3, 21),
    render: function () {
      //caclulate and create listof footers: votes subtotal, stat subtotal, grand total
      this.make_headers();
      this.make_body();
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
  };
  /***********TBL 6 VIEW************/
  table6 = {
    hide_col_ids: [3,5,6,8,9,11],
    sum_cols: _.range(3, 15),
    render: function () {
      this.make_headers();
      this.make_body();
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
  };
  /***********TBL 7 VIEW************/
  table7 = {
    hide_col_ids: [4,5,6,7,8,9,10,,11,13,14],
    sum_cols: _.range(3, 19),
    render: function () {
      this.make_headers();
      this.make_body();
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
  };
  /***********OBJ OF TBL VIEWS************/
  TABLES.views = {
    Table1: BaseTableView.extend(table1),
    Table2: BaseTableView.extend(table2),
    Table2a: BaseTableView.extend(table2a),
    Table2b: BaseTableView.extend(table2b),
    Table3: BaseTableView.extend(table3),
    Table4: BaseTableView.extend(table4),
    Table5: BaseTableView.extend(table5),
    Table6: BaseTableView.extend(table6),
    Table7: BaseTableView.extend(table7)
  }
  APP.app.acv.updater('Agriculture and Agri-Food');
});
