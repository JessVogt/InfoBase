(function(root) {
  var MAPPERS = ns('MAPPERS');

  var mapper = function(lang,def){
    this.lang = lang;
    this.def = def;
    this.key = def.id;
    this.mapper = def.mapper;
    this.sort = def.sort || _.identity;
    return this;
  }

  mapper.prototype.map = function(row){
    return this.mapper(row.slice());
  };

  MAPPERS.mapper = mapper;
  MAPPERS.maps = {};

})(this);
