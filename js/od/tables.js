(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');
  var col = Backbone.Collection.extend({});
  TABLES.tables = new col;

  APP.dispatcher.on("app_ready", function(app){

    var BTV = TABLES.BaseTableView;
    var BGV = GRAPHS.BaseGraphView;

    TABLES.tables.on("add", function(table){

      var id = table.get("id");

      _.each(depts,function(org){
        org['mapped_data'][id] = {};
        org['mapped_objs'][id] = {};
      });

      // setup the mappers
      MAPPERS.maps[table.get("id")] = table.get("mapper");
      table.set('mapper' , {
       'en' : new MAPPERS.mapper('en',table.attributes,id)
       ,'fr' : new MAPPERS.mapper('fr',table.attributes,id)
      }); 

      // setup the table views
      table.set('table_view', BTV.extend(table.get('table_view')));

      // setup lookups for the headers
      table.set("header_lookup" , {
        'en' : {},
        'fr' : {}
      });

      _.each(['en','fr'], function(lang){
        _.each(_.last(table.get('headers')[lang]),function(header,index){
           table.get('header_lookup')[lang][header] = index;
        });
      });

      app.state.on("change:other_orgs change:lang", function(state){
        if (state.get('other_orgs')){
          var lang = app.state.get("lang");
          var org = app.state.get('dept');

          mapper = table.get('mapper')[lang];

          if (_.isUndefined(org["mapped_data"][id][lang])) {
            org["mapped_data"][id][lang] =  mapper.map(org['tables'][id]);
          }

          var headers = _.last(table.get('headers')[lang]);

          if (_.isUndefined(org["mapped_objs"][id][lang])) {
            org["mapped_objs"][id]['en'] = _.map(org["mapped_data"][id]['en'],
              function(row){
                return _.object(headers,row);
              }
            );
            org["mapped_objs"][id]['fr'] = _.map(org["mapped_data"][id]['fr'],
              function(row){
                return _.object(headers,row);
              }
            );
          }

          APP.dispatcher.trigger("mapped",table);
        }
      });
    });

    APP.dispatcher.on("mapped", function(table){
        var mtv = new TABLES.miniTableVew({
          app : app,
          def: table.attributes
        });
        mtv.render();

        mtv.$el.find('a.details').on("click", function(event){
          // move the mini views out of the way and replace with larger 
          // table

          var dv = new APP.DetailsView({
            app : app,
            def: table.attributes
          });

          dv.render();

          $('.panels').hide(500);
        });
    });

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
        "header" : "{year} Authorities"
        },
        { "colspan" : 2,
        "header" : "{year} Expenditures"
        },
        { "colspan" : 3,
        "header" : "{last_year}"
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
        "Total available for use for the year ending March 31,{year}",
        "Used during the quarter ended {month}-{year}",
        "Year to date used at quarter-end",
        "Total available for use for the year ending March 31,{last_year}",
        "Used during the quarter ended {month}-{last_year} ",
        "Year to date used at quarter-end",
      ]],
        "fr": [ [
        { "colspan" : 2,
        "header" : ""
        },
        { "colspan" : 12,
        "header" : "{year} Autoritiés"
        },
        { "colspan" : 2,
        "header" : "{year} Dépenses"
        },
        { "colspan" : 3,
        "header" : "{last_year}"
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
        "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {year}",
        "Crédits utilisés pour le trimestre terminé le {month}-{year}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {last_year}",
        "Crédits utilisés pour le trimestre terminé le {month}-{last_year}",
        "Cumul des crédits utilisés à la fin du trimestre",
        ]]},
      link : {
        "en" : "",
        "fr" : ""
      },
      name : { "en" : "Statement of Authorites and Expenditures",
                "fr" : "État des autorisations et Dépenses"
              },
      title : { "en" : "",
                "fr" : ""
                }
      ,key : [0]
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
        ,make_filter : function(source_row){}
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
          var auth = "Total available for use for the year ending March 31,{year}";
          var exp = "Year to date used at quarter-end";
          var auth_total = _.reduce(
              _.pluck(this.data,auth),
              function(x,y){return x+y})/1000;
          var exp_total = _.reduce(
              _.pluck(this.data,exp),
              function(x,y){return x+y})/1000;
          this.rows = [
            [$('<strong>').html(this.to_lang(auth)), ttf(auth_total,this.lang) + ' (k)'],
            [$('<strong>').html(this.to_lang(exp)), ttf(exp_total,this.lang) + ' (k)']
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
    },{
      id: "table2",
      col_defs : ["wide-str",
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
          "header" : "{year}"
        },
        { "colspan" : 2,
          "header" : "{last_year}"
        }],
        [
          "Standard Object",
        "Expended during the quarter ended {month}-{year}",
        "Year to date used at quarter-end",
        "Expended during the quarter ended {month}-{last_year}",
        "Year to date used at quarter-end",
        ]],
        "fr": [[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{year}"
        },
        { "colspan" : 2,
          "header" : "{last_year}"
        }],
        [
          "Article Courant",
        "Dépensées durant le trimestre terminé le {month}-{year}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Dépensées durant le trimestre terminé le {month}-{last_year}",
        "Cumul des crédits utilisés à la fin du trimestre",
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
         return row
        }
        ,make_filter : function(source_row){}
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
          var expenditures = _.pluck(this.data,"Year to date used at quarter-end");
          this.rows = [
          [ ]
          ]
        }
        ,render_data : function(){
          this.content = ''
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
        "big-int",
        "big-int",
        "big-int"],
      "coverage" : "in_year",
      "headers" : { "en" :[[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{year}"
        },
        { "colspan" : 2,
          "header" : "{last_year}"
        }],
        [
          "Program",
        "Expended during the quarter ended {month}-{year}",
        "Year to date used at quarter-end",
        "Expended during the quarter ended {month}-{last_year}",
        "Year to date used at quarter-end",
        ]],
        "fr": [[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 2,
          "header" : "{year}"
        },
        { "colspan" : 2,
          "header" : "{last_year}"
        }],
        [
          "Program",
        "Dépensées durant le trimestre terminé le {month}-{year}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Dépensées durant le trimestre terminé le {month}-{last_year}",
        "Cumul des crédits utilisés à la fin du trimestre",
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
          return row;
        }
        ,make_filter : function(source_row){}
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
        }
        ,render_data : function(){
          this.content = ''
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
      col1_defs : [ 'int',
        "wide-str",
        "date",
        "big-int",
        "big-int",
        "big-int",
        "big-int",
      ],
      "coverage" : "historical",
      "headers" : {"en" :[[
        "Vote {last_year}/ Statutory",
        "Description",
        "Year",
        "Total budgetary authority available for use",
        "Budgetary authority used in the current year",
        "Authority lapsed (or over-expended)",
        "Authority available for use in subsequent years",
        ]],
        "fr": [[
          "Crédit (2011-12) / Légis.",
        "Description",
        "Année",
        "Autorisation budgétaire totale utilisable",
        "Autorisation budgétaire utilisée dans l'exercice en cours",
        "Autorisation expirée (ou dépassée)",
        "Autorisation prête pour usage dans les exercices financiers suivants",
        ]]},
      "link" : {
        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name" : { "en" : "Authorities and Actual Expenditures",
        "fr" : "Autorisations et dépenses réelles"
      },
      "title" : { "en" : "Authorities and Actual Expenditures ($000)",
        "fr" : "Autorisations et dépenses réelles ($000)"
      }
      ,"key" : [0,1,2]
      ,mapper : {
        to : function(row){
          return row;
        }
        ,make_filter : function(source_row){}
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
        }
        ,render_data : function(){
          this.content = ''
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
      "col_defs" : ["wide-str",
        "date",
        "big-int",
        "big-int",
        "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
        "Standard Object",
        "{last_year}",
        "{last_year_2}",
        "{last_year_3}",
        ]],
        "fr": [[
          "Article courtant",
        "{last_year}",
        "{last_year_2}",
        "{last_year_3}",
        ]]},
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Expenditures by Standard Object",
        "fr" : "Dépenses par article courant"
      },
      "title" : { "en" : "Expenditures by Standard Object from {last_year_3} to {last_year} ($000)",
        "fr" : "Dépenses par article courant de {last_year_3} à {last_year} ($000)"
      }
      ,"key" : [0]
      ,mapper : {
        to : function(row){
          return row;
        }
        ,make_filter : function(source_row){}
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
        }
        ,render_data : function(){
          this.content = ''
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
      "date",
      "big-int",
      "big-int",
      "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
          "Program",
          "{last_year}",
          "{last_year_2}",
          "{last_year_3}",
        ]],
        "fr": [[
          "Program",
          "{last_year}",
          "{last_year_2}",
          "{last_year_3}",
        ]]},
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Expenditures by Program",
        "fr" : "Dépenses par article courant"
      },
      "title" : { "en" : "Expenditures by Program from {last_year_3} to {last_year} ($000)",
        "fr" : "Dépenses par Program de {last_year_3} à {last_year} ($000)"
      }
      ,"key" : [0]
      ,mapper : {
        to : function(row){
          return row;
        }
        ,make_filter : function(source_row){}
      }
      ,table_view : { 
        sum_cols : []
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
        }
      }
      ,mini_view : {
        prep_data : function(){
        }
        ,render_data : function(){
          this.content = ''
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

})();

  //fmt = functools.partial(str.format,**dict(
  //  year = year,
  //  last_year=year-1,
  //  last_year_2 = year-2,
  //  last_year_3 = year-3,
  //  month = month
  //))

  //for table in tables:
  //  for lang in ("en","fr"):

  //    for h in ('title','name'):
  //      tables[table][h][lang] = fmt(tables[table][h][lang])

  //    for header_i,_ in enumerate(tables[table]['headers'][lang]):
  //      ref = tables[table]['headers'][lang][header_i]
  //      for i,col in enumerate(ref):
  //        if isinstance(ref[i],dict):
  //          ref[i]['header'] =  fmt(ref[i]['header'])
  //        else:
  //          ref[i] = fmt(ref[i])

  //return tables

