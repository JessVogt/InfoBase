(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var PACK = ns('D3.PACK');
  var BAR = ns('D3.BAR');

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
      "id": "table8",
      "coverage": TABLES.coverage.in_year,
      "data_type" :TABLES.data_types.financial,
      "link": {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name": { "en": "Current-year Authorities",
        "fr": "Autorisations pour l'exercice en cours"
      },
      "title": { "en": "Current-year Authorities ($000)",
        "fr": "Autorisations pour l'exercice en cours (en milliers de dollars)"
      },
      "add_cols" : function(){
        this.add_col("")
      .add_child([
        {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "dept",
          "header":'',
        },
        {
          "type":"int",
          "key":true,
          'nick' : "votenum",
          "header":{
            "en":"Vote {{in_year}} / Statutory",
            "fr":"Crédit {{in_year}} / Légis."
            }
        },
        {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "votestattype",
          "header":'',
        },
        {
          "type":"wide-str",
          "key" : true,
          "nick" : "desc",
          "header":{
            "en":"Description",
            "fr":"Description du crédit"
          }
        }
    ]);
    this.add_col({
      "header":{
        "en":"Estimates",
      "fr":"Budgets des dépenses"
      }    
    }).add_child([
      {
        "type":"big-int",
      "nick": "mains",
      "header":{
        "en":"Main Estimates",
      "fr":"Budget Principal"
      }
      },
      {
        "type":"big-int",
      "nick":"multi_year",
      "header":{
        "en":"Available from Previous Years",
      "fr":"Disponibles des exercices antérieurs"
      }
      },
      {
        "type":"big-int",
    "nick": "suppsa",
    "header":{
      "en":"Supplementary Estimates A",
      "fr":"Budget supplémentaire A"
    }
      },
      {
        "type":"big-int",
        "nick": "suppsb",
        "header":{
          "en":"Supplementary Estimates B",
          "fr":"Budget supplémentaire B"
        }
      },
      {
        "type":"big-int",
        "nick": "suppsc",
        "header":{
          "en":"Supplementary Estimates C",
          "fr":"Budget supplémentaire C"
        }
      }
    ]);
    this.add_col("")
      .add_child([
          {
            "type":"big-int",
            "header":{
              "en":"Adjustments",
            "fr":"Ajustements"
            }
          },
          {
            "type":"big-int",
            "nick" : "total_net_auth",
            "header":{
              "en":"Total Net Authority",
            "fr":"Autorisations totales nettes"
            }
          }
          ]);
      },
      "queries" : {
        "qfr_difference" : function(rollup){
          // this function is meant to cover the planned spending gap between qfrs
          // and total approved authority
          rollup = rollup || false;
          var data = this.data,
              qfr_table = _.find(TABLES.tables,function(t){ return t.id === 'table1';}),
              depts = _.difference( _.keys(this.table.depts), _.keys(qfr_table.depts));
          return d3.nest()
            .key(function(d){
              var type = window.depts[d].type.en;
              if (type === 'Crown Corporation'){
                return "crown";
              }
              return "op"; 
            })
          .rollup(function(depts){
            if (rollup){
              var rows = _.filter(data, function(d){ return _.include(depts,d.dept);});
              return d3.sum(rows,function(r){return r.total_net_auth;});
            } else {
              return _.chain(depts)
            .map(function(dept){
              var rows = _.filter(data, function(d){ return d.dept === dept ;});
              var sum = d3.sum(rows,function(r){return r.total_net_auth;});
              return [dept,sum ];
            })
          .object()
            .value();
            }
          })
          .map(depts);
        },
        "estimates_split"  : function(options,format){
          format = format || false;
          var headers = ["multi_year",'mains', 'suppsa', 'suppsb', 'suppsc'],
              data = this.sum(headers),
              add_percentage = options.add_percentage || false,
              as_tuple = options.as_tuple || false,
              filter_zeros = options.filter_zeros || false,
              rtn,
              rows = _.chain(headers)
                .map(function(h){
                  return [this.table.col_from_nick(h).header[this.lang], data[h]];
                },this)
          .filter(function(k_v){
            if (filter_zeros){
              return k_v[1] !== 0;
            } else {
              return true;
            }
          })
          .value();
          if (add_percentage){
            var total = d3.sum(d3.values(data));
            rtn = _.map(rows,function(row){
              row =  row.concat(row[1]/(total+1));
              if (format){
                return this.app.list_formater(["","big-int","percentage"],row);
              }
              return row;
            },this);
          } else {
            rtn =  _.map(rows,function(row){
              if (format){
                return this.app.list_formater(["","big-int"],row);
              }
              return row;
            },this);
          }
          if (as_tuple){
            return rtn;
          } else {
            return _.object(rtn);
          }
        }
      },
      "dimensions" : {
        "include_in_analytics" : ["voted_stat"],
        "horizontal" : TABLES.major_vote_stat,
        "voted_stat" : TABLES.vote_stat_dimension
      },
      "mapper": function (row) {
        if (this.lang === 'en') {
          row.splice(4, 1);
        } else {
          row.splice(3, 1);
        }
        // remove acronym and vote type
        return row;
      },
      mini_view: {
        description: {
          "en": "Current-year budgetary authorities granted by Parliament by appropriation act as of {{month_name}}, 2013, by value ($000) and proportion of total authorities (%).",
          "fr": "Les autorisations budgétaires délivrées par le Parlement pour l’exercice courant au moyen de la Loi de crédits à compter de {{month_name}} 2013 selon la valeur ($000) et la proportion des autorisations totales (%)."
        },
        headers_classes : ['left_text','right_text','right_text'],
        classes : ['left_text','right_number','right_number'],
        prep_data: function () {
          this.rows = this.da.estimates_split({
            add_percentage: true,
          filter_zeros : true,
          as_tuple:true},
          true);
          this.headers= [[this.gt("Estimates"),
            this.gt("amount") + ' ($000)', 
            '(%)']];
        }
      },
      dept_info : function(c,q){
        c.dept_this_year_auth = q.sum("total_net_auth");
        c.dept_this_year_stat_voted =  this.voted_stat("total_net_auth",c.dept,true);
        c.dept_this_year_voted_num = this.voted_stat("total_net_auth",c.dept,false).voted.length;
        c.dept_this_year_stat_num = this.voted_stat("total_net_auth",c.dept,false).stat.length;

        c.dept_this_year_voted = _.chain(this.voted_stat("total_net_auth",c.dept,false).voted) 
                              .sortBy(function(x){ return -x.total_net_auth;}) 
                              .value();
        c.dept_this_year_stat = _.chain(this.voted_stat("total_net_auth",c.dept,false).stat) 
                              .sortBy(function(x){ return -x.total_net_auth;}) 
                              .value();

        c.dept_estimates_split = q.estimates_split({filter_zeros : true, as_tuple : true});
      },
      info : function(c,q){
        var qfr_difference= q.qfr_difference(true);
        c.gov_dept_number = _.keys(this.depts).length;
        c.gov_this_year_auth = q.sum("total_net_auth");
        c.gov_this_year_stat_voted =  this.voted_stat("total_net_auth",false);
        c.this_year_voted_num = this.voted_stat("total_net_auth",false,false).voted.length;
        c.this_year_stat_num = this.voted_stat("total_net_auth",false,false).stat.length;

        var gov_this_year_voted = _.chain(this.voted_stat("total_net_auth",false,false).voted) 
          .sortBy(function(x){ return -x.total_net_auth;}) 
          .value();
        c.gov_this_year_voted = _.head(gov_this_year_voted,10);
        c.gov_this_year_voted.push({
          desc : app.get_text("all_other_voted_items"),
          others : true,
          total_net_auth : d3.sum(_.tail(gov_this_year_voted,10), function(d){
            return d.total_net_auth;
          })
        });

        var gov_this_year_stat = _.chain(this.voted_stat("total_net_auth",false,false).stat) 
          .sortBy(function(x){ return -x.total_net_auth;}) 
          .value();
        c.gov_this_year_stat = _.head(gov_this_year_stat,10);
        c.gov_this_year_stat.push({
          desc : app.get_text("all_other_stat_items"),
          others : true,
          total_net_auth : d3.sum(_.tail(gov_this_year_stat,10), function(d){
            return d.total_net_auth;
          })
        });

        c.gov_estimates_split = q.estimates_split({filter_zeros : true, as_tuple : true});

        APP.dispatcher.once("info_collection_cleanup",function(info){
          info.gov_this_year_type_spend.crown = qfr_difference.crown;
          info.gov_this_year_type_spend.op += qfr_difference.op;
        });
      },
      graphics : {
       "details_display_order" : [
          "this_year_auth"
        ],
        "planned_voted" : function(){
          this.graph =  graph_top;
          this.graph(this.data.gov_this_year_voted);
        },
        "planned_stat" : function(){
          this.graph =  graph_top;
          this.graph(this.data.gov_this_year_stat);
        },
        "this_year_auth": function(){
          var data,text,args={
            height : this.height,
            formater : this.compact
          };

          if (!this.dept){
            args.data = [ {name : "this_year_auth",value: this.data.gov_this_year_auth} ];
            text = "gov_this_year_auth";
            args.font_size = "24";
          } else {
            text = "dept_this_year_auth";
            args.data = [
              {name:"this_year_auth",value: this.data.gov_this_year_auth},
              {name:"dept_this_year_auth",value: this.data.dept_this_year_auth}
            ];
            args.center = true;
          }

          PACK.circle_pie_chart(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));
        },
        "stat_voted_split": function(options){
          var d=this.data,formater = this.compact1, text,args={
            invisible_grand_parent : false,
             height : this.height,
             cycle_colours: true,
             top_font_size : 18,
             bottom_font_size : 16,
             text_func : function(d){
               var val = formater(d.__value__ || d.value) ;
               return d.name + " - "+ val;   
             },
             data : {
               children : null
             }
          },gt = app.get_text;

          if (!this.dept){
            text = "gov_this_year_vote_stat_split";
            args.data.children = [
              {value:d.gov_this_year_stat_voted.stat, name : gt("stat") },
              {value:d.gov_this_year_stat_voted.voted, name :gt("voted") }
            ];
          } else {
            text = "dept_this_year_vote_stat_split";
            args.data.children = [
              {value:d.dept_this_year_stat_voted.stat, name : gt("stat") },
              {value:d.dept_this_year_stat_voted.voted, name :gt("voted") }
            ];
          }

          PACK.pack(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));
        },
        "estimates_split" : function(options){
          var data,text,args={
            add_xaxis : true,
            x_axis_line : false,
            add_labels : true,
            html_ticks : true,
            margin : {top: 20, right: 20, left: 20, bottom: 80},
            label_formater : this.compact
          };

          if (!this.dept){
            text = "gov_estimates_split";
            args.series = {'': _.pluck(this.data.gov_estimates_split,1) };
            args.ticks =  _.pluck(this.data.gov_estimates_split,0);
          } else {
            text = "dept_estimates_split";
            args.series = {'': _.pluck(this.data.dept_estimates_split,1) };
            args.ticks =  _.pluck(this.data.dept_estimates_split,0);
          }

          BAR.bar(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));

        }
      }                    
    });

    graph_top = function(data){
       var formater = this.compact1;
       PACK.pack({
         data : {name : "",
                 children : _.map(data,_.clone)
                },
         top_font_size : 12,
         bottom_font_size : 8,
         value_attr : "total_net_auth",
         height : this.height,
         cycle_colours: true,
         invisible_grand_parent : false,
         hover_text_func : function(d) {
           var text = "";
           if (d.depth === 0){ return; }
           if (d.dept){
             text += window.depts[d.dept].dept[app.lang]+ " - ";
           }
           return text + d.desc;
         },
         text_func : function(d){
           var val = formater(d.total_net_auth) ;
           if (d.others){
             return d.desc + " - "+ val;   
           }
           return val;
         },
       })(this.graph_area);
    };
  });
})();
