$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["TableIS"] = BGV.extend({
    template : _.template($("#graph_grid_t").html())
    ,prep_data : function(){
      this.votes = _.pluck(this.mapped_objs,"Description");
      this.periods = _.map(_.range(1,13).concat([16]), function(x){
        return 'P'+x;
      });

    }
    ,render : function(){
      this.sidebar_header = this.gt('votestat');
      this.$el.append(  $(this.template({
        rows : [{header : "",
                cols : [{span: 6, 
                      offset: 0,
                      height: 400,
                      id : this.make_id(2)}
                       ]}],
        sidebar_header : this.sidebar_header,
        items : [1,2]
      })));

      return this;
    }
    ,graph : function(){


    }
  });

});
