$(function () {
  var GROUP = ns('GROUP');

  GROUP.sum_rows = function(rows,i){
    // this column will be subtotaled
    // check for the data type, floats and ints
    return _.reduce(_.map(rows,
        function (row) {  // map function
          return row[i]
        }),
      function (x, y) {  //reduce function
        return x + y
      }
    );
  }

  GROUP.avg_rows = function(rows,i){
    return GROUP.sum_rows(rows,i) / rows.length;
  }

  GROUP.fnc_on_group = function(group,args){

    var txt_col_i;
    var txt_cols = args['txt_cols'] || [];
    var func_cols = args['func_cols'];
    var func = args['func'];
    var default_txt = args['default_txt'] || "";

    if (_.isEmpty(group)){
      return group
    }
    var cols = _.range(0, group[0].length);

    return  _.map(cols,

      function (col_idx) { // takes a column index
        // first check to see if the col_ids
        // matched the txt_cols, then check to see if 
        // col_idx will be one of the func cols
        // then return the default txt
        if (_.has(txt_cols,col_idx)){
          txt_col_i = txt_cols[col_idx];
          if (_.isFunction(txt_col_i)){
             return txt_col_i(group);
          } else {
             return txt_col_i;
          }
        } else if (_.indexOf(func_cols,col_idx) != -1) {
          return func(group,col_idx);
        } else {
          return  default_txt;
        }
      }
    );
  }

  GROUP.group_rows= function(data, group_func,args) {
    // group the rows
    var groups = _.groupBy(data,group_func );
    return _.map(groups,
        function(group){
            return [group,
                    GROUP.fnc_on_group(group,args)];
        });
  } // end of group_rows

});
