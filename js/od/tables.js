$(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var MAPPERS = ns('MAPPERS');

  var bold = function(s){
    return $('<strong>').html(s)
  };

  TABLES.template_args = {
    'year' : '2012-13',
    'last_year' : '2011-12',
    'last_year_2' : '2010-11',
    'last_year_3' : '2009-10',
    'month' : 9
  };

  APP.dispatcher.on("load_tables",function(app){

    var m = TABLES.m;

    TABLES.tables.add([{
      id: 'table1',
      col_defs : [ "int",
                    "str",
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
      headers : {"en" :[
      [
        { "colspan" : 2,
        "header" : ""
        },
        { "colspan" : 12,
        "header" : "{{year}} Authorities"
        },
        { "colspan" : 2,
        "header" : "{{year}} Expenditures"
        },
        { "colspan" : 3,
        "header" : "{{last_year}}"
        }
      ],[
        "Vote/Statutory",
        "Description",
        "Multi-year Authorities",
        "Main Estimates",
        "SE(A)",
        "SE(B)",
        "SE(C)",
        "Transfers from TB Vote 5 Gov. Contengencies",
        "Transfers from TB Vote 10 Gov. Wide Initiatives ",
        "Transfers from TB Vote 15 Compens. Adjustments  ",
        "Transfers from TB Vote 25 OBCF  ",
        "Transfers from TB Vote 30 Paylist Requirements ",
        "Transfers from TB Vote 33 CBCF ",
        "Total available for use for the year ending March 31,{{year}}",
        "Used during the quarter ended {{month}}-{{year}}",
        "Year to date used at quarter-end",
        "Total available for use for the year ending March 31,{{last_year}}",
        "Used during the quarter ended {{month}}-{{last_year}} ",
        "Year to date used at quarter-end"
      ]],
        "fr": [ [
        { "colspan" : 2,
        "header" : ""
        },
        { "colspan" : 12,
        "header" : "{{year}} Autoritiés"
        },
        { "colspan" : 2,
        "header" : "{{year}} Dépenses"
        },
        { "colspan" : 3,
        "header" : "{{last_year}}"
        }
      ],[
        "Crédit/Statutaire",
        "Description", 
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
        "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{year}}",
        "Crédits utilisés pour le trimestre terminé le {{month}}-{{year}}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{last_year}}",
        "Crédits utilisés pour le trimestre terminé le {{month}}-{{last_year}}",
        "Cumul des crédits utilisés à la fin du trimestre"
        ]]},
      link : {
        "en" : "",
        "fr" : ""
      },
      name : { "en" : "Statement of Authorites and Expenditures",
                "fr" : "État des autorisations et Dépenses"
              },
      title : { "en" : "Statement of Authorites and Expenditures",
                "fr" : "État des autorisations et Dépenses"
                }
      ,key : [0,1]
      ,mapper : {
        to : function(row){
          if (row[1] && _.isNumber(row[1]) ){
            row.splice(2,1,votes[this.def['coverage']][row[0]][row[1]][this.lang]);
          }
          else {
            row.splice(2,1,'');
          }
          // remove acronym
          return _.tail(row); 
        }
        ,make_filter : function(source_row){
          return function(candidate_row){
            return (source_row[2]  == candidate_row[2]);
          };
        }
      }
      ,table_view : { 
        hide_col_ids : [2,3,4,5,6,7,8,9,10,11,12]
        ,sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
          var ttf = APP.types_to_format['big-int'];
          var auth = "Total available for use for the year ending March 31,{{year}}";
          var exp = "{{year}} Expenditures-Year to date used at quarter-end";
          var auth_total = _.reduce(
              _.pluck(this.data,auth),
              function(x,y){return x+y})/1000;
          var exp_total = _.reduce(
              _.pluck(this.data,exp),
              function(x,y){return x+y})/1000;
          this.rows = [
            [$('<strong>').html(m(this.to_lang(auth))+ ' ($000)'), ttf(auth_total,this.lang) ],
            [$('<strong>').html(this.to_lang(exp)+ ' ($000)'), ttf(exp_total,this.lang) ]
          ];
        }
        ,render_data : function(){
          this.content = TABLES.array_to_grid(
              [2,1],
              this.rows);
        }
      },
      graph_view : {
        prep_data : function(){
        }
        ,render : function(){
         }
      }
    },
    {
      id: "table2",
      col_defs : ["str",
        "big-int",
        "big-int",
        "big-int",
        "big-int"],
      coverage : "in_year",
      headers : {"en" :[[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{{year}}"
        },
        { "colspan" : 2,
          "header" : "{{last_year}}"
        }],
        [
          "Standard Object",
        "Expended during the quarter ended {{month}}-{{year}}",
        "Year to date used at quarter-end",
        "Expended during the quarter ended {{month}}-{{last_year}}",
        "{{last_year}} Year to date used at quarter-end"
        ]],
        "fr": [[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{{year}}"
        },
        { "colspan" : 2,
          "header" : "{{last_year}}"
        }],
        [
          "Article Courant",
        "Dépensées durant le trimestre terminé le {{month}}-{{year}}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Dépensées durant le trimestre terminé le {{month}}-{{last_year}}",
        "Cumul des crédits utilisés à la fin du trimestre"
        ]]},
      link : {
        "en" : "",
        "fr" : ""
      },
      name : { "en" : "Departmental budgetary expenditures by Standard Object",
        "fr" : "Dépenses ministérielles budgétaires par article courant"
      },
      title : { "en" : "Departmental budgetary expenditures by Standard Object ($000)",
        "fr" : "Dépenses ministérielles budgétaires par article courant ($000)"
      }
      ,key : [0]
      ,mapper : {
        to : function(row){
          row.splice(1,1,sos[row[1]][this.lang]);
          return _.tail(row)
        }
        ,make_filter : function(source_row){
          return _.bind(function(candidate_row){
            return ( source_row[1] == candidate_row[1]);
          },this);
        }
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
          var ttf = APP.types_to_format['big-int'];
          var col = "Expended during the quarter ended {{month}}-{{year}}";
          var data = _.sortBy(this.data, function(d){
            return -d[col]
          });    
          var first = data.shift();
          var second = data.shift();
          var third = data.shift();
          var rest = _.reduce(data, function(x,y){
             return x + y[col];
          },0);
          this.rows = [
            ['Top Standard Objects','($000)'],
            [first["Standard Object"],first[col]],
            [second["Standard Object"],second[col]],
            [third["Standard Object"],third[col]],
            [this.gt("remainder"),rest]
          ];
          this.rows = _.map(this.rows, function(row){
            if (_.isNumber(row[1])){
              return [$('<strong>').html(row[0]),
                      ttf(row[1]/1000)];
            } else {
              return [$('<strong>').html(row[0]),
                      row[1]]
            }
          });
        }
        ,render_data : function(){
          this.content = TABLES.array_to_grid(
              [2,1],
              this.rows);
        }
      },
      graph_view : {
        prep_data : function(){
        }
        ,render : function(){
        }
      }
    },
    {
     id: "table3",
      "col_defs" : ["wide-str",
        "big-int",
        "big-int",
        "big-int",
        "big-int"],
      "coverage" : "in_year",
      "headers" : { "en" :[[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{{year}}"
        },
        { "colspan" : 2,
          "header" : "{{last_year}}"
        }],
        [
        "Program",
        "Expended during the quarter ended {{month}}-{{year}}",
        "Year to date used at quarter-end",
        "Expended during the quarter ended {{month}}-{{last_year}}",
        "Year to date used at quarter-end"
        ]],
        "fr": [[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{{year}}"
        },
        { "colspan" : 2,
          "header" : "{{last_year}}"
        }],
        [
          "Program",
        "Dépensées durant le trimestre terminé le {{month}}-{{year}}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Dépensées durant le trimestre terminé le {{month}}-{{last_year}}",
        "Cumul des crédits utilisés à la fin du trimestre"
        ]]
      },
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Departmental budgetary expenditures by Program",
        "fr" : "Dépenses ministérielles budgétaires par program"
      },
      "title" : { "en" : "Departmental budgetary expenditures by Program ($000)",
        "fr" : "Dépenses ministérielles budgétaires par program ($000)"
      }
      ,"key" : [0] 
      ,mapper : {
        to : function(row){
          if (this.lang == 'en'){
            row.splice(2,1);
          } else {
            row.splice(1,1);
          }
          return _.tail(row);
        }
        ,make_filter : function(source_row){
          if (source_row[1] === 'Internal Services'){
            return function(candidate_row){ 
              return candidate_row[1] == 'Internal Services'
            }
          }else {
            return function(candidate_row){
              return (candidate_row[1] != 'Internal Services' &&
                      candidate_row[0] != 'ZGOC');
            }
          }
        }
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
          var ttf = APP.types_to_format['big-int'];
          var col = "Expended during the quarter ended {{month}}-{{year}}";
          var data = _.sortBy(this.data, function(d){
            return -d[col]
          });    
          var first = data.shift();
          var second = data.shift();
          var rest = _.reduce(data, function(x,y){
             return x + y[col];
          },0);
          this.rows = [
            ['Top Programs','($000)'],
            [first["Program"],first[col]],
            [second["Program"],second[col]],
            [this.gt("remainder"),rest]
          ];
          this.rows = _.map(this.rows, function(row){
            if (_.isNumber(row[1])){
              return [$('<strong>').html(row[0]),
                      ttf(row[1]/1000)];
            } else {
              return [$('<strong>').html(row[0]),
                      row[1]]
            }
          });
        }
        ,render_data : function(){
          this.content = TABLES.array_to_grid(
              [2,1],
              this.rows);
        }
      },
      graph_view : {
        prep_data : function(){
        }
        ,render : function(){
        }
      }
    },
    {
      id: "table4",
      col_defs : [ 'int',
        "str",
        "date",
        "big-int",
        "big-int",
        "big-int",
        "big-int"
      ],
      "coverage" : "historical",
      "headers" : {"en" :[[
          "Vote {{last_year}}/ Statutory",
          "Description",
          "Year",
          "Total budgetary authority available for use",
          "Budgetary authority used in the current year",
          "Authority lapsed (or over-expended)",
          "Authority available for use in subsequent years"
        ]],
        "fr": [[
          "Crédit {{last_year}} / Légis.",
          "Description",
          "Année",
          "Autorisation budgétaire totale utilisable",
          "Autorisation budgétaire utilisée dans l'exercice en cours",
          "Autorisation expirée (ou dépassée)",
          "Autorisation prête pour usage dans les exercices financiers suivants"
        ]]},
      "link" : {
        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name" : { "en" : "Authorities and Expenditures",
        "fr" : "Autorisations et dépenses"
      },
      "title" : { "en" : "Authorities and Actual Expenditures ($000)",
        "fr" : "Autorisations et dépenses réelles ($000)"
      }
      ,"key" : [0,1,2]
      ,mapper : {
        to : function(row){
          if (row[1] && _.isNumber(row[1]) ){
            row.splice(2,1,votes[this.def['coverage']][row[2]][this.lang]);
          }
          else {
            row.splice(2,1,'');
          }
          // remove acronym
          return _.tail(row);
        }
        ,make_filter : function(source_row){
          var vote_type = source_row[2];
          var year = source_row[3];
          return function(candidate_row){
            return (candidate_row[2] == vote_type &&
                    candidate_row[3] == year);
          }
        }
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
          var ttf = APP.types_to_format['big-int'];
          var f_years = _.groupBy(this.data, function(data){
            return data["Year"];
          });
          f_years = _.map(f_years, function(f_year){
            return [f_year[0]['Year'], 
                    _.reduce(f_year, function(x,y){
                      return x + y["Total budgetary authority available for use"];
                    },0),
                    _.reduce(f_year, function(x,y){
                      return x + y["Budgetary authority used in the current year"];
                    },0),
                    ];
          });
          this.rows = _.map(f_years,function(fyear){
            return [fyear[0],
                    ttf(fyear[1]/1000),
                    ttf(fyear[2]/1000)];
          });
          this.rows = _.sortBy(this.rows, function(fyear){
            return fyear[0];
          }).reverse();
          this.rows.unshift([
            $('<strong>').html(this.gt("year")),
            $('<strong>').html(this.gt("authorities") + ' ($000)'),
            $('<strong>').html(this.gt("expenditures")+ ' ($000)')
          ]);
        }
        ,render_data : function(){
          this.content = TABLES.array_to_grid(
              [1,1,1],
              this.rows);
        }
      },
      graph_view : {
        prep_data : function(){
        }
        ,render : function(){
        }
      }
    },
    {
      id: "table5",
      "col_defs" : ["str",
        "big-int",
        "big-int",
        "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
        "Standard Object",
        "{{last_year}}",
        "{{last_year_2}}",
        "{{last_year_3}}"
        ]],
        "fr": [[
          "Article courtant",
        "{{last_year}}",
        "{{last_year_2}}",
        "{{last_year_3}}"
        ]]},
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Expenditures by Standard Object",
        "fr" : "Dépenses par article courant"
      },
      "title" : { "en" : "Expenditures by Standard Object from {{last_year_3}} to {{last_year}} ($000)",
        "fr" : "Dépenses par article courant de {{last_year_3}} à {{last_year}} ($000)"
      }
      ,"key" : [0]
      ,mapper : {
        to : function(row){
          row.splice(1,1,sos[row[1]][this.lang]);
          return _.tail(row)
        }
        ,make_filter : function(source_row){
          return function(candidate_row){
            return (candidate_row[1] == source_row[1]);
          }
        }
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
          var ttf = APP.types_to_format['big-int'];
          var last_year = _.map(this.data, function(d){
            return [d["Standard Object"],d['{{last_year}}']]
          });
          var last_year_2 = _.map(this.data, function(d){
            return [d["Standard Object"],d['{{last_year_2}}']]
          });
          var last_year_3 = _.map(this.data, function(d){
            return [d["Standard Object"],d['{{last_year_3}}']]
          });
          var top_last_year = _.sortBy(last_year, function(d){
            return -d[1];
          }).shift();
          var top_last_year_2 = _.sortBy(last_year_2, function(d){
            return -d[1];
          }).shift();
          var top_last_year_3 = _.sortBy(last_year_3, function(d){
            return -d[1];
          }).shift();
          this.rows = [
           [m('{{last_year}}'),top_last_year[0] + ' - '+ ttf(top_last_year[1]/1000)],
           [m('{{last_year_2}}'),top_last_year_2[0]+ ' - '+ ttf(top_last_year_2[1]/1000)],
           [m('{{last_year_3}}'),top_last_year_3[0]+ ' - '+ ttf(top_last_year_3[1]/1000)]
          ];
          this.rows.unshift([
            bold(this.gt("year")),
            bold(this.gt("so")+' ($000)'),
          ]);
        }
        ,render_data : function(){
          this.content = TABLES.array_to_grid(
              [1,2],
              this.rows);
        }
      },
      graph_view : {
        prep_data : function(){
        }
        ,render : function(){
        }
      }
    },
    {
      id: "table6",
      "col_defs" : ["wide-str",
      "big-int",
      "big-int",
      "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
          "Program",
          "{{last_year}}",
          "{{last_year_2}}",
          "{{last_year_3}}"
        ]],
        "fr": [[
          "Program",
          "{{last_year}}",
          "{{last_year_2}}",
          "{{last_year_3}}"
        ]]},
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Expenditures by Program",
        "fr" : "Dépenses par article courant"
      },
      "title" : { "en" : "Expenditures by Program from {{last_year_3}} to {{last_year}} ($000)",
        "fr" : "Dépenses par Program de {{last_year_3}} à {{last_year}} ($000)"
      }
      ,"key" : [0]
      ,mapper : {
        to : function(row){
          if (this.lang == 'en'){
            row.splice(2,1);
          } else {
            row.splice(1,1);
          }
          return _.tail(row);
        }
        ,make_filter : function(source_row){
          if (source_row[1] === 'Internal Services'){
            return function(candidate_row){ 
              return candidate_row[1] == 'Internal Services'
            }
          }else {
            return function(candidate_row){
              return (candidate_row[1] != 'Internal Services' &&
                      candidate_row[0] != 'ZGOC');
            }
          }
        }
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum

        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data: function(){
          var ttf = APP.types_to_format['big-int'];
          var last_year = _.map(this.data, function(d){
            return [d["Program"],d['{{last_year}}']]
          });
          var last_year_2 = _.map(this.data, function(d){
            return [d["Program"],d['{{last_year_2}}']]
          });
          var last_year_3 = _.map(this.data, function(d){
            return [d["Program"],d['{{last_year_3}}']]
          });
          var top_last_year = _.sortBy(last_year, function(d){

            return -d[1];
          }).shift();
          var top_last_year_2 = _.sortBy(last_year_2, function(d){
            return -d[1];
          }).shift();
          var top_last_year_3 = _.sortBy(last_year_3, function(d){
            return -d[1];
          }).shift();
          this.rows = [
           [m('{{last_year}}'),top_last_year[0] + ' - '+ ttf(top_last_year[1]/1000)],
           [m('{{last_year_2}}'),top_last_year_2[0]+ ' - '+ ttf(top_last_year_2[1]/1000)],
           [m('{{last_year_3}}'),top_last_year_3[0]+ ' - '+ ttf(top_last_year_3[1]/1000)]
          ];
          this.rows.unshift([
            bold(this.gt("year")),
            bold(this.gt("program")+' ($000)'),
          ]);
        }
        ,render_data : function(){
          this.content = TABLES.array_to_grid(
              [1,2],
              this.rows);
        }
      },
      graph_view : {
        prep_data : function(){
        }
        ,render : function(){
        }
      }
    }]);

  });

});

