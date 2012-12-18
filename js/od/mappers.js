$(function () {
  var MAPPERS = ns('MAPPERS');
  var APP = ns('APP');


  MAPPERS.maps = {
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
  }

  MAPPERS.mapper = mapper;
});

