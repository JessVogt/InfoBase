$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table2a"] = BGV.extend({
    prep_data : function(){
      // grab the first column
      this.pas = this.get_col(this.data,0);
      this.paa_map = {}
      _.each(this.data,
        function(row){
          this.paa_map[row[0]] = row;
        },this);
      // grab the header for the first column
      var headings = this.def['headers'][this.lang];
      this.header = headings[1][0];
      // grab categories for pie chart (make copy with concat)
      this.pie_headings = [].concat(headings[1]).slice(1,6);
      //grab fiscal years
      this.years = _.pluck(_.rest(headings[0]), "header");
    }
    ,render: function () {
      this.$el = $(this.template({
        sidebar_header : this.header,
        items : this.pas,
        rows : [{header : "",
                cols : [{span: 6, 
                      offset: 0,
                      height: 350,
                      id : this.make_id(1)},
                      {span: 6, 
                      offset: 0,
                      height: 350,
                      id : this.make_id(2)} ]}]}
      ));
      var links = this.$el.find('.nav-list a');
      _.each(_.zip(this.pas,links),
        function(header_a){
          var self = this;
          var paa = header_a[0];
          var a = $(header_a[1]);
          a.on("click",function(event){
            links.parent().removeClass('active');
            a.parent().addClass('active');
            self.on_pa_selected(paa);
          });
        },this);
      return this;
    }
    ,graph : function(){
      this.$el.find('.nav-list a:first').trigger('click');
    }
    ,on_pa_selected : function(paa){
      var id1 = this.make_id(1);
      var id2 = this.make_id(2);

      var row =  this.paa_map[paa];
      var pie_data = _.zip(this.pie_headings,
          [row[1],row[2],row[3],row[4],row[5]]);
      // create pie chart
      GRAPHS.pie(this.make_id(1), [pie_data], 
              { title : this.gt("exp_breakout")
                ,footnotes : [this.gt("pie_chart_per")]
              });

      // create year over year chart
      var year_data =  [row[6],row[12],row[18]];

      GRAPHS.bar(this.make_id(2), [year_data], 
        {ticks : this.years
        ,title : this.gt("history_spend")
        ,legend : {show : false}  
        }
      );
    }
  });
});
