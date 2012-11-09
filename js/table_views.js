$(function () {
  var TABLES = ns('TABLES');
  var GROUP = ns('GROUP');
  var APP = ns('APP');
  var BTV = TABLES.BaseTableView;

  TABLES.views = {

  "Table1" : BTV.extend({
     sum_cols: [2,3,4,5,7,9]

     ,init_row_data: function () {

       var txt = this.gt("total");




       this.merge_group_results(
         [[this.row_data,
         GROUP.fnc_on_group(
           this.row_data,
           {txt_cols : {0 : txt},
            func_cols : this.sum_cols,
            func : GROUP.sum_rows})]]);
       this.add_ministry_sum();
    }
  })

  ,"Table2" : BTV.extend({

     sum_cols: _.range(2, 8)

     ,init_row_data: function () {

       var total =   GROUP.fnc_on_group(
           this.row_data,
           {txt_cols : {0 : this.gt("total")},
            func_cols : this.sum_cols,
            func : GROUP.sum_rows});
       var self = this;
       this.merge_group_results(
         GROUP.group_rows(
           this.row_data,
           function(row){ return _.isString(row[0])},
           {txt_cols : {0 : this.gt("sub_total"),
                         1 : function(g){
                           var row = _.first(g);
                           return _.isString(row[0]) ? self.gt("stat") : self.gt('vote') }},
            func_cols : this.sum_cols,
            func : GROUP.sum_rows}));
        this.merge_group_results([[this.row_data,total]]);
       this.add_ministry_sum();
    }
  })

  ,"Table2a" : BTV.extend({
     
     sum_cols: _.range(1, 19)

     ,hide_col_ids : [7,8,9,10,11,13,14,15,16,17]

     ,init_row_data: function () {

       var txt = this.gt("total");
       this.merge_group_results(
         [[this.row_data,
         GROUP.fnc_on_group(
           this.row_data,
           {txt_cols : {0 : txt},
            func_cols : this.sum_cols,
            func : GROUP.sum_rows})]]);
       this.add_ministry_sum();
     }
  })

  ,"Table2b" : BTV.extend({ 
     sum_cols: [2,3, 5,6] 
     ,hide_col_ids : []
     ,init_row_data: function () {

       var txt = this.gt("total");
       this.merge_group_results(
         [[this.row_data,
         GROUP.fnc_on_group(
           this.row_data,
           {txt_cols : {0 : txt},
            func_cols : this.sum_cols,
            func : GROUP.sum_rows})]]);
       this.add_ministry_sum();
     }
  })

  ,"Table3" : BTV.extend({ 
     hide_col_ids: [3,4,6,11,12,13,14,15,16,17]
     ,sum_cols: _.range(2, 19)
     ,init_row_data: function () {

       var txt = this.gt("total");
       this.merge_group_results(
         [[this.row_data,
         GROUP.fnc_on_group(
           this.row_data,
           {txt_cols : {0 : txt},
            func_cols : this.sum_cols,
            func : GROUP.sum_rows})]]);
       this.add_ministry_sum();
     }
  })

  ,"Table4" : BTV.extend({ 
     hide_col_ids: [6,7,10,11,12]
     ,sum_cols: [3,4,5,6,7,8,10,11,12,13,14]
     ,init_row_data: function () {

       var txt = this.gt("sub_avg");

       var totals = GROUP.group_rows(
           this.row_data,
           function(row){ return row[2]},
           {txt_cols : {0 : this.gt('year_total'),
                        2 : function(g){return _.first(g)[2]} },
            func_cols : this.sum_cols,
            func : GROUP.sum_rows});

       this.merge_group_results(
         GROUP.group_rows(
           this.row_data,
           function(row){ return [row[0],row[1]]},
           {txt_cols : {0 : txt,
                        1 : function(g){return _.first(g)[1]} },
            func_cols : this.sum_cols,
            func : GROUP.avg_rows}));

       totals = _.map(totals,function(total){
         this.summary_rows.push(total[1]);
         return total[1]
       },this);
       this.row_data = this.row_data.concat(totals);

       this.add_ministry_year_sums();
     }
  })

  ,"Table5" : BTV.extend({ 
     hide_col_ids: [3,4,6,7,9,10,12,13,15,16]
     ,sum_cols: _.range(3, 21)
     ,init_row_data: function () {
       
       var txt = this.gt("sub_avg");
       var totals = GROUP.group_rows(
           this.row_data,
           function(row){ return row[2]},
           {txt_cols : {0 : this.gt('year_total'),
                        2 : function(g){return _.first(g)[2]} },
            func_cols : this.sum_cols,
            func : GROUP.sum_rows});
       this.merge_group_results(
         GROUP.group_rows(
           this.row_data,
           function(row){ return [row[0],row[1]]},
           {txt_cols : {0 : txt,
                        1 : function(g){return _.first(g)[1]} },
            func_cols : this.sum_cols,
            func : GROUP.avg_rows}));
       totals = _.map(totals,function(total){
         this.summary_rows.push(total[1]);
         return total[1]
       },this);
       this.row_data = this.row_data.concat(totals);
       this.add_ministry_year_sums();
     }
  })

  ,"Table6" : BTV.extend({ 
     hide_col_ids: [3,5,6,8,9,11]
     ,sum_cols: _.range(3, 15)
     ,init_row_data: function () {

       var txt = this.gt("sub_avg");
       var totals = GROUP.group_rows(
           this.row_data,
           function(row){ return row[2]},
           {txt_cols : {0 : this.gt('year_total'),
                        2 : function(g){return _.first(g)[2]} },
            func_cols : this.sum_cols,
            func : GROUP.sum_rows});
       this.merge_group_results(
         GROUP.group_rows(
           this.row_data,
           function(row){ return [row[0],row[1]]},
           {txt_cols : {0 : txt,
                        1 : function(g){return _.first(g)[1]} },
            func_cols : this.sum_cols,
            func : GROUP.avg_rows}));
       totals = _.map(totals,function(total){
         this.summary_rows.push(total[1]);
         return total[1]
       },this);
       this.row_data = this.row_data.concat(totals);
       this.add_ministry_year_sums();

     }
  })

  ,"Table7" : BTV.extend({ 
      hide_col_ids: [4,5,6,7,8,9,10,,11,13,14]
      ,sum_cols: _.range(3, 19)
      ,init_row_data: function () {
         var txt = this.gt("sub_avg");
         var totals = GROUP.group_rows(
             this.row_data,
             function(row){ return row[2]},
             {txt_cols : {0 : this.gt('year_total'),
                          2 : function(g){return _.first(g)[2]} },
              func_cols : this.sum_cols,
              func : GROUP.sum_rows});
         // not sure why this is here
         _.each(totals,
           function(row){

           },
           this);
         this.merge_group_results(
           GROUP.group_rows(
             this.row_data,
             function(row){ return [row[0],row[1]]},
             {txt_cols : {0 : txt,
                          1 : function(g){return _.first(g)[1]} },
              func_cols : this.sum_cols,
              func : GROUP.avg_rows}));
         totals = _.map(totals,function(total){
           this.summary_rows.push(total[1]);
           return total[1]
         },this);
         this.row_data = this.row_data.concat(totals);
         this.add_ministry_year_sums();
      }
  })
  };
});
