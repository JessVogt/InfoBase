$(function () {
  var MAPPERS = ns('MAPPERS');

  var depts = window.depts;

  dup_row = function(row){
    return _.map(row,function(x){return x});};
  
  var mapper = function (lang,def,key){
    this.lang = lang;
    this.def = def;
    this.key = key;
    _.extend(this,_.pick(MAPPERS.maps[this.key],
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

  MAPPERS.mapper = mapper;

});
