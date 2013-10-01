(function(){
  var _console = $("#console");

  var types = ['int','wide-str',"str","percentage","big-int"]

  to_console = function(obj){
    _console.append("<p>"+JSON.stringify(obj));
  }

  var app = {
    state : new Backbone.Model({lang: "en"})
  }

  var APP = ns('APP');
  var UTILS = ns('UTILS');
  var TABLES = ns('TABLES');

  APP.app = new APP.appView();
  APP.app.state.set("lang","en")

  module("test data");

  test("assert all have data type",function(){
    _.each(TABLES.tables, function(table){
      _.each(table._flat_cols, function(col){
         if (!col.children){
           ok(_.contains(types,col.type));
         }
      });
    });
  });

  test("test col_from_nick", function(){
    _.each(TABLES.tables, function(table){
      _.each(table.unique_headers, function(header){
          if (header.substring(0,table.id.length) === table.id){
            ok(!table.col_from_nick(header));
          } else {
            ok(table.col_from_nick(header));
          }
      });
    });
  });

  test("test mapped_data", function(){
    var table = ns().TABLES.tables[0];
    var en_result = depts.AGR.mapped_data("en",table);
    var en_result2 = depts.AGR.mapped_data("en",table);
    var fr_result = depts.AGR.mapped_data("fr",table);
    equal(en_result.length, fr_result.length);
    _.each(en_result, function(row,i){
      _.each(row,function(data,j){
        strictEqual(data, en_result2[i][j]);
      })
    });
    strictEqual(en_result[0][1], depts.AGR.tables.table1[0][3]);
    strictEqual(fr_result[0][1],  depts.AGR.tables.table1[0][4]);
  });

  test("test mapped_objs", function(){
    var table = ns().TABLES.tables[0];
    var en_result = depts.AGR.mapped_objs("en",table);
    var en_result2 = depts.AGR.mapped_objs("en",table);
    var fr_result = depts.AGR.mapped_objs("fr",table);
    equal(en_result.length, fr_result.length);
    _.each(en_result, function(row,i){
      _.each(row,function(data,key){
        strictEqual(data, en_result2[i][key]);
      })
    });
    strictEqual(en_result[0]["table1Description"], depts.AGR.tables.table1[0][3]);
    strictEqual(fr_result[0]["table1Description"], depts.AGR.tables.table1[0][4]);
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
