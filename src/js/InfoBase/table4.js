(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
    "id": "table4",
    "data_type" : "financial_data",
    "coverage": "historical",
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
       _.each(['{{last_year_3}}','{{last_year_2}}','{{last_year}}'],
           function(header){
             this.add_col(header)
               .add_child([
                   {
                     "type":"big-int",
                     "nick" : header+"auth",
                     "header":{
                       "en":"Total budgetary authority available for use",
                       "fr":"Autorisations budgétaires disponibles pour l'emploi"
                     }
                   },
                   {
                     "type":"big-int",
                     "nick" : header+"exp",
                     "header":{
                       "en":"Expenditures",
                       "fr":"Dépenses"
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
      if (this.lang == 'en') {
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
    }
    });

  });
})();
