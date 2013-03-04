$(function () {
  var GROUP = ns('GROUP');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');
  var U = ns('UTILS');
  var BGV = GRAPHS.BaseGraphView;


  GRAPHS.views["Table7"] = BGV.extend({
    footnote_keys : ['graph7_footnote']
    ,prep_data : function(){

      this.footnotes = this.footnotes.concat(
        [this.gt("pie_chart_per")]
      );               

      this.layout1 = [{header : "",
                cols : [{span: 6, 
                      offset: 2,
                      height: 400,
                      id : this.make_id(1)}
                       ]}]; 
      this.sidebar_header = this.gt('so');
      this.layout2 = [{header : "",
                cols : [{span: 6, 
                      offset: 0,
                      height: 400,
                      id : this.make_id(2)}
                       ]}]; 

      var h1 = this.headings[0];
      this.sos = h1.slice(3,15);

      var filtered_data = _.map(this.data,
        function(row){
          return _.head(row,15)
        });

      this.grouped_data = GROUP.group_rows(
           filtered_data,
           function(x){return [x[0],x[1]]},
           {func_cols : [3,4,5,6,7,8,9,10,11,12,13,14],
             txt_cols : {1 : function(g){return g[0][1]},
                         0 : function(g){return g[0][0]}},
            func: GROUP.avg_rows});

      this.summary = _.pluck( this.grouped_data,1);

      this.top_summary =  GROUP.fnc_on_group(
           filtered_data,
           {func_cols : [3,4,5,6,7,8,9,10,11,12,13,14],
            func: GROUP.sum_rows});
      this.major_sos = this.collapse_to_major_sos(this.top_summary);

      this.sidebar_items = _.map(this.summary,
          function(row){
            if (row[0] != ""){
              return row[0]+" - "+row[1];
            }
            return row[1];
          });

      this.major_sos_by_vote = _.map(this.summary,this.collapse_to_major_sos);

    }
    ,collapse_to_major_sos : function(row){
      var obj_row = U.to_obj(["","",""].concat(this.sos),row);
      var total = U.sum_ar(_.values(row));
      var included = _.filter(row,function(x){return x/total > 0.05})
      obj_row = U.filter_obj_by_vals(obj_row, included);
      var excluded = _.difference(row,included)
      var excluded_sum = U.sum_ar(excluded)
      obj_row[this.gt("other")] = excluded_sum;
      return U.zip_obj(obj_row);
    }
    ,render: function () {
      this.$el.append(  $(this.template({
        rows : this.layout1,
        sidebar_header : false
      })));

      // where there is only one vote, there's no need
      // to have the option for drilling down
      if (this.sidebar_items.length > 1) {
        this.$el.append(  $(this.template({
          rows : this.layout2,
          sidebar_header : this.sidebar_header,
          items : this.sidebar_items
        })));
        var links = this.$el.find('.nav-list a');
        _.each(_.zip(_.range(this.sidebar_items.length),links),
          function(header_a){
            var self = this;
            var vote = header_a[0];
            var a = $(header_a[1]);
            // add href to jump ensure the 
            // page jumps to the graph div
            a.attr("href",'#'+this.make_id(2));
            a.on("click",function(event){
              links.parent().removeClass('active');
              a.parent().addClass('active');
              self.on_vote_selected(vote);
            });
          },this);
      }

      return this;
    }
    ,graph : function(){
      // trigger event to populate the second graph
      this.$el.find('.nav-list a:first').trigger('click');
      var pie_id = this.make_id(1)
      GRAPHS.pie(pie_id, [this.major_sos], 
            { title : this.gt("graph7_title_1")
             ,footnotes : this.footnotes
            }
      );
    }
    ,on_vote_selected : function(index){
      var pie_id = this.make_id(2)
      var pie_data = this.major_sos_by_vote[index];
      var historical = this.grouped_data[index];
      var footnotes = 

      GRAPHS.pie(pie_id, [pie_data], 
            { title : this.gt("graph7_title_2")
             ,footnotes : this.footnotes
            });
    }
  });

});

