$(function () {
  var MAPPERS = ns('MAPPERS');
  var APP = ns('APP');
  dup_row = function(row){
    return _.map(row,function(x){return x});};
  
  var mapper = function (lang,def,key){
    this.lang = lang;
    this.def = def;
    this.key = key;
    this._mapper = mappers[this.key];
  }

  mapper.prototype.map = function(rows,key){
  return _.map(rows,
    function(row){
        return this._mapper(dup_row(row));
    },this);
  }
  var mappers = {
    "Table1" : function (row) {
      if (row[1]){
        row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      }
      else {
        row.splice(2,0,'');
      }
      return _.rest(row,1); 
    }
    ,"Table2": function (row) {
      if (this.lang == 'en'){
        row.splice(3,1);
      }
      else{
        row.splice(2,1);
        if (row[1] == '(S)'){row[1] = '(L)'};
      }
      return _.rest(row); 
    }
    ,"Table2a" : function (row) {
      if (this.lang == 'en'){
        row.splice(2,1);
      }
      else{
        row.splice(1,1);
      }
      return _.rest(row); 
    }
    ,"Table2b" : function (row) {
      if (row[1]){
        row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      }
      else {
        row.splice(2,0,'');
      }
      return _.rest(row,1); 
    }
    ,"Table3" : function (row) {
      if (row[1]){
        row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      }
      else {
        row.splice(2,0,'');
      }
      return _.rest(row,1); 
    }
    ,"Table4" : function (row) {
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row;
    }
    ,"Table5" : function (row) {
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row; // take out dept id since don't need anymore AND return row
    }
    ,"Table6" : function (row) {
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row; // take out dept id since don't need anymore AND return row
    }
    ,"Table7" : function (row) {
      if (row[0] == 'S') {
        row[0] = '';
      }
      if (row[1]){
        row[1] = votes[this.def['coverage']][row[1]][this.lang];
      }
      return row; // take out dept id since don't need anymore AND return row
    }
  }

  MAPPERS.mapper = mapper;
});

