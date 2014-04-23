(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
     id: "table7",
      "attaches_to" : "table5",
     "data_type" : "financial_data",
     "coverage": "historical",
     add_cols : function(){
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
             "key" : true,
              "nick" : "type",
             "header":{
               "en":"Payment Type",
               "fr":"Type de paiement"
             }
           },
           {
             "type":"wide-str",
             "key" : true,
             "nick" : 'tp',
             "header":{
               "en":"Transfer Payment",
               "fr":"Paiement de transfert"
             }
           }
       ]);
       _.each(['{{last_year_3}}','{{last_year_2}}','{{last_year}}'],
           function(header){
             this.add_col(header)
              .add_child([
              { 
                "type":"big-int",
                "header":{
                  "en":"Total budgetary authority available for use",
                  "fr":"Autorisations budgétaires disponibles pour l'emploi"
                }
              },{
                "type":"big-int",
                 "nick" : header+'exp',
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
     "name": { 
       "en": "Transfer Payments",
       "fr": "Paiements de transfert"
     },
     "title": { 
       "en": "Transfer Payments from {{last_year_3}} to {{last_year}} ($000)",
       "fr": "Paiements de transfert de {{last_year_3}} à {{last_year}} (en milliers de dollars)"
     },
     "dimensions" : {
        "horizontal" : function(options){
          return function(row){
            var type = row.type;
            if (row.tp.substring(0,3) === '(S)'){
              return type + ' - ' + app.get_text("stat");
            } else {
              return type + ' - ' + app.get_text("voted");
            }
          };
        }
     },
     "sort": function (mapped_rows, lang) {
          return _.sortBy(mapped_rows, function (row) { return row[0];});
      },
      "mapper": function (row) {
         if (this.lang === 'en') {
             row.splice(2, 1);
             row.splice(3, 1);
         } else {
             row.splice(1, 1);
             row.splice(2, 1);
         }
         // remove acronym and vote type
         return row;
      },
      mini_view: {
          description: {
              "en": "Organization’s transfer payments with the greatest expenditures by value ($000) and proportion of total expenditures (%). Select the fiscal year in the drop-down menu to display the expenditures.",
              "fr": "Les paiements de transfert représentant les plus importantes dépenses en fonction de leur valeur (en milliers de dollars) et en tant que pourcentage des dépenses totales (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher les dépenses."
          },
          drop_down_options : [
            {val:"{{last_year}}",selected: true},
            {val:"{{last_year_2}}"},
            {val:"{{last_year_3}}"}
          ],
          classes : [
              'left_text', 
              'right_number', 
              'right_number'],
          prep_data: function () {
            var year = this.option.val + 'exp';
            var top3 = this.da.get_top_x([year,'tp'],3,
                {gross_percentage: true, format: true});
            this.rows = _.zip(
                 top3.tp,
                 top3[year],
                 top3[year+"gross_percentage"]);
            this.headers = [[
               this.header_lookup('tp'),
               this.gt("expenditures") + ' ($000)',
               "(%)" ]];
        }
      },
      dept_info : function(c,q){

      },
      info : function(c,q){

      },
      graphics : {
        "vote_stat_split": function(options){

        }
      } 
    });
  });
})();
