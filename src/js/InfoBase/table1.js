(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;

    APP.dispatcher.trigger("new_table",
      {"id": 'table1',
        "data_type" : "financial_data",
      "coverage": "in_year",
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
        "en":"Vote / Statutory",
      "fr":"Crédit / Statutaire"
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
          "nick" : "desc",
          "key" : true,
          "header":{
            "en":"Description",
            "fr":"Description"
          }
        }
    ]);
    this.add_col("{{in_year}}")
      .add_child([
          {
            "type":"big-int",
        "nick" : 'thisyearauthorities',
        "header":{
          "en":"Total available for use for the year ending March 31, {{in_year_short}}",
        "fr":"Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{in_year_short}}"
        }
          },
          {
            "type": "big-int",
        "header":{
          "en":"Used during the quarter ended {{qfr_month_name}},{{qfr_last_year_short}}",
        "fr":"Crédits utilisés pour le trimestre terminé le {{qfr_month_name}} {{qfr_last_year_short}}"
        }
          },
          {
            "type":"big-int",
        "nick" : 'thisyearexpenditures',
        "header":{
          "en":"Year to date used at quarter-end",
          "fr":"Cumul des crédits utilisés à la fin du trimestre"
        }
          }
    ]);
    this.add_col("{{qfr_last_year}}")
      .add_child([
          {
            "type":"big-int",
        "nick" : 'lastyearauthorities',
        "header":{
          "en":"Total available for use for the year ending March 31, {{qfr_last_year_short}}",
        "fr":"Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{qfr_last_year_short}}"
        }
          },
          {
            "type":"big-int",
        "header":{
          "en":"Used during the quarter ended {{qfr_month_name}},{{last_year_short}} ",
        "fr":"Crédits utilisés pour le trimestre terminé le {{qfr_month_name}} {{last_year_short}}"
        }
          },
          {
            "type":"big-int",
        "nick" : 'lastyearexpenditures',
        "header":{
          "en":"Year to date used at quarter-end",
          "fr":"Cumul des crédits utilisés à la fin du trimestre"
        }
          }
    ]);
      },
      "queries" : {
        "auth_change" : function(format) {
          // returns last year, this year, and change
          var this_year = "thisyearauthorities", 
          last_year= "lastyearauthorities",
          total = this.sum([this_year, last_year]),
          change =  total[this_year] / (total[last_year])-1,
          data =  [total[this_year],total[last_year],change];
          if (!format){
            return data;
          }
          return this.app.list_formater(['big-int','big-int',"percentage"], data);
        },
        "exp_change" : function(format) {
          // returns last year, this year, and change
          var this_year = "thisyearexpenditures", 
          last_year= "lastyearexpenditures",
          total = this.sum([this_year, last_year]),
          change =  total[this_year] / (total[last_year]) - 1,
          data =  [total[this_year],total[last_year],change];
          if (!format){
            return data;
          }
          return this.app.list_formater(['big-int','big-int',"percentage"], data);
        }
      },
      "dimensions" : {
        "include_in_analytics" : ["voted_stat"],
        "horizontal" : TABLES.major_vote_stat,
        "voted_stat" : TABLES.vote_stat_dimension
      },
      "link": {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name": { "en": "Statement of Authorities and Expenditures",
        "fr": "État des autorisations et des dépenses"
      },
      "title": { "en": "Statement of Authorities and Expenditures ($000)",
        "fr": "État des autorisations et des dépenses (en milliers de dollars)"
      },
      "sort": function (mapped_rows) {
        var grps = _.groupBy(mapped_rows, function (row) { 
          return _.isNumber(row[0]);
        });
        if (_.has(grps, true)) {
          grps[true] = _.sortBy(grps[true], function (row) { 
            return row[0];
          });
        } else {
          grps[true] = [];
        }
        if (_.has(grps, false)) {
          grps[false] = _.sortBy(grps[false], function (row) { 
            return row[1]; 
          });
        } else {
          grps[false] = [];
        }
        return grps[true].concat(grps[false]);
      },
      "mapper": function (row) {
        if (this.lang === 'en') {
          row.splice(6, 1);
        } else {
          row.splice(5, 1);
        }
        return _.tail(row,2);
      },
      mini_view: {
        description: {
          "en": "Total budgetary authorities and expenditures for Q{{q}} {{in_year}} and percent change from the same quarter of the previous fiscal year ({{qfr_last_year}}).",
            "fr": "Total des autorisations et des dépenses budgétaires pour le premier trimestre de {{in_year}} et variation en pourcentage par rapport au même trimestre de l’exercice précédent ({{qfr_last_year}})."
        },
        headers_classes : ['left_text','right_text','right_text','right_text'],
        row_classes : [ 'left_text', 'right_number', 'right_number', 'right_number'],
        prep_data: function () {
          this.rows = [
            ["Authorities"].concat(this.da.auth_change(true)),
          ["Expenditures"].concat(this.da.exp_change(true))
            ];
          this.headers = [_.map(["Type",
              "{{in_year_short}} ($000)",
              "{{qfr_last_year_short}} ($000)",
              this.gt("change") + " (%)"], m)];
        }
      },
      info : function(context){
        var q,c= context,dept;
        if (context.dept){
          dept = context.dept;
          q = this.q(context.dept);
          c.dept_auth_change= q.auth_change(false)[2];
          c.dept_spend_change = q.exp_change(false)[2];
          c.dept_this_year_qfr_auth =  q.sum("thisyearauthorities");
          c.dept_this_year_qfr_spend =  q.sum("thisyearexpenditures");
          c.dept_last_year_qfr_auth =  q.sum("lastyearauthorities");
          c.dept_last_year_qfr_spend = q.sum("lastyearexpenditures");
        }
        q = this.q();
        c.gov_auth_change = q.auth_change(false)[2];
        c.gov_spend_change = q.exp_change(false)[2];
        c.gov_this_year_qfr_auth =  q.sum("thisyearauthorities");
        c.gov_this_year_qfr_spend =  q.sum("thisyearexpenditures");
        c.gov_last_year_qfr_auth =  q.sum("lastyearauthorities");
        c.gov_last_year_qfr_spend = q.sum("lastyearexpenditures");

        APP.dispatcher.once("info_formating_cleanup",function(formated_info, info){
          var d = formated_info;
          var formater = function(x){return app.formater("percentage",x);};
          if (d.dept){
            d.dept_auth_change = formater(info.dept_auth_change);
            d.dept_spend_change = formater(info.dept_spend_change);
          }
          d.gov_auth_change = formater(info.gov_auth_change);
          d.gov_spend_change = formater(info.gov_spend_change);

        });
      },
      graphics : {
        "vote_stat_split": function(options){

        },
        "historical_auth" : function(container){

        },
        "voted_spending" :   function(container){

        },
        "stat_spending" :  function(container){

        }                     
      } 
      });
  });
})();
