(function (root) {
  var TABLES = ns('TABLES');
  var D3 = ns('D3');
  var STACKED = ns('D3.STACKED');
  var PIE = ns('D3.PIE');
  var APP = ns('APP');

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {"id": "table11",
      "coverage": TABLES.coverage.historical,
      "data_type" :TABLES.data_types.people,
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
       c.dept_last_year_emp_ages = q.high_level_age_split2("{{last_year}}",c.dept);
       c.dept_last_year_2_emp_ages = q.high_level_age_split2("{{last_year_2}}",c.dept);
       c.dept_last_year_3_emp_ages = q.high_level_age_split2("{{last_year_3}}",c.dept);
    },
    "info" : function(c,q){
       c.emp_ages = ['< 30','30-39','40-49','50-59','> 60'];
       c.gov_last_year_emp_ages = q.high_level_age_split2("{{last_year}}",false);
       c.gov_last_year_2_emp_ages = q.high_level_age_split2("{{last_year_2}}",false);
       c.gov_last_year_3_emp_ages = q.high_level_age_split2("{{last_year_3}}",false);
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
                         '30-34' : "30-39", '35-39' : "30-39", '40-44' : "40-49",

                         '45-49' : "40-49", '50-54' : "50-59", '55-59' : "50-59",
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
         return _.map(['< 30','30-39','40-49','50-59','> 60'], mapfunc);
       },
       "high_level_age_split2" : function(year){
          var split = this.high_level_age_split(year);
          return _.object( _.pluck(split, 0), _.pluck(split, 1));
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
      "details_display_order" :[
        "employee_age"
      ],
      "employee_age": function(){
        var data = this.data;
        this.graph_area.style("max-width","700px");
         if (this.data.dept) {
          STACKED.stacked_series({
            labels : data.emp_ages,
            height : this.height,
            colors : D3.tbs_color(),
            data : [
              {tick :data.last_years[0], vals : data.dept_last_year_2_emp_ages  },
              {tick :data.last_years[1], vals : data.dept_last_year_2_emp_ages  },
              {tick :data.last_years[2], vals : data.dept_last_year_emp_ages  },
            ]
          })(this.graph_area);
         } else {
            PIE.pie({
              labels : data.emp_types,
              height : this.height,
              colors : D3.tbs_color(),
              label_attr : "label" ,
              data_attr : "val",
              inner_radius: 40,
              data : _.chain(data.gov_last_year_emp_ages)
                       .map(function(v,k){ return {val: v, label: k};})
                       .value(),
            })(this.graph_area);

         }
      }
    } 
  });
  });
})();
