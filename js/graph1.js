$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table1"] = BGV.extend({
    template : _.template($("#graph_grid_t").html())
    ,prep_data : function(){
      this.sidebar_header = this.headings[1][0];
      this.sidebar_items = _.map(this.data,
        function(row){
          return row[0]+" - "+row[1];
        });
      this.layout = [{
            header : "",
            cols : [{span: 4, 
                      height: 350,
                      id : this.make_id(1)},
                      {span: 4, 
                      height: 350,
                      id : this.make_id(2)}]}];
    }
    ,render: function () {
      this.$el = $(this.template({
        rows : this.layout,
        sidebar_header : this.sidebar_header,
        items : this.sidebar_items
      }));
      var links = this.$el.find('.nav-list a');
      _.each(_.zip(_.range(this.sidebar_items.length),links),
        function(vote_a){
          var self = this;
          var vote = vote_a[0];
          var a = $(vote_a[1]);
          a.on("click",function(event){
            links.parent().removeClass('active');
            a.parent().addClass('active');
            self.on_vote_selected(vote);
          });
        },this);

      return this;
    }
    ,graph : function(){
      // trigger event to populate the second graph
      this.$el.find('.nav-list a:first').trigger('click');
    }
    ,on_vote_selected : function(index){
      var id1 = this.make_id(1);
      var id2 = this.make_id(2);

      var row = this.data[index];

      var in_year = [[row[4]],[row[5]]];

      GRAPHS.bar(id1, in_year,
      {series : [ {label:this.headings[1][4]},
                  {label:this.headings[1][5]}
        ]
        ,title: this.gt("lapse_forcast")
        ,ticks : [this.headings[0][1].header]
      });

      var year_over_year = [row[5],row[7],row[9]];
      GRAPHS.bar(id2, [year_over_year], 
        { 
        title: this.gt("lapse_history")
        ,legend : {show: false}
        ,ticks : [ this.headings[0][1].header
                  ,this.headings[0][2].header
                  ,this.headings[0][3].header]
        }
      );
    }
  });

});

