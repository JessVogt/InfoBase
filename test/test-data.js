(function(){
  var _console = $("#console");

  var types = ['int','wide-str',"str","percentage","big-int"]

  to_console = function(obj){
    _console.append("<p>"+JSON.stringify(obj));
  }

  var app = {
    state : new Backbone.Model({lang: "en",dept:depts.AGR}),
  }

  var APP = ns('APP');
  var UTILS = ns('UTILS');
  var TABLES = ns('TABLES');

  APP.app = new APP.appView();
  APP.app.state.set("lang","en")

  _.each(TABLES.tables, function(table){
      module("test "+ table.id);

      test("assert all cols have data type",function(){
          _.each(table.flat_headers, function(col){
            if (!col.children){
              ok(_.contains(types,col.type));
            }
          });
      });

      test("assert all cols have ids",function(){
        ok(table.keys.length >= 1);
      });

      test("test col_from_nick", function(){
          _.each(table.unique_headers, function(header){
              if (header.substring(0,table.id.length) === table.id){
                ok(!table.col_from_nick(header));
              } else {
                ok(table.col_from_nick(header));
              }
          });
      });


      test("test mapped_data", function(){
        var en_result = depts.AGR.mapped_data("en",table);
        var en_result2 = depts.AGR.mapped_data("en",table);
        var fr_result = depts.AGR.mapped_data("fr",table);
        equal(en_result.length, fr_result.length);
        _.each(en_result, function(row,i){
          _.each(row,function(data,j){
            strictEqual(data, en_result2[i][j]);
          })
        });
      });

      test("test mapped_objs", function(){
        var en_result = depts.AGR.mapped_objs("en",table);
        var en_result2 = depts.AGR.mapped_objs("en",table);
        var fr_result = depts.AGR.mapped_objs("fr",table);
        equal(en_result.length, fr_result.length);
        _.each(en_result, function(row,i){
          _.each(row,function(data,key){
            strictEqual(data, en_result2[i][key]);
          })
        });
      });

      test("test data queries", function(){
         var keys = table.keys;
         var da = TABLES.queries(app,table);

          var bigints = _.chain(table.flat_headers)
            .filter(function(h){
              return h.type === 'big-int' || h.type === 'percentage';
            })
            .map(function(h){
              return h.nick || h.wcag;
            })
            .value();

          var col_vals = da.get_cols(bigints,
            {sorted : true, reverse : true}
          );
          equal(bigints.length, _.keys(col_vals).length);
          _.each(col_vals, function(nums){
            _.each(nums, function(num){
              ok(_.isNumber(num));
            });
          });
          var first = col_vals[_.first(bigints)];
          equal(_.head(first),_.max(first));
          equal(_.last(first),_.min(first));

          var summed_cols = da.get_total(bigints);
          _.each(summed_cols, function(total,key){
            equal(Math.round(total), Math.round(_.reduce(col_vals[key], function(x,y){return x+y})));
          });

          var top3 = da.get_top_x(bigints[0],3);
          deepEqual(top3, _.head(col_vals[bigints[0]],3));

          _.each(da.key_rows(), function(key_row){
             ok(da.get_row_by_key(key_row),key_row);
          },this)

          if (_.contains(['table8','table1','table4'],table.id )) {
            var sub_total_f = function(row){
              return _.isNumber(row['votenum']);
            }
            var sub_total = da.get_subtotals(bigints,sub_total_f);
            _.each(bigints, function(col_name){
              equal(Math.round(sub_total[true][col_name]+sub_total[false][col_name]), Math.round(summed_cols[col_name]))
            })
          }

       });

  });



  //test("test table structures", function(){
  //  TABLES.tables.each(function(table){
  //    var headers =  table.get("headers") ;
  //    var lengths = [];
  //    _.each(headers["en"],function(header_row,i){
  //      if (!_.isString(header_row[0])){
  //        var length_en = 0;
  //        var length_fr = 0;
  //        _.each(header_row,function(header,j){
  //            equal(header.colspan , headers["fr"][i][j].colspan)
  //            length_en += header.colspan;
  //            length_fr += headers["fr"][i][j].colspan;
  //        });
  //        lengths.push(length_fr)
  //        lengths.push(length_en)
  //      }else{
  //        equal(header_row.length , headers["fr"][i].length)
  //        lengths.push(headers["fr"][i].length)
  //        lengths.push(header_row.length)
  //      }
  //      equal(_.uniq(lengths).length,1,"inconsistent number of cols")
  //    });
  //  });
  //});

  //test("test column numbers vs. data columns", function(){
  //  var check_func = {
  //    "int" : function(){ return true},
  //    "big-int" : _.isNumber,
  //    "percentage" : _.isNumber,
  //    "wide-str" : _.isString
  //  }

  //  function each_datum(data,i){
  //    var check =  check_func[this.col_defs[i]](data);
  //    if (check === false){
  //      var msg =  "incorrect data type: " + JSON.stringify(this);
  //    }else{
  //      msg = '';
  //    }
  //    ok(check,msg); 
  //  }

  //  function each_row(mapped_row,i) {
  //    this.mapped_row = mapped_row
  //    this.mapped_row_num = i;
  //    var error =  this.id+" "+this.dept.dept.en;
  //    equal(this.col_defs.length,mapped_row.length,error);
  //    if (this.dept.accronym != 'ZGOC'){
  //      _.each(mapped_row, each_datum,this);
  //    }
  //  }
  //  function each_dept(dept){
  //    this.dept = dept;
  //    app.state.set("dept",dept);
  //    APP.map_depts_data(app);
  //    _.each(dept.mapped_data[this.id]["en"], each_row,this);
  //  }
  //  function each_table(table) {
  //      var col_defs = table.get("col_defs");
  //      var id = table.get("id");
  //      _.each(depts, each_dept,{id:id,col_defs:col_defs});
  //  }
  //  TABLES.tables.each(each_table);
  //});

  //test("g and c sums to standard object 9", function(){
  //  function find_so10(so){
  //    return so[1] == 10;
  //  };
  //  function table7_iterator(row){
  //    return _.last(row);
  //  };
  //  function each_dept(dept){
  //    if (dept.accronym === 'ZGOC') { return};
  //    if (_.has(dept.tables,'table7')){
  //      var so10 = _.last(_.find(dept.tables.table5,find_so10));
  //      var table7_sum = UTILS.sum_ar(dept.tables.table7,table7_iterator);
  //      var diff = so10 - table7_sum;
  //      ok(Math.abs(diff) <= 1);
  //    }
  //  };
  //  _.each(depts,each_dept);
  //});

  //test("test dept data", function(){
  //  function each_dept(dept){
  //    if (dept.accronym === 'ZGOC') { return};
  //    var has_table1 = _.has(dept.tables,"table1");
  //    var has_table2 = _.has(dept.tables,"table2");
  //    equal(has_table1,has_table2);
  //    if (has_table1){
  //      ok(_.has(dept,"qfr_link"))
  //    }
  //    ok(_.has(dept,"min"));
  //    ok(_.has(dept,"mandate"));
  //    ok(_.has(dept,"legal_name"));
  //  };
  //  _.each(depts,each_dept);
  //});

})();
