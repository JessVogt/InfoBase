(function (root) {

  var APP = ns('APP');
  var TABLES = ns('TABLES');

  TABLES.coverage = {
    "historical" : {
      "en": "Historical",
      "fr": "Historiques",
      "description" : {
        "en" : "<strong>Historical data</strong> covers the time-fame from {{last_year_5}} to {{last_year}}",
        "fr" : ""
      }
    },
    "in_year" : {
      "en": "Current Year",
      "fr":  "L'exercice courant",
      "description" : {
        "en" : "<strong>Current year</strong> data describes data for this current fiscal year of {{in_year}}",
        "fr" : ""
      }
    },
    "planned" : {
      "en":  "Planned",
      "fr": "Prévues",
      "description" : {
        "en" : "",
        "fr" : ""
      }
    }
  };

  TABLES.data_types = {
    "financial" : {
      "en": "Financial Data",
      "fr": "Données financiéres",
      "description" : {
        "en" : "<strong>Financial data</strong> describes spending authorities voted by Parliament along with the resulting actual expenditures as recorded in the Public Accounts of Canada ",
        "fr" : ""
      }
    },
    "people" : {
      "en":  "People Management Data",
      "fr":  "Gestion des personnes",
      "description" : {
        "en" : "<strong>People Management </strong>data describes the demographics of the employees working in the Federal public service",
        "fr" : ""
      }
    }
  };

  TABLES.template_args = {
      'common': {
          'in_year_short': '2014',
          'qfr_last_year_short': '2013',
          'last_year_short': '2013',
          'last_year_2_short': '2012',
          'last_year_3_short': '2011',
          'last_year_4_short': '2010',
          'last_year_6_short': '2009',
          'month': 9,
          'q': 3
      },
      'en': {
          'month_name': 'February',
          'qfr_month_name': 'Dec 31st',
          'in_year': '2013-14',
          'qfr_last_year': '2012-13',
          'last_year': '2012-13',
          'last_year_2': '2011-12',
          'last_year_3': '2010-11',
          'last_year_4': '2009-10',
          'last_year_5': '2008-09',
      },
      'fr': {
          'month_name': 'février',
          'qfr_month_name': '31 décembre',
          'in_year': '2013‒2014',
          'qfr_last_year': '2012‒2013',
          'last_year': '2012‒2013',
          'last_year_2': '2011‒2012',
          'last_year_3': '2010‒2011',
          'last_year_4': '2009‒2010',
          'last_year_5': '2008‒2009',
      }
  };

  TABLES.years =["{{last_year_5}}",
                 "{{last_year_4}}",
                 "{{last_year_3}}",
                 "{{last_year_2}}",
                 '{{last_year}}',
               ] ;


  APP.dispatcher.once("app_ready",function(app){
    APP.dispatcher.on("info_collection",function(info){
      info.lang = app.lang;
      info.last_years = _.map(TABLES.years, TABLES.m);
    });
  });


  TABLES.vote_stat_dimension = function(options) {
      return function(d){
        if (d.votestattype !== 999) {
          return "voted";
        }
        return 'stat';
      };
  };

  TABLES.major_vote_stat = function(options){
    var app = options.app,
    by_type_and_desc = d3.nest()
      .key(function(d){return d.votestattype;})
      .key(function(d){return d.desc;})
      .map(options.table.data),
    interesting_stats= _.chain(by_type_and_desc['999'])
      .pairs()
      .filter(function(key_grp){ return key_grp[1].length > 3; })
      .map(function(key_grp){return key_grp[0];})
      .value(),
    sort_map = _.chain(by_type_and_desc)
      .pairs()
      .map(function(key_grp){
         return [app.get_text("vstype"+key_grp[0]),+key_grp[0]];
      })
      .object()
      .value();

    options.table.horizontal_group_sort = function(group){
      return +sort_map[group] || 998;
    };
    return function(row){
       if (row.votestattype === 999){
         if (_.contains(interesting_stats, row.desc)) {
           return "(S) "+row.desc;
         }
       }
       if (row.votestattype){
         return app.get_text("vstype"+row.votestattype);
       }
     };
  };

  TABLES.spending_types = [ "prov", "person", "debt", "defense", "other_trsf", "crown", "op" ];

  TABLES.standard_object_dimension =  function(options) {
       var lang = options.app.state.get("lang"),
           gt = options.app.get_text;

      return function(d){
        if (d.dept === 'FIN' && d.so === sos[10][lang]) {
          return TABLES.spending_types[0];
        }
        if (d.dept === 'HRSD' && d.so === sos[10][lang]) {
          return TABLES.spending_types[1];
        }
        if (d.dept === 'FIN' && d.so === sos[11][lang]) {
          return TABLES.spending_types[2];
        }
        if (d.dept === 'ND'){
          return TABLES.spending_types[3];
        }
        if (d.so === sos[10][lang]){
          return TABLES.spending_types[4];
        }
        if (window.depts[d.dept].type.en === "Crown Corporation"){
          return TABLES.spending_types[5];
        }
        return TABLES.spending_types[6];
      };
  };

})(this);
