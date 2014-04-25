(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
      "id": "table5",
      "attaches_to" : "hist_exp",
      add_cols : function(){
        this.add_col(
          {
            "type":"int",
        "key" : true,
        "hidden" : true,
        "nick" : "dept",
        "header":'',
          });
        this.add_col(
          {
            "key" : true,
          "type":"wide-str",
          "nick" : 'so',
          "header":{
            "en":"Standard Object",
          "fr":"Article courtant"
          }
          }
          );
        _.each(['{{last_year_3}}','{{last_year_2}}','{{last_year}}'],
            function(header){
              this.add_col(
                {
                  "type":"big-int",
              "nick":header,
              "header":header
                }
                );
            },this);
      },
      "dimensions" : {
        "horizontal" : function(options){
          var lang = options.app.state.get("lang"),
          sort_map = _.chain(sos)
            .map(function(val,key){
              return [val[lang],key];
            })
          .object()
            .value();
          options.table.horizontal_group_sort = function(group){
            return +sort_map[group];
          };
          return function(row){
            return row.so;
          };
        },
        "spending_type" : TABLES.standard_object_dimension
      },
      "link": {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name": { "en": "Expenditures by Standard Object",
        "fr": "Dépenses par article courant"
      },
      "title": { "en": "Expenditures by Standard Object from {{last_year_3}} to {{last_year}} ($000)",
        "fr": "Dépenses par article courant de {{last_year_3}} à {{last_year}} (en milliers de dollars)"
      },
      "sort": function (rows, lang) { return rows;},
      "mapper": function (row) {
        if (row[0] !== 'ZGOC') {
          row.splice(1, 1, sos[row[1]][this.lang]);
        }
        return row;
      },
      mini_view: {
        description: {
          "en": "Organization’s top three standard objects with the greatest expenditures by value ($000) and proportion of total expenditures (%). Select the fiscal year in the drop-down menu to display the expenditures.",
          "fr": "Les trois articles courants représentant les plus importantes dépenses en fonction de leur valeur (en milliers de dollars) et en tant que pourcentage des dépenses totales (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher les dépenses."
        },
        drop_down_options : [
          {val:"{{last_year}}",selected: true},
          {val:"{{last_year_2}}"},
          {val:"{{last_year_3}}"}
        ],
        classes : [ 'left_text', 
        'right_number', 
        'right_number'],
        prep_data: function () {
          var year = this.option.val ;
          var top3 = this.da.get_top_x([year,'so'],3,
              {gross_percentage: true, format: true});
          this.rows = _.zip(
              top3.so,
              top3[year],
              top3[year+"gross_percentage"]);
          this.headers = [[
            this.header_lookup('so'),
            this.gt("expenditures") + ' ($000)',
            "(%)" ]];
        }
      },
      dept_info : function(c,q){
          c.dept_last_year_so_spend =  this.horizontal("{{last_year}}",c.dept,true); 
          c.dept_last_year_2_so_spend = this.horizontal("{{last_year_2}}",c.dept,true); 
          c.dept_last_year_3_so_spend = this.horizontal("{{last_year_3}}",c.dept,true); 
      },
      info : function(c,q){
        var personnel = sos[1][c.lang];
        c.gov_last_year_type_spend =  this.spending_type("{{last_year}}",false); 
        c.gov_last_year_2_type_spend = this.spending_type("{{last_year_2}}",false); 
        c.gov_last_year_3_type_spend = this.spending_type("{{last_year_3}}",false); 
        c.gov_personnel = [this.horizontal("{{last_year_3}}",false)[personnel],
                           this.horizontal("{{last_year_2}}",false)[personnel],
                           this.horizontal("{{last_year}}",false)[personnel]];
      },
      graphics : {
        "vote_stat_split": function(options){

        }
      }                 
      });

  });
})();
