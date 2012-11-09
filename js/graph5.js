$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table5"] = BGV.extend({
    template : _.template($("#graph_grid_t").html())
    ,central_votes : false
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
                      id : this.make_id("2")}]},
                     {header : "",
                cols : [{span: 5, 
                      offset: 0,
                      height: 400,
                      id : this.make_id(3)}]}
      ]; 
      // get the names of the frozen allotment types
      this.categories = _.pluck([this.headings[0][1] ,
                                 this.headings[0][2] ,
                                 this.headings[0][3] ,
                                 this.headings[0][4] ,
                                 this.headings[0][5]] , "header");

      // reduce the data down to just the columns 
      // we can use for graphing
      var filtered_data = _.map(this.data,
        function(row){
          return [row[0],row[1],row[2],row[4],row[7],row[10],row[13],row[16]]
        });

      //  group this data by vote number and vote type 
      //  and produce an average
      this.grouped_data = GROUP.group_rows(
           filtered_data,
           function(x){return [x[0]+"-"+x[1]]},
           {func_cols : [3,4,5,6,7],
             txt_cols : {1 : function(g){return g[0][1]},
                         0 : function(g){return g[0][0]}},
            func: GROUP.avg_rows});

      // separate out just the summary average data
      // from grouped_data
      this.summary = _.pluck( this.grouped_data,1);
      this.votes = _.map(this.summary,
          function(row){
            return row[0]+"-"+row[1]}
      );

      this.top_level_pie_data = _.zip(
          this.categories,
          _.tail(_.reduce(this.summary,
            function(x,y){
              return [null,null,null,x[3]+y[3],x[4]+y[4],x[5]+y[5],x[6]+y[6],x[7]+y[7]]
            }),3)
          );
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
      $("#"+id).off("jqplotDataClick");
      GRAPHS.pie(id, [this.top_level_pie_data], 
              { title : this.gt("graph5_title_1")
                ,footnotes : [this.gt("pie_chart_per")]
                ,highlight: true
              })
      $("#"+id).on('jqplotDataClick',this.on_pie_click1); 
      // now trigger a click on the first pie slice
      // to populate the second graph
      $("#"+id).trigger('jqplotDataClick',[0,0,this.top_level_pie_data[0]]);
    }

    ,on_pie_click1 : function(ev, seriesIndex, pointIndex, data){
      // make only the pie chart then set up event listener
      var id = this.make_id(2);
      this.category_text = this.categories[pointIndex];
      this.category_idx = pointIndex;
      var title = this.gt("voted_exp_breakout") + " " + this.category_text;
      // drop any old click handlers
      $("#"+id).off("jqplotDataClick");

      var pie2_data = _.map(this.summary,
            function(row){
               return [row[0]+"-"+row[1],row[pointIndex+3]];
             },this);

      var footnotes = this.footnotes.concat(
        [this.gt("pie_chart_per")]
      );

      GRAPHS.pie(id, [pie2_data], 
              { title : title
                ,footnotes : footnotes
                ,highlight: true
              })
      $("#"+id).on('jqplotDataClick',this.on_pie_click2); 
      // now trigger a click on the first pie slice
      // to populate the second graph
      $("#"+id).trigger('jqplotDataClick',[0,0,pie2_data[0]]);
    }

    ,on_pie_click2 : function(ev, seriesIndex, pointIndex, data){
      // make only the pie chart then set up event listener
      var id = this.make_id(3);
      var vote_title = this.votes[pointIndex];
      var title = this.category_text + " / " + vote_title;
      var bar_data = _.pluck(this.grouped_data[pointIndex][0],this.category_idx + 3);
      var ticks = _.pluck(this.grouped_data[pointIndex][0],2);
      GRAPHS.bar(id, 
          [bar_data],
          {title: title
           ,legend : {show: false}
           ,ticks : ticks 
          });

    }
  })
});
