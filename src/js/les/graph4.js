$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table4"] = BGV.extend({
    central_votes : false
    ,prep_data : function(){
      // create desired layout
      this.layout = [{header : "",
                cols : [{span: 5, 
                      offset: 0,
                      height: 400,
                      id : this.make_id("1")},
                      {span: 5, 
                      offset: 0,
                      height: 400,
                      id : this.make_id("2")} ]}]; 
      // filter the data down to only the rows of interest 
      // for graphing
      var filtered_data = _.map(this.data,
        function(row){
          return [row[0],row[1],row[2],row[3],row[4],row[13]]
        });
      // for the data in table 4, it should be grouped in
      // summary format for the pie chart
      this.grouped_data = GROUP.group_rows(
           filtered_data,
           function(x){return [x[0],x[1]]},
           {func_cols : [3,4,5],
             txt_cols : {1 : function(g){return g[0][1]},
                         0 : function(g){return g[0][0]}},
            func: GROUP.avg_rows});

      // separate out the summary data
       var summary = _.map(
         this.grouped_data,
         function(group){
           return group[1]
       });
       // separate out the expenditure data
       this.summary_exp = _.map(summary,
         function(_){
           return [_[1],_[4]]})
    }
    ,render: function () {
      this.$el = $(this.template({
        sidebar_header : false
        ,rows : this.layout
      }
      ));
      return this;
    }
    ,graph : function(){
      // make only the pie chart then set up event listener
      var id = this.make_id(1);
      $("#"+id).unbind("jqplotDataClick");

      var footnotes = this.footnotes.concat(
        [this.gt("pie_chart_per")]
      );

      GRAPHS.pie(id, [this.summary_exp], 
              { title : this.gt("expenditure_by_vote")
                ,footnotes : footnotes
                ,highlight : true })
      $("#"+id).bind('jqplotDataClick',this.on_pie_click); 
      // now trigger a click on the first pie slice
      // to populate the second graph
      $("#"+id).trigger('jqplotDataClick',[0,0,this.summary_exp[0]]);
    }
    ,on_pie_click : function(ev, seriesIndex, pointIndex, data){
      var id = this.make_id(2);
      var title = data[0] + " - " + this.gt("net_lapse"); 
      var grouped_data = this.grouped_data[pointIndex][0];
      var ticks = _.pluck(grouped_data,2)
      var graph_data = _.pluck(grouped_data,5);
      GRAPHS.bar(id, 
          [graph_data],
          {title: title
           ,legend : {show: false}
           ,ticks : ticks 
          });
    }
  })
});
