(function (root) {

  var APP = ns('APP');
  var TABLES = ns('TABLES');

  TABLES.template_args = {
      'common': {
          'in_year_short': '2014',
          'qfr_last_year_short': '2013',
          'last_year_short': '2013',
          'last_year_2_short': '2012',
          'last_year_3_short': '2011',
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
          'last_year_3': '2010-11'
      },
      'fr': {
          'month_name': 'février',
          'qfr_month_name': '31 décembre',
          'in_year': '2013‒2014',
          'qfr_last_year': '2012‒2013',
          'last_year': '2012‒2013',
          'last_year_2': '2011‒2012',
          'last_year_3': '2010‒2011'
      }
  };
  
  TABLES.years =[ "{{last_year_3}}",
                '{{last_year_2}}',
               '{{last_year}}' ] ;

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

  TABLES.standard_object_dimension =  function(options) {
       var lang = options.app.state.get("lang"),
           gt = options.app.get_text;
      return function(d){
        if (d.dept === 'FIN' && d.so === sos[10][lang]) {
          return "prov";
        }
        if (d.dept === 'HRSD' && d.so === sos[10][lang]) {
          return "person";
        }
        if (d.dept === 'FIN' && d.so === sos[11][lang]) {
          return "debt";
        }
        if (d.dept === 'ND'){
          return 'defense';
        }
        if (d.so === sos[10][lang]){
          return 'other_trsf';
        }
        if (window.depts[d.dept].type.en === "Crown Corporations"){
          return "crown";
        }
        return 'op';
      };
  };

})(this);
