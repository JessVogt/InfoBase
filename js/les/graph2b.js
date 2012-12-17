$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table2b"] = BGV.extend({
    template : _.template($("#graph_grid_t").html())
    ,prep_data : function(){
      var h0 = this.headings[0];
      var h1 = this.headings[1];

      this.layout = [{header : "",
                cols : [{span: 6, 
                      offset: 0,
                      height: 400,
                      id : this.make_id("1")}
                       ]}]; 
      this.ticks = _.map(this.data,
        function (row) {
          return  row[1];
        });

      this.series = [{label: h1[2]},
                     {label: h1[3]}];

      this.ticks = [h0[1].header,h0[2].header];

      this.lookup = _.object(
           _.map(this.data,
                  function(row){
                    return row[0]+"-"+row[1];
                  }),
           this.data
      );
    }
    ,render: function () {
      this.$el = $(this.template({
        sidebar_header : this.gt("vote")
        ,items: _.keys(this.lookup)
        ,rows : this.layout
      }
      ));
      var links = this.$el.find('.nav-list a');
      _.each(links,
        function(a){
          a = $(a);
          var self = this;
          var key = a.html();
          // add href to jump ensure the 
          // page jumps to the graph div
          a.attr("href",'#'+this.make_id(2));
          a.on("click",function(event){
            links.parent().removeClass('active');
            a.parent().addClass('active');
            self.on_vote_selected(key);
          });
        },this
      );

      return this;
    }
    ,graph : function(){
      this.$el.find('.nav-list a:first').trigger('click');
    }
    ,on_vote_selected : function(vote){
      var id1 = this.make_id(1);
      var raw_data = this.lookup[vote];
      var data = [
        [raw_data[2],raw_data[5]],
        [raw_data[3],raw_data[6]]
      ];
      // remake graphs
      GRAPHS.bar(id1, 
          data,
          {title:this.gt("graph2b_title")
            ,stackSeries : false
           ,footnotes : this.footnotes
           ,series: this.series
           ,ticks : this.ticks 
          });
    }
  });
});
