(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var BAR = ns('D3.BAR');
  var LINE = ns('D3.LINE');
  var D3 = ns('D3');

 APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
    "id": "table4",
     "csv_url" : "../InfoBase/data/table4.csv",
    "coverage": TABLES.coverage.historical,
    "data_type" :TABLES.data_types.financial,
    "add_cols": function(){
       this.add_col("")
       .add_child([
         {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "dept",
          "header":''
         },
         {
          "type":"int",
          "key" : true,
          "nick" : "votenum",
          "header":{
            "en":"Vote {{last_year}} / Statutory",
            "fr":"Crédit {{last_year}} / Légis."
          }
         },
         {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "votestattype",
          "header":''
         },
         {
          "type":"wide-str",
          "key" : true,
          "nick" : "desc",
          "header":{
             "en":"Description",
             "fr":"Description"
          }
         }
       ]);
       _.each(years, function(header){
             this.add_col(header)
               .add_child([
                   {
                    "type": "big-int",
                    "nick": header + "auth",
                    "header": {
                        "en": "Total budgetary authority available for use",
                        "fr": "Autorisations budgétaires disponibles pour l'emploi"
                    },
                    "description": {
                        "en": "Corresponds to the authorities provided by Parliament, including transfers from other organizations or adjustments that are made during the year.",
                        "fr": "Correspondent aux autorisations accordées par le Parlement, y compris les transferts provenant d’autres organisations ou les rajustements qui ont été effectués au cours de l’exercice."
                    }
                   },{
                    "type": "big-int",
                    "nick": header + "exp",
                    "header": {
                        "en": "Expenditures",
                        "fr": "Dépenses"
                    },
                    "description": {
                        "en": "Corresponds to the funds spent against these authorities.",
                        "fr": "Correspondent aux dépenses effectuées aux termes de ces autorisations."
                    }
                   }
               ]);
       },this);
    },
    "link": {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
    },
    "name": { "en": "Authorities and Expenditures",
        "fr": "Autorisations et dépenses"
    },
    "title": { "en": "Authorities and Actual Expenditures ($000)",
        "fr": "Autorisations et dépenses réelles (en milliers de dollars)"
    },
    "queries" : {
       "exp_auth_by_year" : function(year,format){
          format =  format === undefined ? false : true;
          var vals = this.sum([year+'auth',year+'exp'],{format: format});
          return [m(year),vals[year+'auth'],vals[year+'exp']];
       },
       "voted_items" : function(cut_off){
         this.vote_stat_query =  vote_stat_query;
         return this.vote_stat_query("voted",cut_off);
       },
       "stat_items" : function(cut_off){
         this.vote_stat_query =  vote_stat_query;
         return this.vote_stat_query("stat",cut_off);
       }
    },
    "dimensions" : {
       "include_in_analytics" : ["voted_stat"],
       "horizontal" : TABLES.major_vote_stat,
       "voted_stat" : TABLES.vote_stat_dimension
    },
    "sort": function (mapped_rows, lang) {
        var grps = _.groupBy(mapped_rows, function (row) { return _.isNumber(row[0]);});
        if (_.has(grps, true)) {
            grps[true] = _.sortBy(grps[true], function (row) { return row[0];});
        } else {
            grps[true] = [];
        }
        if (_.has(grps, false)) {
            grps[false] = _.sortBy(grps[false], function (row) { return row[1]; });
        } else {
            grps[false] = [];
        }
        return grps[true].concat(grps[false]);
    },
    "on": {
      "data_loaded" : function(app){
        var fin_sizes = this.dept_rollup('{{last_year}}exp',true);
        _.chain(depts)
          .each(function(dept,key){
            dept.fin_size = fin_sizes[key];
          })
          .filter(function(dept,key){
            return _.isUndefined(dept.fin_size);
          })
          .each(function(dept,key){
            dept.fin_size =0;
          })
          .value();
      }
    },
    mapper: function (row) {
      if (this.lang === 'en') {
          row.splice(3, 1);
      } else {
          row.splice(4, 1);
      }
      // remove acronym and vote type
      return row;
    },
    mini_view: {
      description: {
          "en": "Total budgetary voted and statutory authorities and expendiures.",
          "fr": "Montant total des autorisations et dépenses budgétaires votées et législatives."
      },
      headers_classes : ['left_text','right_text','right_text'],
      row_classes : [ 'left_text wrap-none', 'right_number', 'right_number'],
      prep_data: function () {
        this.rows = [
          this.da.exp_auth_by_year("{{last_year}}",true),
          this.da.exp_auth_by_year("{{last_year_2}}",true),
          this.da.exp_auth_by_year("{{last_year_3}}",true)
        ];
        this.headers = [
          [this.gt("year"),
           this.gt("authorities") + ' ($000)',
           this.gt("expenditures") + ' ($000)']
        ];
      }
    },
    dept_info : function(c, q){
      _.each(years, function(year){
        c["dept_"+year+"_auth"] = q.sum(year+"auth");
        c["dept_"+year+"_exp"] = q.sum(year+"exp");

        var key = "dept_"+year+"_stat_voted";
        c[key] = this.voted_stat(year+'auth',c.dept,true);
        c[key].voted = c[key].voted || 0;
        c[key].stat = c[key].stat || 0;
      },this);
      c.dept_historical_voted = q.voted_items();
      c.dept_historical_stat = q.stat_items();
    },
    info : function(c,q){
      _.each(years, function(year){
        c["gov_"+year+"_auth"] = q.sum(year+"auth");
        c["gov_"+year+"_exp"] = q.sum(year+"exp");
        c["gov_"+year+"_stat_voted"] = this.voted_stat(year+'auth',false);
      },this);
    },
    "graphics": {
       "details_display_order" : [
         "historical_auth_exp",
         "vote_stat_split",
         "voted_spending",
         "stat_spending"
       ],
       "historical_auth_exp" : function(){
         // ensure the graph can span the whole screen
         // and then split the area for the legend and graph
          this.panel.change_span("span-8")
                      .split_graph();

          var text,
              colors = D3.tbs_color(),
              level,//will be either "dept" or "gov"
              d = this.data, // shorthand
              gt=app.get_text, //shorthand
              args={
                colors : colors,
                add_xaxis : true,
                x_axis_line : true,
                add_labels : true,
                add_yaxis : true,
                height : this.height,
                formater : app.compact1,
                ticks : this.data.last_years,
                series : {}
              },
              // get reference to different areas of the graph container
              legend_area = this.panel.areas().graph.select(".first"),
              graph_area = this.panel.areas().graph.select(".second");

          if (this.dept){
            text = "dept_historical_auth";
            level = "dept";
          } else {
            text = "gov_historical_auth";
            level = "gov";
          }

          data = _.chain(["authorities", "expenditures"])
                  .map(function(type){
                    var ending = type === "authorities"? "auth": "exp"
                    return {
                      label : gt(type),
                      data : [ d[level+"_last_year_5_"+ending],
                               d[level+"_last_year_4_"+ending],
                               d[level+"_last_year_3_"+ending],
                               d[level+"_last_year_2_"+ending],
                               d[level+"_last_year_"+ending]],
                      active : true
                     };
                  })
                  //.filter(function(d){ return d3.sum(d.data) !})
                  .sortBy(function(d){return d3.sum(d.data);})
                  .value();

          // create the list as a dynamic graph legend
          var list = D3.create_list(legend_area,data, {
            html : function(d){
              return d.label;
            },
            height : this.height,
            width : 300,
            interactive : true,
            title : app.get_text("legend"),
            legend : true,
            ul_classes : "legend",
            colors : colors,
            multi_select : true}
          );

          // create the graph
          var graph = LINE.ordinal_line({
            add_legend : false,
            add_xaxis : true,
            ticks : this.data.last_years,
            formater : app.compact1,
            colors : colors,
            series : _.chain(data)
                      .map(function(obj){ return [obj.label,obj.data];})
                      .object()
                      .value()
          });
          graph(graph_area);
          // hook the list dispatcher up to the graph
          list.dispatch.on("click", LINE.ordinal_on_legend_click(graph,colors));

          return {
            title : app.get_text("previous_year_fisc"),
            text : app.get_text(text, this.written_data),
            source : [this.create_links({
              cols : ["{{last_year}}auth","{{last_year_2}}auth","{{last_year_3}}auth"]
            })]
          };
       },
       "vote_stat_split": function(){
         // ensure the graph can span the whole screen
         // and then split the area for the legend and graph
          this.panel.change_span("span-8")
                      .split_graph();

          var colors = D3.tbs_color(), // shared between legend and graph
              text, // will be filled in depending on department
              d = this.data, // shorthand
              gt=app.get_text, //shorthand
              args={       // default arguments for the line graph
                          // irrespective of whehter it's for goc or dept
                height : this.height,
                formater : app.compact1,
                add_legend : false,
                add_yaxis : true,
                add_xaxis : true,
                html_ticks : true,
                ticks : this.data.last_years,
              },
              // get reference to different areas of the graph container
              legend_area = this.panel.areas().graph.select(".first"),
              graph_area = this.panel.areas().graph.select(".second");

          if (this.data.dept){
            args.x_axis_line = true;
            text = "dept_historical_auth";
            data = _.chain(["stat", "voted"])
                    .map(function(type){
                       return {
                         label : gt(type),
                         data : [ d.dept_last_year_5_stat_voted[type],
                                  d.dept_last_year_4_stat_voted[type],
                                  d.dept_last_year_3_stat_voted[type],
                                  d.dept_last_year_2_stat_voted[type],
                                  d.dept_last_year_stat_voted[type]],
                         active : true
                       };
                    })
                    .filter(function(d){
                        return !_.all(d.data, function(val){
                           val === 0;
                        });
                    })   
                    .sortBy(function(d){return d3.sum(d.data);})
                    .value();
          } else {
            text = "gov_historical_auth";
            data = _.chain(["stat", "voted"])
                    .map(function(type){
                       return {
                         label : gt(type),
                         data : [ d.gov_last_year_5_stat_voted[type],
                                  d.gov_last_year_4_stat_voted[type],
                                  d.gov_last_year_3_stat_voted[type],
                                  d.gov_last_year_2_stat_voted[type],
                                  d.gov_last_year_stat_voted[type]],
                         active : true
                       };
                    })
                    .sortBy(function(d){return d3.sum(d.data);})
                    .value();
          }



          // create the list as a dynamic graph legend
          var list = D3.create_list(legend_area,data, {
            html : function(d){
              return d.label;
            },
            height : this.height,
            width : 300,
            interactive : true,
            title : app.get_text("legend"),
            legend : true,
            ul_classes : "legend",
            colors : colors,
            multi_select : true
          });

          // create the graph
          var graph = LINE.ordinal_line({
            add_legend : false,
            add_xaxis : true,
            ticks : this.data.last_years,
            formater : app.compact1,
            colors : colors,
            series : _.chain(data)
                      .map(function(obj){ return [obj.label,obj.data];})
                      .object()
                      .value()
          });
          graph(graph_area);
          // hook the list dispatcher up to the graph
          list.dispatch.on("click", LINE.ordinal_on_legend_click(graph,colors));

          return {
            text : app.get_text(text, this.written_data),
            title : app.get_text("previous_year_fisc"),
            source : [this.create_links({
              cols : _.chain(years)
                      .map(function(year){
                        return [year+"auth",year+"exp"];
                      })
                      .flatten()
                      .value()
            })]
          };
       },
       "voted_spending" :   function(){
         var func = _.bind(create_line_graph,this);
         this.data_type = 'voted';
         return func();
       },
       "stat_spending" :  function(){
         var func = _.bind(create_line_graph,this);
         this.data_type = 'stat';
         return func();
       }
    }
    });

    var vote_stat_query = function(vote_or_stat, cut_off){
       var total=0,cut_off_counter=0;
       var dept = this.dept || true;
       return _.chain(this.table.voted_stat(undefined,dept, false)[vote_or_stat])
         .map(_.clone)
         .flatten()
         .sortBy(function(d){
           d.total = d["{{last_year_3}}auth"]+d["{{last_year_2}}auth"]+d["{{last_year}}auth"];
           total += d.total;
           return -d.total;
         })
         .each(function(d){
           d.percent = d.total / total;
         })
         .each(function(d){
           if (!cut_off){return;}
           cut_off_counter += d.percent;
           d.cut_off = cut_off_counter >= cut_off ? true : false;
         })
         .value();
    };

    var create_line_graph = function(){

      this.panel
        .change_span("span-8")
        .split_graph();
      var data_type = "dept_historical_" + this.data_type;
      var graph_area =  this.panel.areas().graph;
      var data =  this.data[data_type] ;

      if (data.length === 0 ){
        return false;
      }

      // transform the data
      var data = _.chain(data)
        .map(function(row){
          return {label : row.desc,
                  data : _.map(years, function(year){
                            return row[year+"auth"];
                        }),
                  active : false};
        })
        .sortBy(function(x){
            return -d3.sum(x.data);
        })
        .value();

      // create the list as a dynamic graph legend
      var list = D3.create_list(graph_area.select(".first"),data, {
        html : function(d){
          return d.label;
        },
        height : this.height,
        width : 300,
        interactive : true,
        title : app.get_text("legend"),
        legend : true,
        ul_classes : "legend",
        multi_select : true}
      );

      // create the graph
      var graph = LINE.ordinal_line({
        add_legend : false,
        add_xaxis : true,
        ticks : this.data.last_years,
        formater : app.compact1
      });

      // run the graph once on empty data to establish the sizes
      graph(graph_area.select(".second"));
      // hook the list dispatcher up to the graph
      list.dispatch.on("click", LINE.ordinal_on_legend_click(graph));
      // simulate the first item on the list being selected
      list.dispatch.click(data[0],0,list.first,list.list);
      return {
        title : this.data_type + " -translate",
      };
    };
  });
})();
