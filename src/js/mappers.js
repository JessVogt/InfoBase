(function(root) {
  var MAPPERS = ns('MAPPERS');

  var mapper = function(lang,def){
    this.lang = lang;
    this.def = def;
    this.key = def.id;
    _.extend(this,_.pick(def.mapper,
                        ['to',
                        'make_filter',
                        "sort",
                        'line_key']));
    this.sort = this.sort || _.identity;
    return this;
  }

  mapper.prototype.map = function(row){
    return this.to(row.slice());
  };

  mapper.prototype.find_similar = function(row,depts){
    // map the departments to filter down to just the relevant
    // lines for each dept
    var filter = this.make_filter(row);
    var relevant_depts = _.map(depts,
        function(dept){
          if (dept.accronym == 'ZGOC'){
            return
          }
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
  MAPPERS.maps = {}

})(this);
