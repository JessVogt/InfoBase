$(function () {
  var MAPPERS = ns('MAPPERS');
  var APP = ns('APP');

  var depts = window.depts;

  dup_row = function(row){
    return _.map(row,function(x){return x});};
  
  var mapper = function (lang,def,key){
    this.lang = lang;
    this.def = def;
    this.key = key;
    _.extend(this,_.pick(mappers[this.key],
                        ['to','make_filter','line_key']));
  }

  mapper.prototype.map = function(rows){
  return _.map(rows,
    function(row){
      var mapped_row = this['to'](dup_row(row));
      mapped_row.original = row;
      return mapped_row;
    },this);
  }
  mapper.prototype.find_similar = function(row,depts){
    // map the departments to filter down to just the relevant
    // lines for each dept
    var filter = this.make_filter(row);
    var relevant_depts = _.map(depts,
        function(dept){
          if (_.has(dept.tables, this.key)){
            return [dept,
                  _.filter(dept.tables[this.key],filter)];
          }
        },
        this
    );
    return _.filter(relevant_depts,
        function(dept_lines){
          if (!_.isUndefined(dept_lines)){
            return dept_lines[1].length > 0
          }
        });
  }

  function make_historical_filter(source_row){
    var vote_type = source_row[1];
    var year = source_row[2];
    return function(candidate_row){
      return (candidate_row[1] == vote_type &&
              candidate_row[2] == year);
    }
  }


  var mappers = {
    "Table1" : {'to' : function (row) {
        if (row[1]){
          row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
        }
        else {
          row.splice(2,0,'');
        }
        // chop of deptcode
        return _.rest(row,1); 
      },
    'line_key' : function(mapped_row){
      return [mapped_row[1]];
    }
    ,'make_filter' : function(source_row){
      var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
      return _.bind(function(candidate_row){
        var cr = candidate_row;
        if (cr[1]){
          var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
          return ( type == cr_type);
        }
        return false;
      },this);
    }}
    ,"Table2": {'to' : function (row) {
      if (this.lang == 'en'){
        row.splice(3,1);
      }
      else{
        row.splice(2,1);
        if (row[1] == '(S)'){row[1] = '(L)'};
      }
      return _.rest(row); 
    },
    'make_filter' : function(source_row){
      if (_.isNumber(source_row[1])){
        var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
        return _.bind(function(candidate_row){
          var cr = candidate_row;
          if (cr[1] && _.isNumber(cr[1])){
            var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
            return ( type == cr_type);
          }
          return false;
        },this);
      }else {
        return _.bind(function(candidate_row){
           return candidate_row[2] == source_row[2];
        },this);
      }
    }}
    ,"Table2a" : {'to' : function (row) {
      if (this.lang == 'en'){
        row.splice(2,1);
      }
      else{
        row.splice(1,1);
      }
      return _.rest(row); 
    },
    'make_filter' : function(row){
      if (row[1] === 'Internal Services'){
        return function(candidate_row){ 
          return candidate_row[1] == 'Internal Services'
        }
      }else {
        return function(candidate_row){
          return (candidate_row[1] != 'Internal Services' &&
                  candidate_row[0] != 'ZGOC');
        }
      }
    }
    }
    ,"Table2b" : {'to' : function (row) {
      if (row[1]){
        row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      }
      else {
        row.splice(2,0,'');
      }
      return _.rest(row,1); 
    }
    ,'make_filter' : function(source_row){
      var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
      return _.bind(function(candidate_row){
        var cr = candidate_row;
        if (cr[1]){
          var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
          return ( type == cr_type);
        }
        return false;
      },this);
    }}
    ,"Table3" : {'to' : function (row) {
      if (row[1]){
        row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      }
      else {
        row.splice(2,0,'');
      }
      return _.rest(row,1); 
    }
    ,'make_filter' : function(source_row){
      var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
      return _.bind(function(candidate_row){
        var cr = candidate_row;
        if (cr[1]){
          var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
          return ( type == cr_type);
        }
        return false;
      },this);
    }}
    ,"Table4" : {'to' : function (row) {
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row;
    },
    'make_filter' : make_historical_filter
    }
    ,"Table5" : {'to' : function (row) {
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row; // take out dept id since don't need anymore AND return row
    },
    'make_filter' : make_historical_filter
    }
    ,"Table6" : {'to' : function (row) {
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row; // take out dept id since don't need anymore AND return row
    },
    'make_filter' : make_historical_filter
    }
    ,"Table7" : {'to' : function (row) {
      if (row[0] == 'S') {
        row[0] = '';
      }
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row; // take out dept id since don't need anymore AND return row
    },
    'make_filter' : make_historical_filter
    }
  }

  MAPPERS.mapper = mapper;
});

