$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var BGV = GRAPHS.BaseGraphView;

  GRAPHS.views["Table3"] = BGV.extend({
    prep_data : function(){
      var heading = this.headings[1];
      this.layout = [{header : "",
                cols : [{span: 8, 
                      offset: 0,
                      height: 400,
                      id : this.make_id("1")}]
      }]; 
      this.lookup = _.object(
        _.map(this.data,
          function(row){
            return row[0]+'-'+row[1]
          }
        ),
      _.map(this.data,
              function(row){
                var central_transfers = row[11]+row[12]+row[13]+row[14]+row[15]+row[16];
                return [row[0],
                        row[1],
                        row[6],
                        row[7],
                        row[8],
                        row[9],
                        row[10],
                        central_transfers];
            })
      );

      this.ticks = _.map(this.filtered_data, 
        function(row){
          return row[1];
        });
      this.ticks = [heading[6],
                    heading[7],
                    heading[8],
                    heading[9],
                    heading[10],
                    this.gt("central_vote_transfer")];

    }
    ,render: function () {
      this.$el = $(this.template({
        sidebar_header : this.gt("vote")
        ,items : _.keys(this.lookup).sort()
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
        },
        this
      );
      return this;
    }
    ,graph : function(){
      this.$el.find('.nav-list a:first').trigger('click');
    }
    ,on_vote_selected : function(vote){
      var id = this.make_id(1);
      var raw_data = _.tail(this.lookup[vote],2);

      GRAPHS.bar(id, 
          [raw_data],
          {title: this.gt("approp_by_auth")
           ,legend : {show: false} 
           ,footnotes : this.footnotes
           ,ticks : this.ticks 
          });
    }
  });
})
