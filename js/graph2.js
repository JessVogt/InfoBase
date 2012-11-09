$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table2"] = BGV.extend({
    template : _.template($("#graph_grid_t").html())
    ,prep_data : function(){
      var heading = this.headings[0];
      this.layout1 = [{header : "",
                cols : [{span: 6, 
                      offset: 2,
                      height: 400,
                      id : this.make_id(1)}
                       ]}]; 
      this.sidebar_header = this.gt('votestat');
      this.layout2 = [{header : "",
                cols : [{span: 6, 
                      offset: 0,
                      height: 400,
                      id : this.make_id(2)}
                       ]}]; 

      // separate out the voted and statutory lines,
      // this has to be handled explicitly since
      // some departments have both voted and stat
      // while others have just voted and others just stat
      //
      // voted
      //
      this.voted_lines = _.filter(this.data,
            function(row){return _.isNumber(row[0])}
          );

      if (!_.isEmpty(this.voted_lines)){
        var voted_total = GROUP.fnc_on_group(
            this.voted_lines,
            {func_cols : [2,3,4,5,6,7],
            func : GROUP.sum_rows});
        this.vs_data = _.map(this.voted_lines,
            function(row){
              return [row[0]+"-"+row[1],row[7]];
            }
        );
      // get these vote labels for the sidebar
      this.sidebar = _.object(_.pluck(this.vs_data,0),
                              this.voted_lines);
      } else {
        this.sidebar = {};
        this.vs_data = [];
      }
      //
      // stat
      //
      this.stat_lines = _.filter(this.data,
            function(row){return !_.isNumber(row[0])}
      );
      if (!_.isEmpty(this.stat_lines)){
        var stat_total = GROUP.fnc_on_group(
            this.stat_lines,
            {func_cols : [2,3,4,5,6,7],
            func : GROUP.sum_rows});
        this.sidebar[this.gt("stat")] = stat_total;
        if (stat_total[7] >= 0) {
          this.vs_data.push(
              [ this.gt("stat"),stat_total[7]]
          );
        }
      }
      this.series = [
      {label : this.gt("gross")},
      {label : this.gt("revenues")}
      ]
      this.ticks = [
       this.gt("authorities"),
        this.gt("expenditures")]

    }
    ,render: function () {
      if (this.vs_data.length > 1){
        this.$el = $(this.template({
          rows : this.layout1,
          sidebar_header : false
        }));
      }
      this.$el.append(  $(this.template({
        rows : this.layout2,
        sidebar_header : this.sidebar_header,
        items : _.pluck(this.vs_data,0)
      })));
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
      var id1 = this.make_id(1);
      var footnotes = this.footnotes.concat(
        [this.gt("pie_chart_per")]
      );

      if (this.vs_data.length > 1){
        GRAPHS.pie(id1,[this.vs_data],
            {title : this.gt("vote_stat")
             ,footnotes : footnotes
            });
      }
      this.$el.find('.nav-list a:first').trigger('click');
    }
    ,on_vote_selected : function(key){
      var id = this.make_id(2);

      var raw_data = this.sidebar[key];
      var data = [
        [raw_data[2],raw_data[5]],
        [-raw_data[3],-raw_data[6]]
      ];
      GRAPHS.bar(id, 
          data,
          {title: this.gt("graph2_title")
           ,series: this.series
           ,ticks : this.ticks 
          });
    }
  });
});

