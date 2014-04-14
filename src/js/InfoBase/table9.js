(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;

    APP.dispatcher.trigger("new_table",
     {
      "id": "table9",
      "data_type" : "people_data",
      "coverage": "historical",
      "add_cols" : function(){
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
        "nick" : 'employee_type',
        "header":{
          "en":"Employee Type",
          "fr":"Période d'affectation"
          }
        });
        _.each(['{{last_year_3}}','{{last_year_2}}','{{last_year}}'],
          function(header){
            this.add_col(
              {
                "type":"big-int-real",
            "nick":header,
            "header":header
              });
        },this);
      },
      "link": {
        "en": "http://www.tbs-sct.gc.ca/res/stats/ssa-pop-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/res/stats/ssa-pop-fra.asp"
      },
      "name": { "en": "Population by Employee Type",
                "fr": "Effectif par période d'affectation"
      },
      "title": { "en": "Population by Employee Type",
                  "fr": "Effectif par période d'affectation"
      },
      "mapper": function (row) {
        var lookup = window.tenure[row[1]];
        var new_value = lookup[this.lang];
        row.splice(1, 1, new_value);
        return row;
      },
      "dimensions" : {
         "horizontal" : function(options){
            return function(row){
              return row.employee_type;
            };
         }
      },
      "dept_info" : function(c,q){

      },
      "info" : function(c,q){

      },
      "mini_view": {
        description: {
          "en": "Organization’s active employee population by Employee Type by value (number of employees) and proportion of total (%). Select the fiscal year in the drop-down menu to display the population.",
          "fr": "Population active par période d’affectation en fonction du nombre d'employés et en tant que pourcentage du total de la population (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher la population."
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
          var fm1  = app.make_formater("big-int-real");
          var fm2 = app.make_formater("percentage");
          var year = this.option.val ;
          var top3 = this.da.get_top_x([year,'employee_type'],Infinity,
              {gross_percentage: true, format: false});
          this.rows = _.zip(
              top3.employee_type,
              _.map(top3[year], fm1),
              _.map(top3[year+"gross_percentage"], fm2));
          this.headers = [[
            this.header_lookup('employee_type'),
            this.gt("employee_type"),
            "(%)" ]];
        }
      },
      "graphics" : {
        "display_order" :[
        ]
      }
     });
  });
})();
