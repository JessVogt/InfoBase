$(function() {
  var APP = ns('APP');
  var GROUP = ns('GROUP');
  var TABLES = ns('TABLES');


  TABLES.template_args = {
    'month_fr' : 'janvier',
    'month_en' : 'January',
    'year' : '2012-13',
    'last_year' : '2011-12',
    'last_year_2' : '2010-11',
    'p' : 10
  };

  var for_each_p = function(x){
    return _.map(_.range(TABLES.template_args.p),
                function(){ return x})
  };
  

  function make_historical_filter(source_row){
    var vote_type = source_row[1];
    var year = source_row[2];
    return function(candidate_row){
      return (candidate_row[1] == vote_type &&
              candidate_row[2] == year);
    }
  }

  // hook on to the department title, turn it into a link
  // and when the link is clicked, show the departmental info
  // view
  APP.dispatcher.once("app_ready",function(app){
    APP.dispatcher.on("new_org_view",function(view){
      var dept = app.state.get("dept");
      if (!_.has(dept,"website")) {
        return;
      }
      app.$el.find('.dept_name')
      .addClass("clickable")
      .on("hover", this, function(e){
        $(e.currentTarget).toggleClass("text-info");
      })
      .on("click",function(){
        (new APP.deptInfoView({app: app})).render();
      });
    });
  });

  // register functionality unique to the LED
  APP.dispatcher.on("new_details_view",function(dv){
    // setup the back button
    $('.nav-pills li.back')
      .show()
      .find('a')
      .html(dv.gt("back"))
      .on("click",dv.tear_down)
      .on("click", function(e){
        $(e.currentTarget)
        .parent()
        .hide()
        .find('a').off("click");
      });
    
    // create the graph
    if (_.has(dv.def, "graph_view")){
      dv.graph_payload = dv.$el.find('.graph_payload');
      // check if department is TBS and then remove the
      // central votes
      dv.graph_view = new dv.def.graph_view({
        key : dv.key,
        app : dv.app,
        def : dv.def,
        footnotes : []
      });
      dv.graph_payload.append(dv.graph_view.render().$el);
    }
    else {
      dv.$el.find('.nav-tabs li:last').remove();
      dv.$el.find('.graph_content').remove();
    }
    
    var tab_index = dv.app.state.get('current_tab');
    var tab = dv.$el.find('.nav-tabs a')[tab_index];
    if (tab) {
      $(tab).tab("show");
    } else {
      dv.$el.find('.nav-tabs a:first').tab("show");
    }
    dv.$el.find('.nav-tabs a:last').on("shown",function(){
      dv.$el.find('.nav-tabs a:last').off("shown");
      dv.graph_view.graph();
    });
  });

  APP.printView = Backbone.View.extend({
    template : Handlebars.compile($('#print_view_t').html())
    ,initialize : function(){
      _.bindAll(this);
      this.app = this.options['app'];
      this.state = this.app.state;
      this.lang = this.state.get('lang');
      this.table = $(this.options['table']);
      this.table.attr('id','');
      this.render();
    }
    ,render : function(){
      var gt = APP.app.get_text;
      this.$el = $(this.template());
      this.$el.
        find('.table_area')
        .append(this.table);
      this.$el
        .find('.print_view_close')
        .click(this.close);
      this.$el.
        find('.print_view_print')
        .click(this.print);

      this.app.app.hide();
      $('body div.navbar').hide();
      $('body').append(this.$el);
      return this;
    }
    ,close : function(event){
      this.$el.remove();
      this.app.app.show();
      $('body div.navbar').show();
    }
    ,print : function(){
      this.$el
        .find('button')
        .hide();
      window.print();
      this.$el
        .find('button')
        .show();
      return false;
    }
  });

  APP.dispatcher.once("load_tables",function(app){

    var m = TABLES.m;

    TABLES.tables.add([{
      id : "Table1", 
      col_defs : [ 
              "int",
              "str",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "percentage",
              "big-int",
              "percentage",
              "big-int",
              "percentage"
            ],
        coverage : "in_year",
        headers : { 
          en : [ [ { "colspan" : 2,
                    "header" : ""
                  },
                  { "colspan" : 6,
                    "header" : "2012-13"
                  },
                  { "colspan" : 2,
                    "header" : "2011-12"
                  },
                  { "colspan" : 2,
                    "header" : "5 Year Average**"
                  }
                ],
                [ "Vote",
                  "Description",
                  "Authority",
                  "ARLU Reprofiles",
                  "Expenditures at Period {{p}}",
                  "Forecast Exenditures at year end",
                  "Forecast Lapse (by EACPD*)",
                  "Forecast Lapse % (by EACPD*)",
                  "Gross Lapse",
                  "Gross Lapse Percentage",
                  "5 Year Gross Lapse Average",
                  "5 Year Gross Lapse Percentage"
                ]
              ],
          fr : [ [ { "colspan" : 2,
                    "header" : ""
                  },
                  { "colspan" : 6,
                    "header" : "2012-13"
                  },
                  { "colspan" : 2,
                    "header" : "2011-12"
                  },
                  { "colspan" : 2,
                    "header" : "Moyenne sur cinq ans** "
                  }
                ],
                [ "Crédit",
                  "Nom",
                  "Autorité",
                  "Report de fonds (MJANR)",
                  "Budgets Dépenses à la période {{p}}",
                  "Dépenses prévues à la fin de l'année",
                  "Fonds inutilisés (estimés par la DADPR*)",
                  "Fonds inutilisés % (estimés par la DADPR*)",
                  "Fonds inutilisés bruts",
                  "Fonds inutilisés bruts",
                  "Moyenne des fonds inutilisés bruts sur 5 ans",
                  "Moyenne des fonds inutilisés bruts sur 5 ans en pourcentage"
                ]
              ]
          },
          name: { 
            en : "1 - Lapse Forecast",
            fr : "1 - Prévision des fonds inutilisés"
            },
          title : { 
            en : "Table 1 - Lapse Forecast for 2012-13 based on {{month_en}} data (P{{p}}) ($000)",
            fr : "Tableau 1 - Prévision des fonds inutilisés basée sur les dépenses d'{{month_fr}} 2012-13 (P{{p}}) ($000)"
          }
          ,key : [0,1]
          ,table_view : { 
            sum_cols: [2,3,4,5,7,9]
            ,min_func : TABLES.add_ministry_sum
            ,init_row_data : function(){
              var txt = this.gt("total");

              this.merge_group_results(
                [[this.row_data,
                GROUP.fnc_on_group(
                  this.row_data,
                  {txt_cols : {0 : txt},
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows})]]);
            }
          }
          ,mapper :{
            to : function (row) {
              if (row[1]){
                row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
              }
              else {
                row.splice(2,0,'');
              }
              // chop of deptcode
              return _.rest(row,1); 
            }
            ,make_filter : function(source_row){
              var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
              return _.bind(function(candidate_row){
                var cr = candidate_row;
                if (cr[1]){
                  var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
                  return ( type == cr_type);
                }
                return false;
              },this);
            }
          }
        ,mini_view : {
          prep_data : function(){
            var ttf = APP.types_to_format['big-int'];
            var auth = "Authority";
            var lapse = "Forecast Lapse (by EACPD*)";
            var auth_total = _.reduce(
                _.pluck(this.data,auth),
                function(x,y){return x+y});
            var lapse_total = _.reduce(
                _.pluck(this.data,lapse),
                function(x,y){return x+y});
            this.rows = [
              [this.to_lang(auth), ttf(auth_total,this.lang) ],
              [this.to_lang(lapse), ttf(lapse_total,this.lang) ]
            ];
          }
          ,render_data : function(){
            this.content = TABLES.build_table({
              headers : [['',' ($000)']],
              body : this.rows,
              css : [{'font-weight' : 'bold'}, {'text-align' : 'right'}]
            });
          }
        } 
      },
      {
       id : "Table2" ,
       col_defs : [ "int",
              "wide-str",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int"
            ],
       coverage : "in_year",
       headers : { 
         en : [[
            { "colspan" : 2,
              "header" : ""
            },
            { "colspan" : 3,
              "header" : "Authorities"
            },
            { "colspan" : 3,
              "header" : "Expenditures"
            }
           ], [
             "Vote / Stat",
             "Description",
             "Gross",
             "Revenues",
             "Net",
             "Gross",
             "Revenues",
             "Net" ]
         ],
         fr : [[
           { "colspan" : 2,
             "header" : ""
           },
           { "colspan" : 3,
             "header" : "Crédits"
           },
           { "colspan" : 3,
             "header" : "Dépenses"
           }
           ],  
           [ "Crédit / Statutaire",
             "Description",
             "Bruts",
             "Recettes",
             "Nets",
             "Brutes",
             "Recettes",
             "Nettes"
            ]]
          },
          name : { 
            en : "2 - Authority and Expenditure",
            fr : "2 - Crédits et dépenses"
          },
          title : { 
            en : "Table 2 - Authority and Expenditure based on {{month_en}}, 2012-13 data (P{{p}}) ($000)",
            fr : "Tableau 2 - Crédits et dépenses à la fin d'{{month_fr}}, 2012-13 (P{{p}}) ($000)"
          }
          ,key : [0,1]
          ,table_view : { 
            sum_cols: _.range(2, 8)
            ,min_func : TABLES.add_ministry_sum
            ,init_row_data : function(){
              var total =   GROUP.fnc_on_group(
                  this.row_data,
                  {txt_cols : {0 : this.gt("total")},
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows});
              var self = this;
              this.merge_group_results(
                GROUP.group_rows(
                  this.row_data,
                  function(row){ return _.isString(row[0])},
                  {txt_cols : {0 : this.gt("sub_total"),
                                1 : function(g){
                                  var row = _.first(g);
                                  return _.isString(row[0]) ? self.gt("stat") : self.gt('vote') }},
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows}));
                this.merge_group_results([[this.row_data,total]]);
            }
          }
          ,mapper : {
            to : function (row) {
                  if (this.lang == 'en'){
                    row.splice(3,1);
                  }
                  else{
                    row.splice(2,1);
                    if (row[1] == '(S)'){row[1] = '(L)'};
                  }
                  return _.rest(row); 
                },
            make_filter : function(source_row){
              if (_.isNumber(source_row[1])){
                var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
                return _.bind(function(candidate_row){
                  var cr = candidate_row;
                  if (cr[1] && _.isNumber(cr[1])){
                    var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
                    return ( type == cr_type);
                  }
                  return false;
                },this);
              }else {
                return _.bind(function(candidate_row){
                  return candidate_row[2] == source_row[2];
                },this);
              }
            }
          }
          ,mini_view : {
            prep_data : function(){
              var ttf = APP.types_to_format['big-int'];
              var auth = "Authorities-Net";
              var exp = "Expenditures-Net";
              var votes = _.filter(this.data,function(row){
                return _.isNumber(row["Vote / Stat"])
              });
              var stat = _.without.apply(this,[this.data].concat(votes));
              votes = _.reduce(votes, function(x,y){
                return [x[0]+y[auth], x[1] + y[exp]]
              },[0,0]);
              stat = _.reduce(stat, function(x,y){
                return [x[0]+y[auth], x[1] + y[exp]]
              },[0,0]);
              
              votes = _.map(votes, function(x){ return ttf(x)});
              stat = _.map(stat, function(x){ return ttf(x)});
              this.rows = [
                [this.gt("vote")].concat(votes),
                [this.gt("stat")].concat(stat)
              ];
            }
            ,render_data : function(){
              this.content = TABLES.build_table({
                headers : [['','Athority','Expenditure']],
                body : this.rows,
                css : [{'font-weight' : 'bold'}, 
                        {'text-align' : 'right'},
                        {'text-align' : 'right'} 
              ]
              });
            }
          } 
      },
      {
        id : "Table2a",
        col_defs : [ "wide-str",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int",
                     "big-int"
        ],
        coverage : "in_year",
        headers : { "en" : [ 
                  [ 
                    {"colspan" : 1,
                     "header" : ""
                    },
                    {"colspan" : 6,
                     "header" : "2012-13 Period {{p}}"
                    },
                    {"colspan" : 6,
                     "header" : "2011-12 Period {{p}}"
                    },
                    {"colspan" : 6,
                     "header" : "2010-11 Period {{p}}"
                    }
                  ],
                  [ "Program Activity",
                    "Operating",
                    "Capital",
                    "Grants & Contrib.",
                    "Other Votes",
                    "Statutory",
                    "Total 2012-13",
                    "Operating",
                    "Capital",
                    "Grants & Contrib.",
                    "Other Votes",
                    "Statutory",
                    "Total 2010-11",
                    "Operating",
                    "Capital",
                    "Grants & Contrib.",
                    "Other Votes",
                    "Statutory",
                    "Total 2009-10"
                  ]
                ],
              "fr" : [ [ { "colspan" : 1,
                      "header" : ""
                    },
                    { "colspan" : 6,
                      "header" : "2012 - 13 Période {{p}}"
                    },
                    { "colspan" : 6,
                      "header" : "2011 - 12 Période {{p}}"
                    },
                    { "colspan" : 6,
                      "header" : "2010 - 11 Période {{p}}"
                    }
                  ],
                  [ "Activités de programme",
                    "Fonctionnement",
                    "Capital",
                    "Subventions & Contributions",
                    "Autres Crédits",
                    "Statutaires",
                    "Total 2011-12",
                    "Fonctionnement",
                    "Capital",
                    "Subventions & Contributions",
                    "Autres Crédits",
                    "Statutaires",
                    "Total 2010-11",
                    "Fonctionnement",
                    "Capital",
                    "Subventions & Contributions",
                    "Autres Crédits",
                    "Statutaires",
                    "Total 2009-10"
                  ]
                ]
          },
          name : { 
            en : "2a - Expenditures by Program",
            fr : "2a - Dépenses par Activité"
          },
          title : { 
            en : "Table 2A - Expenditures by Program Activity ($000)",
            fr : "Tableau 2A - Dépenses par Activité de programme ($000)"
          }
          ,key : [0]
          ,table_view : { 
            sum_cols: _.range(1, 19)
            ,hide_col_ids : [7,8,9,10,11,13,14,15,16,17]
            ,min_func : TABLES.add_ministry_sum
            ,init_row_data : function(){
              var txt = this.gt("total");
              this.merge_group_results(
                [[this.row_data,
                GROUP.fnc_on_group(
                  this.row_data,
                  {txt_cols : {0 : txt},
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows})]]);
            }
          }
          ,mapper : {
            to : function (row) {
              if (this.lang == 'en'){
                row.splice(2,1);
              }
              else{
                row.splice(1,1);
              }
              return _.rest(row); 
            },
            make_filter : function(row){
              if (row[1] === 'Internal Services'){
                return function(candidate_row){ 
                  return candidate_row[1] == 'Internal Services'
                }
              } else {
                return function(candidate_row){
                  return (candidate_row[1] != 'Internal Services' &&
                          candidate_row[0] != 'ZGOC');
                }
              }
            } 
          }
        ,mini_view : {
            prep_data : function(){
              var ttf = APP.types_to_format['big-int'];
              var auth = "Total 2012-13";
              var sorted = _.sortBy(this.data, function(x){
                return x[auth];
              });
              this.rows  = _.map(_.last(sorted, 3).reverse(), function(row,index){
                return [index+1,row['Program Activity'],ttf(row[auth])];
              });
            }
            ,render_data : function(){
              this.content = TABLES.build_table({
                headers : [['',this.to_lang('Program Activity'),this.gt('expenditures')]],
                body : this.rows,
                css : [{},
                       {},
                       {'text-align' : 'right'} 
                      ]
              });
            }
         } 
      },
      {
       id : "Table2b",
       col_defs : [ "int",
             "str",
             "big-int",
             "big-int",
             "percentage",
             "big-int",
             "big-int",
             "percentage"
           ]
         ,coverage : "in_year"
         ,headers : { 
           "en" : [[{ "colspan" : 2,
                     "header" : ""
                   },
                   { "colspan" : 3,
                     "header" : "{{year}} Period {{p}}"
                   },
                   { "colspan" : 3,
                     "header" : "{{last_year}} Period {{p}}"
                   }
                 ],
                 [ "Vote",
                   "Description",
                   "Net Authority",
                   "Net Expenditures",
                   "Spending Rate",
                   "Net Authority",
                   "Net Expenditures",
                   "Spending Rate"
                 ]
               ],
           "fr" : [ [ { "colspan" : 2,
                     "header" : ""
                   },
                   { "colspan" : 3,
                     "header" : "{{year}}  Période {{p}}"
                   },
                   { "colspan" : 3,
                     "header" : "{{last_year}}  Période {{p}}"
                   }
                 ],
                 [ "Crédit",
                   "Description",
                   "Budgets nets",
                   "Dépenses nettes",
                   "Niveau de dépense",
                   "Budgets nets",
                   "Dépenses nettes",
                   "Niveau de dépense"
                 ]
               ]
           }
         ,name : { 
           en : "2b - Spending Rate Comparison",
           fr : "2b - Niveau de dépense"
         }
         ,title : { 
           en : "Table 2B - Spending Rate Comparison (2012-13 vs 2011-12)",
           fr : "Tableau 2B - Comparaison des niveaux de dépense (2012-13 vs 2011-12)"
         }
         ,key : [0,1]
          ,table_view : { 
            sum_cols: [2,3, 5,6] 
            ,hide_col_ids: []
            ,min_func : TABLES.add_ministry_sum
            ,init_row_data : function(){
              var txt = this.gt("total");
              this.merge_group_results(
                [[this.row_data,
                GROUP.fnc_on_group(
                  this.row_data,
                  {txt_cols : {0 : txt},
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows})]]);
            }
          }
         ,mapper : {
           to : function (row) {
               if (row[1]){
                 row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
               }
               else {
                 row.splice(2,0,'');
               }
               return _.rest(row,1); 
             }
           ,make_filter : function(source_row){
             var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
             return _.bind(function(candidate_row){
               var cr = candidate_row;
               if (cr[1]){
                 var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
                 return ( type == cr_type);
               }
               return false;
             },this
             );
           }
         }
       ,mini_view : {
         prep_data : function(){
           var ttf = APP.types_to_format['percentage'];
           var filtered = _.filterk
           this.year = "{{year}} Period {{p}}-Spending Rate"
           this.last_year = "{{last_year}} Period {{p}}-Spending Rate"
           this.rows = _.map(this.data, function(row){
             return [row['Description'],
                     ttf(row[this.year]),
                     ttf(row[this.last_year])];
           },this);
         }
         ,render_data : function(){
           this.content = TABLES.build_table({
             headers : [[this.gt('vote'),m('{{year}}'), m('{{last_year}}') ]],
             body : this.rows,
             css : [{},
                    {'text-align' : 'right'},
                    {'text-align' : 'right'} 
                   ]
           });
         }
       } 
      },
      {
        id : "Table3",
        col_defs : [ "int",
              "wide-str",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int"
            ],
          "coverage" : "in_year",
          "headers" : { "en" : [ [ { "colspan" : 2,
                      "header" : ""
                    },
                    { "colspan" : 1,
                      "header" : "Gross Authorities"
                    },
                    { "colspan" : 3,
                      "header" : "Revenues Credited to the Vote"
                    },
                    { "colspan" : 13,
                      "header" : "Net Authorities"
                    }
                  ],
                  [ "Vote",
                    "Description",
                    "Gross Total",
                    "Main Estimates",
                    "Treasury Board Authorities",
                    "Total Revenues",
                    "Multi-year Authorities",
                    "Main Estimates",
                    "SE(A)",
                    "SE(B)",
                    "SE(C)",
                    "Transfers from TB Vote 5 Gov. Contingencies",
                    "Transfers from TB Vote 10 Gov. Wide Initiatives ",
                    "Transfers from TB Vote 15 Compens. Adjustments  ",
                    "Transfers from TB Vote 25 OBCF  ",
                    "Transfers from TB Vote 30 Paylist Requirements ",
                    "Transfers from TB Vote 33 CBCF ",
                    "PT",
                    "Net Total"
                  ]
                ],
              "fr" : [ [ { "colspan" : 2,
                      "header" : ""
                    },
                    { "colspan" : 1,
                      "header" : "Imputations brutes"
                    },
                    { "colspan" : 3,
                      "header" : "Revenus à valoir sur le(s) crédit(s)"
                    },
                    { "colspan" : 12,
                      "header" : "Imputations nettes"
                    }
                  ],
                  [ "Crédit",
                    "Description",
                    "Total Brut",
                    "Budget Principal",
                    "Autorité du Conseil du du Trésor",
                    "Total des Revenus",
                    "Crédits pluri-annuels",
                    "Budget principal",
                    "Supp. A",
                    "Supp. B",
                    "Supp. C",
                    "Transferts du crédit 5 du CT (Éventualités du gouvernement)",
                    "Transferts du crédit 10 du CT (Initiatives pangouvernementales)",
                    "Transferts du crédit 15 du CT (Rajustements à la rémunération)",
                    "Transferts du crédit 25 du CT (Report du budget de fonctionnement)",
                    "Transferts du crédit 30 du CT (Besoins en matière de rémunération)",
                    "Transferts du crédit 30 du CT (Report du budget d'immobilisations)",
                    "PT",
                    "Total net"
                  ]
                ]
            }
          ,name : { 
            en : "3 - Authorities"
            ,fr : "3 - Autorités"
          }
          ,title : { 
            en : " Table 3 - 2012-13 Authorities ($000)",
            fr : "Tableau 3 - Autorités pour 2012-13 ($000)"
          }
          ,key : [0,1]
          ,table_view : { 
            hide_col_ids: [3,4,6,11,12,13,14,15,16,17]
            ,sum_cols: _.range(2, 19)
            ,min_func : TABLES.add_ministry_sum
            ,init_row_data : function(){
              var txt = this.gt("total");
              this.merge_group_results(
                [[this.row_data,
                GROUP.fnc_on_group(
                  this.row_data,
                  {txt_cols : {0 : txt},
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows})]]);
            }
          }
          ,mapper : {
            to : function (row) {
              if (row[1]){
                row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
              }
              else {
                row.splice(2,0,'');
              }
              return _.rest(row,1); 
            }
            ,make_filter : function(source_row){
              var type = votes[this.def['coverage']][source_row[0]][source_row[1]]['type'];
              return _.bind(function(candidate_row){
                var cr = candidate_row;
                if (cr[1]){
                  var cr_type = votes[this.def['coverage']][cr[0]][cr[1]]['type'];
                  return ( type == cr_type);
                }
                return false;
              },this);
            }
          }
          ,mini_view : {
            prep_data : function(){
              var ttf = APP.types_to_format['big-int'];
              var main = 'Net Authorities-Main Estimates';
              var sea = 'SE(A)';
              var seb = 'SE(B)';
              var sec = 'SE(C)';
              var reduced = _.reduce(this.data,function(x,y){
                return [x[0] + y[main],
                        x[1] + y[sea],
                        x[2] + y[seb],
                        x[3] + y[sec]];
              },[0,0,0,0]);
              this.rows = [
                [this.to_lang(main),ttf(reduced[0])],
                [this.to_lang(sea),ttf(reduced[1])],
                [this.to_lang(seb),ttf(reduced[2])],
                [this.to_lang(sec),ttf(reduced[3])]
              ];
            }
            ,render_data : function(){
                this.content = TABLES.build_table({
                  headers : [[this.gt("appropriation_p"),this.gt("authorities")]],
                  body : this.rows,
                  css : [{},
                          {'text-align' : 'right'},
                          {'text-align' : 'right'} 
                        ]
                });

            }
          } 
      },
      //{
      //  "id" : "TableIS"
      //  ,"col_defs" : ["int",
      //               "str",
      //               "str",
      //               // periods
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               // period 16
      //               "big-int",
      //               // SO breakout
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               "big-int",
      //               ],
      //  "coverage" : "in_year",
      //  "headers" : { "en" : [[{"colspan" : 3,
      //                       "header" : ""},
      //                      {"colspan" : 13,
      //                       "header" : "Expenditures by Period"},
      //                      {"colspan" : 5,
      //                       "header" : "Expenditures by Categories"},
      //                      ],[
      //                       "Vote / Stat",
      //                       "Description",
      //                       "P1",
      //                       "P2",
      //                       "P3",
      //                       "P4",
      //                       "P5",
      //                       "P6",
      //                       "P7",
      //                       "P8",
      //                       "P9",
      //                       "P10",
      //                       "P11",
      //                       "P12",
      //                       "P16",
      //                       "Personnel",
      //                       "Professional and Special Servies",
      //                       "Acquisistion of Machinery",
      //                       "Other",
      //                       'Revenue',
      //                      ]],
      //              "fr" : [[{"colspan" : 3,
      //                       "header" : ""},
      //                      {"colspan" : 13,
      //                       "header" : "Dépenses par périod"},
      //                      {"colspan" : 5,
      //                       "header" : "Types des dépenses"},
      //                      ],[
      //                       "Crédit / leg.",
      //                       "Déscription",
      //                       "Année",
      //                       "P1",
      //                       "P2",
      //                       "P3",
      //                       "P4",
      //                       "P5",
      //                       "P6",
      //                       "P7",
      //                       "P8",
      //                       "P9",
      //                       "P10",
      //                       "P11",
      //                       "P12",
      //                       "P16",
      //                       "Personnel",
      //                       "Services Professionnels et Spéciaux",
      //                       "Acquisition de machinerie et matériel",
      //                       "Other",
      //                       'Revenus',
      //                      ]]}
      //    ,"name" : { 
      //      en : "Internal Services"
      //      ,fr : "Services Internes"
      //    }
      //    ,"title" : { 
      //      en : "Internal Services ($000)",
      //      fr : "Internal Services ($000)"
      //    }
      //    ,key : [0,1]
      //    ,table_view : { 
      //      hide_col_ids: []
      //      ,sum_cols: []
      //      ,min_func : TABLES.add_ministry_sum
      //      ,init_row_data : function(){
      //        //var txt = this.gt("total");
      //        //this.merge_group_results(
      //        //  [[this.row_data,
      //        //  GROUP.fnc_on_group(
      //        //    this.row_data,
      //        //    {txt_cols : {0 : txt},
      //        //      func_cols : this.sum_cols,
      //        //      func : GROUP.sum_rows})]]);
      //      }
      //    }
      //    ,mapper : {
      //      to : function (row) {
      //        if (_.isNumber(row[1]) ){
      //          row.splice(2,0,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
      //        }
      //        else if (row[1] == '(S)'){
      //          row.splice(2,0,'');
      //        }
      //        return _.rest(row,1); 
      //      }
      //      ,make_filter : function(source_row){
      //        return _.bind(function(candidate_row){
      //          if (candidate_row[1]){
      //            return ( source_row[1] == candidate_row[1]);
      //          }
      //          return false;
      //        },this);
      //      }
      //    }
      //    ,mini_view : {
      //      prep_data : function(){
      //        var ttf = APP.types_to_format['big-int'];
      //      }
      //      ,render_data : function(){

      //      }
      //    }
      //},
      {
        id : "Table4",
        col_defs : [ "int",
              "str",
              "date",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "percentage",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "percentage"
            ],
        coverage : "historical",
        headers : { "en" : [ [ { "colspan" : 3,
                      "header" : ""
                    },
                    { "colspan" : 5,
                      "header" : "Gross"
                    },
                    { "colspan" : 2,
                      "header" : "Public Accounts"
                    },
                    { "colspan" : 3,
                      "header" : "Gross Lapse Components"
                    },
                    { "colspan" : 2,
                      "header" : "Net Lapse*"
                    }
                  ],
                  [ "Vote (2011-12)",
                    "Description",
                    "Year",
                    "Net Authority",
                    "Net Expenditures",
                    "Gross Lapse",
                    "Multi-Year Authorities",
                    "Over Expenditure",
                    "Lapse**",
                    "Lapse Percentage (%)",
                    "Frozen Allotment",
                    "Special Purpose Allotment",
                    "OBCF & CBCF Allowed",
                    "Net Lapse",
                    "Net Lapse (%)"
                  ]
                ],
              "fr" : [ [ { "colspan" : 3,
                      "header" : ""
                    },
                    { "colspan" : 5,
                      "header" : "Bruts"
                    },
                    { "colspan" : 2,
                      "header" : "Comptes publics"
                    },
                    { "colspan" : 3,
                      "header" : "Ajustements aux fonds inutilisés bruts"
                    },
                    { "colspan" : 2,
                      "header" : "Fonds inutilisés"
                    }
                  ],
                  ["Crédit (2011-12)",
                  "Description",
                  "Année",
                  "Autorités nettes",
                  "Dépenses nettes",
                  "Fonds inutilisés bruts",
                  "Autorités pluri-annuels",
                  "Dépenses excédentaires",
                  "Fonds inutilisés",
                  "Fonds inutilisés (%)",
                  "Fonds bloqués",
                  "Fonds à fin déterminée inutilisés",
                  "Budgets reportés",
                  "Fonds inutilisés nets",
                  "Fonds inutilisés nets (%)"
                  ]
                ]
            },
          "name" : { "en" : "4 - Lapses",
              "fr" : "4 - Fonds inutilisés"
            },
          "title" : { "en" : "Table 4 - Gross and Net Lapses by Vote from 2007-08 to 2011-12 ($000)",
              "fr" : "Tableau 4 - Fonds inutilisés bruts et nets par crédit de 2007-08 à 2011-12 ($000)"
            }
          ,key : [0,1,2]
          ,table_view : { 
            hide_col_ids: [6,7,10,11,12]
            ,sum_cols: [3,4,5,6,7,8,10,11,12,13,14]
            ,min_func : TABLES.add_ministry_year_sums
            ,init_row_data : function(){
              var txt = this.gt("sub_avg");

              var totals = GROUP.group_rows(
                  this.row_data,
                  function(row){ return row[2]},
                  {txt_cols : {0 : this.gt('year_total'),
                                2 : function(g){return _.first(g)[2]} },
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows});

              this.merge_group_results(
                GROUP.group_rows(
                  this.row_data,
                  function(row){ return [row[0],row[1]]},
                  {txt_cols : {0 : txt,
                                1 : function(g){return _.first(g)[1]} },
                    func_cols : this.sum_cols,
                    func : GROUP.avg_rows}));

              totals = _.map(totals,function(total){
                this.summary_rows.push(total[1]);
                return total[1]
              },this);
              this.row_data = this.row_data.concat(totals);

            }
          }
        ,mapper : {
          to : function (row) {
            if (row[1]){
              row[1] = votes[this.def['coverage']][row[1]][this.lang];
            }
            return row;
          }
          ,make_filter : make_historical_filter 
        }
        ,mini_view : {
           prep_data : function(){
             var ttf = APP.types_to_format['percentage'];
             var years = _.map(_.groupBy(this.data,
                   function(row){ return row['Year']; }), 
                 function(group){
                  var sorted = _.sortBy(group,function(row){
                    return row['Net Lapse (%)'];
                  })
                  return _.last(sorted);
              });
             this.rows = _.map(years, function(row){
               return [row['Year'],
                      row['Description'],
                       ttf(row['Net Lapse (%)'])];
             });
           }
           ,render_data : function(){
               this.content = TABLES.build_table({
                 headers : [['',this.gt("vote"),this.to_lang("Net Lapse (%)")]],
                 body : this.rows,
                 css : [{},
                        {},
                         {'text-align' : 'right'} 
                       ]
               });
           }
        } 
      },
      {
        id : "Table5",
        col_defs : [ "int",
              "str",
              "date",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int"
            ],
          "coverage" : "historical",
          "headers" : { "en" : [ [ { "colspan" : 3,
                      "header" : ""
                    },
                    { "colspan" : 3,
                      "header" : "Total Operating"
                    },
                    { "colspan" : 3,
                      "header" : "Capital"
                    },
                    { "colspan" : 3,
                      "header" : "Transfer Payments"
                    },
                    { "colspan" : 3,
                      "header" : "Frozen"
                    },
                    { "colspan" : 3,
                      "header" :  "Special Purpose"
                    },
                    { "colspan" : 3,
                      "header" : "Total"
                    }
                  ],
                  [ "Vote (2011-12)",
                    "Vote",
                    "Year",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*"
                  ]
                ],
              "fr" : [ [ { "colspan" : 3,
                      "header" : ""
                    },
                    { "colspan" : 3,
                      "header" : "Fonctionnement"
                    },
                    { "colspan" : 3,
                      "header" : "Capital"
                    },
                    { "colspan" : 3,
                      "header" : "Paiements de Transfert"
                    },
                    { "colspan" : 3,
                      "header" : "Montants gelés"
                    },
                    { "colspan" : 3,
                      "header" : "Affectations à fin spéciale"
                    },
                    { "colspan" : 3,
                      "header" : "Total"
                    }
                  ],
                  [ "Crédit (2011-12)",
                    "Description",
                    "Année",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*"
                  ]
                ]
            },
          name : { 
            en : "5 - Voted Expenditures by Allotment",
            fr : "5 - Détail des dépenses votées"
          },
          title : { 
            en : "Table 5 - Voted Expenditures by Allotment from 2007-08 to 2011-12 ($000)",
            fr : "Tableau 5 - Détail des dépenses votées par affectation de 2007-08 à 2011-12 ($000)"
          }
          ,key : [0,1,2]
          ,table_view : { 
            hide_col_ids: [3,4,6,7,9,10,12,13,15,16]
            ,sum_cols: _.range(3, 21)
            ,min_func : TABLES.add_ministry_year_sums
            ,init_row_data : function(){
              var txt = this.gt("sub_avg");
              var totals = GROUP.group_rows(
                  this.row_data,
                  function(row){ return row[2]},
                  {txt_cols : {0 : this.gt('year_total'),
                                2 : function(g){return _.first(g)[2]} },
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows});
              this.merge_group_results(
                GROUP.group_rows(
                  this.row_data,
                  function(row){ return [row[0],row[1]]},
                  {txt_cols : {0 : txt,
                                1 : function(g){return _.first(g)[1]} },
                    func_cols : this.sum_cols,
                    func : GROUP.avg_rows}));
              totals = _.map(totals,function(total){
                this.summary_rows.push(total[1]);
                return total[1]
              },this);
              this.row_data = this.row_data.concat(totals);

            }
          }
        ,mapper: {
          to : function (row) {
            if (row[1]){
              row[1] = votes[this.def['coverage']][row[1]][this.lang];
            }
            return row; // take out dept id since don't need anymore AND return row
          }
          ,make_filter : make_historical_filter 
        }
        ,mini_view : {
          prep_data : function(){
            var top_headers = this.def.headers[this.lang][0];
            var ttf = APP.types_to_format['big-int'];
            var allotments = ["Total Operating-Gross Lapse*",
                "Capital-Gross Lapse*",
                "Transfer Payments-Gross Lapse*",
                "Frozen-Gross Lapse*",
                "Special Purpose-Gross Lapse*"];
            var reduced = _.map(this.data, function(row){
              return _.pick.apply(this,[row,'Year'].concat(allotments)); 
            });
            var groups = _.groupBy(reduced, "Year");
            var reduced_groups = _.map(groups, function(group){
              var total =  _.object(_.map(allotments,function(x){
                return [x,_.reduce(_.pluck(group,x),
                  function(a,b){ return a+b})]}));
              total['Year'] = _.first(group)['Year'];
              return total;
            });
            this.rows = _.map(reduced_groups, function(rg){
              var max = _.max(rg);
              var key = _.invert(rg)[max];
              var key_index = _.indexOf(allotments,key)+1;
              return [rg['Year'],top_headers[key_index].header,ttf(max)];
            });
          }
          ,render_data : function(){
             this.content = TABLES.build_table({
               headers : [['',this.gt("allotment"),this.gt("gross_lapse")]],
               body : this.rows,
               css : [{},
                      {},
                       {'text-align' : 'right'} 
                     ]
             });

          }
        } 
      },
      {
        id : "Table6",
        col_defs : [ "int",
              "str",
              "date",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int"
            ],
        coverage : "historical",
        headers : { "en" : [ [ { "colspan" : 3,
                      "header" : ""
                    },
                    { "colspan" : 3,
                      "header" : "Personnel"
                    },
                    { "colspan" : 3,
                      "header" : "Other Operating Costs"
                    },
                    { "colspan" : 3,
                      "header" : "Revenues"
                    },
                    { "colspan" : 3,
                      "header" : "Total Spending"
                    }
                  ],
                  [ "Vote (2011-12)",
                    "Description",
                    "Year",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*",
                    "Authority",
                    "Expenditures",
                    "Gross Lapse*"
                  ]
                ],
              "fr" : [ [ { "colspan" : 3,
                      "header" : ""
                    },
                    { "colspan" : 3,
                      "header" : "Personnel"
                    },
                    { "colspan" : 3,
                      "header" : "Autres coût de fonctionnement"
                    },
                    { "colspan" : 3,
                      "header" : "Revenus"
                    },
                    { "colspan" : 3,
                      "header" : "Total"
                    }
                  ],
                  [ "Crédit (2011-12)",
                    "Description",
                    "Année",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*",
                    "Autorité",
                    "Dépenses",
                    "Fonds Périmés Bruts*"
                  ]
                ]
            },
          name : { 
            en : "6 - Expenditures by Operating Allotment",
            fr : "6 - Dépenses de fonctionnement par affectation"
          },
          title : { 
            en : "Table 6 - Expenditures by Operating Allotment from 2007-08 to 2011-12 ($000)",
            fr : "Tableau 6 - Dépenses de fonctionnement par affectation de 2007-08 à 2011-12 ($000) "
          }
          ,key : [0,1,2]
          ,table_view : { 
            hide_col_ids: [3,5,6,8,9,11]
            ,sum_cols: _.range(3, 15)
            ,min_func : TABLES.add_ministry_year_sums
            ,init_row_data : function(){
              var txt = this.gt("sub_avg");
              var totals = GROUP.group_rows(
                  this.row_data,
                  function(row){ return row[2]},
                  {txt_cols : {0 : this.gt('year_total'),
                                2 : function(g){return _.first(g)[2]} },
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows});
              this.merge_group_results(
                GROUP.group_rows(
                  this.row_data,
                  function(row){ return [row[0],row[1]]},
                  {txt_cols : {0 : txt,
                                1 : function(g){return _.first(g)[1]} },
                    func_cols : this.sum_cols,
                    func : GROUP.avg_rows}));
              totals = _.map(totals,function(total){
                this.summary_rows.push(total[1]);
                return total[1]
              },this);
              this.row_data = this.row_data.concat(totals);
            }
          }
        ,mapper : {
          to : function (row) {
              if (row[1]){
                row[1] = votes[this.def['coverage']][row[1]][this.lang];
              }
              return row; // take out dept id since don't need anymore AND return row
            },
            make_filter : make_historical_filter 
        }
        ,mini_view : {
          prep_data : function(){
            var col = 'Personnel-Expenditures';
            var top_headers = this.def.headers[this.lang][0];
            var ttf = APP.types_to_format['big-int'];
            var reduced = _.map(this.data, function(row){
              return _.pick(row,'Year',col);
            });
            var groups = _.groupBy(reduced, "Year");
            this.rows = _.map(groups, function(group){
              return [_.first(group)['Year'],
                      ttf(_.reduce(group, function(a,b){
                         return a + b[col];
                      },0))];
            });

          }
          ,render_data : function(){
             this.content = TABLES.build_table({
               headers : [['',"Personnel"]],
               body : this.rows,
               css : [{},
                       {'text-align' : 'right'} 
                     ]
             });

          }  
        } 
      },
      {
        id : "Table7",
        col_defs : [ "int",
              "str",
              "date",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int",
              "big-int"
            ],
          coverage : "historical",
          headers : { en : [ 
                  [ "Vote (2011-12) / Statutory",
                    "Description",
                    "Year",
                    "Personnel",
                    "Transportation and communication",
                    "Information",
                    "Professional and special services",
                    "Rentals",
                    "Repair and maintenance",
                    "Utilities, materials, and supplies",
                    "Acquisition of land, buildings, and works",
                    "Acquisition of machinery and equipment",
                    "Transfer Payments",
                    "Public Debt Charges",
                    "Other subsidies and payments",
                    "Total Gross Expenditues",
                    "External Revenues*",
                    "Internal Revenues**",
                    "Total Net Expenditues"
                  ]
                ],
              "fr" : [ 
                  [ "Crédit (2011-12) / Légis.",
                    "Description",
                    "Année",
                    "Personnel",
                    "Transports et communications",
                    "Information",
                    "Services professionels et speciaux",
                    "Location",
                    "Services de réparation et d'entretien",
                    "Services publics, fournitures et approv.",
                    "Acquisition de terrains, batiments et ouvrages",
                    "Acquisition de materiel et d'outillage",
                    "Paiements de transfert",
                    "Frais de la dette",
                    "Autres subventions et paiements",
                    "Total des dépenses brutes",
                    "Revenus internes*",
                    "Revenus externes**",
                    "Total des dépenses nettes"
                  ]
                ]
            },
          name : { 
            en : "7 - Expenditures by Standard Object",
            fr : "7 - Dépenses par article courant"
          },
          title : { 
            en : "Table 7 - Expenditures by Standard Object from 2007-08 to 2011-12 ($000)",
            fr : "Tableau 7 - Dépenses par article courant de 2007-08 à 2011-12 ($000)"
          }
          ,key : [0,1,2]
          ,table_view : { 
            hide_col_ids: [4,5,6,7,8,9,10,,11,13,14]
            ,sum_cols: _.range(3, 18)
            ,min_func : TABLES.add_ministry_year_sums
            ,init_row_data : function(){
              var txt = this.gt("sub_avg");
              var totals = GROUP.group_rows(
                  this.row_data,
                  function(row){ return row[2]},
                  {txt_cols : {0 : this.gt('year_total'),
                                2 : function(g){return _.first(g)[2]} },
                    func_cols : this.sum_cols,
                    func : GROUP.sum_rows});
              // not sure why this is here
              _.each(totals,
                function(row){

                },
                this);
              this.merge_group_results(
                GROUP.group_rows(
                  this.row_data,
                  function(row){ return [row[0],row[1]]},
                  {txt_cols : {0 : txt,
                                1 : function(g){return _.first(g)[1]} },
                    func_cols : this.sum_cols,
                    func : GROUP.avg_rows}));
              totals = _.map(totals,function(total){
                this.summary_rows.push(total[1]);
                return total[1]
              },this);
              this.row_data = this.row_data.concat(totals);
            }
          }
          ,mapper : {
            to : function (row) {
              if (row[0] == 'S') {
                row[0] = '';
              }
              if (row[1]){
                row[1] = votes[this.def['coverage']][row[1]][this.lang];
              }
              return row; // take out dept id since don't need anymore AND return row
            }
            ,make_filter : make_historical_filter 
          }
        ,mini_view : {
          prep_data : function(){
           var ttf = APP.types_to_format['big-int'];
           var sos = [
              "Personnel",                                 
              "Transportation and communication",          
              "Information",                               
              "Professional and special services",         
              "Rentals",                                   
              "Repair and maintenance",                    
              "Utilities, materials, and supplies",        
              "Acquisition of land, buildings, and works", 
              "Acquisition of machinery and equipment",    
              "Transfer Payments",                         
              "Public Debt Charges",                       
              "Other subsidies and payment" ];
            var reduced = _.map(this.data, function(row){
              return _.pick.apply(this,[row,'Year'].concat(sos)); 
            });
            var groups = _.groupBy(reduced, "Year");
            var reduced_groups = _.map(groups, function(group){
              var total =  _.object(_.map(sos,function(x){
                return [x,_.reduce(_.pluck(group,x),
                  function(a,b){ return a+b})]}));
              total['Year'] = _.first(group)['Year'];
              return total;
            });
            this.rows = _.map(reduced_groups, function(rg){
              var max = _.max(rg);
              var key = _.invert(rg)[max];
              return [rg['Year'],this.to_lang(key),ttf(max)];
            },this);
          }
          ,render_data : function(){
             this.content = TABLES.build_table({
               headers : [['',this.gt("so"),this.gt("expenditures")]],
               body : this.rows,
               css : [{},
                      {},
                       {'text-align' : 'right'} 
                     ]
             });

          }
        } 
     }]);
  });
});
