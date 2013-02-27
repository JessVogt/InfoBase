$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["TableIS"] = BGV.extend({
    template : _.template($("#graph_grid_t").html())
    ,prep_data : function(){
    }
    ,render : function(){

    }
  }

  });
