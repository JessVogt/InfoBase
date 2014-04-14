(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {"id": "table11",
     "data_type" : "people_data",
     "coverage": "historical",
     "add_cols" : function(){
        this.add_col({
            "type":"int",
            "key" : true,
            "hidden" : true,
            "nick" : "dept",
            "header":''
        });
        this.add_col({
          "key" : true,
          "type":"wide-str",
          "nick" : 'age',
          "header":{
            "en":"Age Group",
            "fr":"Groupe d’âge"
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
     "name": { "en": "Population by Employee Age Group",
          "fr": "Effectif par groupe d’âge"
     },
     "title": { "en": "Population by Employee Age Group",
         "fr": "Effectif par groupe d’âge"
    },
    "dept_info" : function(c,q){

    },
    "info" : function(c,q){

    },
    "queries" : {
       "high_level_age_split" : function(year,options){
         options = options || {};
         var format = options.format || false,
             fm1 = this.app.make_formater("big-int-real"),
             fm2 = this.app.make_formater("percentage"),
             column = _.pluck(this.data, year),
             dept_total = d3.sum(column),
             // breakdown the data into 4 individual groups, each of which will need to have it's
             // own seperate total calculated
             groups = _.groupBy(this.data, function(x){
               return ({ '< 20' : "< 30", '20-24' : "< 30", '25-29' : "< 30",
                         '30-34' : "30-44", '35-39' : "30-44", '40-44' : "30-44",
                         '45-49' : "45-59", '50-54' : "45-59", '55-59' : "45-59",
                         '60-64' : "> 60", '65-69':"> 60", '70 +' : "> 60"
                      })[x.age];
             }),
             // delete missing rows
             //delete groups[undefined]
             // use the keys you've alrady defined and iterate over them in the order
             // of your choice -- impose an order on the unordered groups objects
             mapfunc = function(key){
               var relevant_group = groups[key];
               var mini_column = _.pluck(relevant_group, year);
               var group_total = d3.sum(mini_column);
               if (format){
                 return [key, fm1(group_total), fm2(group_total/dept_total)];
               } else {
                 return [key, group_total, group_total/dept_total];
               }
             };
         return _.map(['< 30','30-44','45-59','> 60'], mapfunc);
       }
    },
    "dimensions" : {
       "horizontal" : function(options){
          return function(row){
            return row.age;
          };
       }
    },
    "mapper":  _.identity,
    mini_view: {
      description: {
          "en": "Organization’s active employee population by age group by value (number of employees) and proportion of total population (%). Select the fiscal year in the drop-down menu to display the population.",
          "fr": "Population active par groupe d’âge en fonction du nombre d'employés et en tant que pourcentage du total de la population (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher la population."
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
        this.rows = this.da.high_level_age_split(year,{format:true});
        this.headers = [[this.gt("age_group"),
                         this.gt("num_employees"),
                         '(%)']];
      }
    },
    "graphics" : {
      "display_order" :[
      ]
    } 
  });
  });
})();
