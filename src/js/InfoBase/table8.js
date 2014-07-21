(function (root) {
  var TABLES = ns('TABLES'),
      APP = ns('APP'),
      PACK = ns('D3.PACK'),
      BAR = ns('D3.BAR');

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
      "id": "table8",
      "csv_url" : "../InfoBase/data/table8.csv",
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
          .add_child([ {
              "type":"int",
              "key" : true,
              "hidden" : true,
              "nick" : "dept",
              "header":'',
            }, {
              "type":"int",
              "key":true,
              'nick' : "votenum",
              "header":{
                "en":"Vote {{in_year}} / Statutory",
                "fr":"Crédit {{in_year}} / Légis."
                }
            }, {
              "type":"int",
              "key" : true,
              "hidden" : true,
              "nick" : "votestattype",
              "header":'',
            }, {
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
            },
             "description": {
                      "en": "Identifies the spending authorities presented in Estimates before the beginning of a fiscal year. Royal assent for voted expenditures is obtained through two separate appropriation acts: interim supply before the beginning of a new fiscal year and full supply in June. Main Estimates is presented net of the Employment Insurance Operating Account.",
                      "fr": "Énonce les autorisations de dépenser présentées dans les budgets de dépenses avant le début d'un exercice financier. La sanction royale pour les dépenses votées est obtenue au moyen de deux lois de crédits distinctes : l'une visant les crédits provisoires déposée au début d’un exercice financier et une autre pour la totalité des crédits présentée en juin. Le Budget principal des dépenses est présenté net des compte des opérations de l'assurance-emploi."
                  }
          }, {
            "type":"big-int",
            "nick":"multi_year",
            "header":{
              "en":"Available from Previous Years",
            "fr":"Disponibles des exercices antérieurs"
            },
            "description": {
                 "en": "Refers to spending authorities allowed to be brought forward from the previous year. This amount includes only those authorities where there is a specified dollar limit on total spending or on the accumulated outstanding balance of items where revenues and receipts are available for spending. Usually these items represent revolving funds, proceeds from the disposal of surplus Crown assets or loans authorities. These amounts are available for spending without further approval from Parliament.",
                 "fr": " Correspondent aux autorisations de dépenses reportées de l'exercice précédent. Comprennent seulement les autorisations pour lesquelles il existe une limite spécifique quant au montant total à être dépensé, ou sur le solde cumulatif en circulation pour les crédits pour lesquels il est permis de dépenser les revenus et les rentrées. Ces crédits représentent généralement soit des autorisations relatives à des fonds renouvelables, au produit de la vente de biens excédentaires de l'État ou à des prêts. Ces montants sont disponibles pour être dépensés sans aucune autre autorisation du Parlement."
             }
          },{
            "type":"big-int",
            "nick": "suppsa",
            "header":{
              "en":"Supplementary Estimates A",
              "fr":"Budget supplémentaire des dépenses A"
            },
             "description": {
                 "en": "May be tabled in May to provide additional funding to organizations. The associated appropriation act generally receives Royal assent and becomes law in June.",
                 "fr": "Peut être déposé en mai en vue de fournir aux ministères et organismes des fonds supplémentaires. La loi de crédits connexe reçoit habituellement la sanction royale et devient loi en juin."
             }
          },{
            "type":"big-int",
            "nick": "suppsb",
            "header":{
              "en":"Supplementary Estimates B",
              "fr":"Budget supplémentaire des dépenses B"
            },
            "description": {
                "en": "May be tabled in late October or early November to provide additional funding to organizations. The associated appropriation act generally receives Royal assent in December.",
                "fr": "Peut être déposé à la fin d’octobre ou au début de novembre pour fournir des fonds supplémentaires aux ministères et organismes. La loi de crédits connexe reçoit habituellement la sanction royale et devient loi en décembre."
            }
          }, {
            "type":"big-int",
            "nick": "suppsc",
            "header":{
              "en":"Supplementary Estimates C",
              "fr":"Budget supplémentaire des dépenses C"
            },
            "description": {
                "en": "May be tabled in February to provide additional funding to organizations. The associated appropriation act generally receives Royal assent in March.",
                "fr": "Peut être déposé en février pour fournir des fonds supplémentaires aux ministères et organismes. La loi de crédits connexe reçoit habituellement la sanction royale et devient loi en mars."
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
                },
                "description": {
                    "en": "corresponds to the sum of transfers to and from other organizations, central votes, or various adjustments that are made during the year as of the specified date.",
                    "fr": "correspondent à la somme des virements de ou à d'autres organismes, les crédits centraux ou les rajustements qui ont été effectués au cours de l'exercice à la date précisée."
                }
              }, {
                "type":"big-int",
                "nick" : "total_net_auth",
                "header":{
                  "en":"Total Net Authority",
                  "fr":"Autorisations totales nettes"
                },
                "description": {
                    "en": "corresponds to the sum of the authorities provided by Parliament, including transfers from other organizations, central votes, or adjustments that are made during the year as of the specified date.",
                    "fr": "correspondent à la somme des autorisations accordées par le Parlement, y compris les transferts provenant d’autres organismes, les crédits centraux ou les rajustements qui ont été effectués au cours de l’exercice à la date précisée."
                }
              }
        ]);
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
                  // grabbing only the header because we don't need
                  // the fully qualified name for this table, we
                  // know there are no duplicates
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
        c.dept_this_year_stat_voted.voted = c.dept_this_year_stat_voted.voted || 0;
        c.dept_this_year_stat_voted.stat = c.dept_this_year_stat_voted.stat || 0;
        c.dept_this_year_voted_num = c.dept_this_year_stat_voted.voted.length ;
        c.dept_this_year_stat_num = c.dept_this_year_stat_voted.stat.length;
        c.dept_this_year_stat_vote_pct = {
          voted : c.dept_this_year_stat_voted.voted/c.dept_this_year_auth ,
          stat :  c.dept_this_year_stat_voted.stat/c.dept_this_year_auth
        };

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
        c.gov_this_year_stat_vote_pct = {
          voted : c.gov_this_year_stat_voted.voted/c.gov_this_year_auth ,
          stat :  c.gov_this_year_stat_voted.stat/c.gov_this_year_auth
        };
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

        APP.dispatcher.once("info_collection_cleanup",function(c){

          c.gov_this_year_type_spend.crown = qfr_difference.crown;
          c.gov_this_year_type_spend.op += qfr_difference.op;

        });
        APP.dispatcher.once("info_formating_cleanup", function (formated_info, info) {
            var d = formated_info;
            var formater = app.percentage;
            d.gov_this_year_stat_vote_pct.voted   = formater(info.gov_this_year_stat_vote_pct.voted);
            d.gov_this_year_stat_vote_pct.stat    = formater(info.gov_this_year_stat_vote_pct.stat);
            if (info.dept) {
              d.dept_this_year_stat_vote_pct.voted  = formater(info.dept_this_year_stat_vote_pct.voted);
              d.dept_this_year_stat_vote_pct.stat   = formater(info.dept_this_year_stat_vote_pct.stat);
            }
        });
      },
      graphics : {
       "details_display_order" : [
          "this_year_auth",
          "voted_stat_split",
          "estimates_split"
        ],
        "planned_voted" : function(){
          this.graph =  graph_top;
          var title = "Voted",
              written_data = this.written_data.gov_this_year_voted,
              data = this.data.gov_this_year_voted;
          return this.graph(data,written_data, title);
        },
        "planned_stat" : function(){
          this.graph =  graph_top;

          var title = "Stat",
              written_data = this.written_data.gov_this_year_stat,
              data = this.data.gov_this_year_stat;
          return this.graph(data,written_data, title);
        },
        "this_year_auth": function(){
          var data,text,args={
            height : this.height,
            formater : app.compact1
          };

          if (this.dept){
            text = "dept_this_year_auth";
            args.data = [
              {name:"this_year_auth",value: this.data.gov_this_year_auth},
              {name:"dept_this_year_auth",value: this.data.dept_this_year_auth}
            ];
            args.center = true;
          } else {
            args.data = [ {name : "this_year_auth",value: this.data.gov_this_year_auth} ];
            text = "gov_this_year_auth";
            args.font_size = "24";
          }

          return {
            graph : PACK.circle_pie_chart(args),
            text : app.get_text(text, this.written_data),
            title : app.get_text("financial_data"),
            source : [this.create_links({
              cols : "total_net_auth"
            })],
          };

        },
        "voted_stat_split": function(options){
          var d=this.data,
              text,
              args={
                invisible_grand_parent : false,
                height : this.height,
                cycle_colours: true,
                top_font_size : 18,
                bottom_font_size : 16,
                text_func : function(d){
                  var val = app.compact1(d.__value__ || d.value,{no_wrap : true}) ;
                  return d.name + " - "+ val;
                },
                data : {
                  children : null
                }
              },
              gt = app.get_text;

          if (this.dept){
            text = "dept_this_year_vote_stat_split";
            args.data.children = [
              {value:d.dept_this_year_stat_voted.stat, name : gt("stat") },
              {value:d.dept_this_year_stat_voted.voted, name :gt("voted") }
            ];
          } else {
            text = "gov_this_year_vote_stat_split";
            args.data.children = [
              {value:d.gov_this_year_stat_voted.stat, name : gt("stat") },
              {value:d.gov_this_year_stat_voted.voted, name :gt("voted") }
            ];
          }
          // remove 0 sized amounts for cases where a department doesn't
          // have either stat or voted
          args.data.children = _.filter(args.data.children, function(child){
            return child.value !== 0;
          });

         // _.each(args.data.children, function(d){ d.__value__ = d.value;});
          //PACK.soften_spread(args.data.children);

          return {
            title : gt("vote_stat_split"),
            source : [this.create_links({
              cols : "total_net_auth"
            })],
            graph : PACK.pack(args),
            text : gt(text, this.written_data)
          };
        },
        "estimates_split" : function(options){
          
          var data,text,args={
            add_xaxis : true,
            x_axis_line : false,
            add_labels : true,
            html_ticks : true,
            margin : {top: 20, right: 20, left: 20, bottom: 80},
            label_formater : app.compact
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

          return {
            graph : BAR.bar(args),
            title : "Approvals by Estimates",
            source : [this.create_links({
              cols : ["multi_year",'mains', 'suppsa', 'suppsb', 'suppsc',"total_net_auth"]
            }) ],
            text : app.get_text(text, this.written_data)
          };
        }
      }
    });

    graph_top = function(data,written_data,title){
      if (this.dept || this.data.length===0){
        // this graph should not be drawn for departments
        // or for an empty data set
        return false;
      }

      // this function will be bound later by either planned_stat or 
      // planned_voted
      var formater = app.compact1,
          shown = _.map(written_data,function(row){
            var dept_name = row.dept ? TABLES.org_name(row.dept,app.lang) : '';
            return [dept_name,row.desc,row.total_net_auth];
          },this),
          total = [ "Total",
                     '',
                     app.compact_written(d3.sum(data, function(d){
                       return d.total_net_auth;
                     }))
          ],
          headers = [[this.gt("org"), "Item", this.gt("planned_spending")]];

      shown.push(total);

      TABLES.prepare_and_build_table({
       table_class : "table-condensed",
       stripe : true,
       rowseach : function(d,i){
         if (d === total){
           d3.select(this).classed("background-medium total-row",true);
         }
       },
       table_css : { "font-size" : "10px" },
       rows :  shown,
       headers : headers,
       row_class : ["left_text",'left_text','right_number'],
       node : this.chapter.areas().text.node()
      });
      
      return {
        graph : PACK.pack({
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
        }),
        title : title
        //source : 
      };
    };
  });
})();
