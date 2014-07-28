(function (root) {
  var TABLES = ns('TABLES');
  var D3 = ns('D3');
  var STACKED = ns('D3.STACKED');
  var PIE = ns("D3.PIE");
  var APP = ns('APP');
  var PACK = ns("D3.PACK");

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;

    APP.dispatcher.trigger("new_table",
     {
      "id": "table9",
      "csv_url" : "../InfoBase/data/table9.csv",
      "coverage": TABLES.coverage.historical,
      "data_type" :TABLES.data_types.people,
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
        _.each(years,
          function(header){
            this.add_col(
              {
                "type":"big-int-real",
            "nick":header,
            "header":header,
              "description": {
                           "en": "Corresponds to the active employee population by Employee Type for the fiscal year " + header,
                           "fr": "Correspondent à l'effectif de l’organisation choisie par période d'affectation au cours de l'exercice financier " + header
                       }
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
      "queries" : {
      },
      "dept_info" : function(c,q){
        c.dept_this_year_total_employment = q.sum("{{last_year}}");
        c.dept_last_year_emp_types = this.horizontal("{{last_year}}",c.dept);
        c.dept_last_year_2_emp_types = this.horizontal("{{last_year_2}}",c.dept);
        c.dept_last_year_3_emp_types = this.horizontal("{{last_year_3}}",c.dept);
        c.dept_last_year_4_emp_types = this.horizontal("{{last_year_4}}",c.dept);
        c.dept_last_year_5_emp_types = this.horizontal("{{last_year_5}}",c.dept);
      },
      "info" : function(c,q){
        c.emp_types = _.uniq(q.get_col("employee_type"));
        c.gov_this_year_total_employment = q.sum("{{last_year}}");
        c.gov_last_year_emp_types = this.horizontal("{{last_year}}",false);
        c.gov_last_year_2_emp_types = this.horizontal("{{last_year_2}}",false);
        c.gov_last_year_3_emp_types = this.horizontal("{{last_year_3}}",false);
        c.gov_last_year_4_emp_types = this.horizontal("{{last_year_4}}",false);
        c.gov_last_year_5_emp_types = this.horizontal("{{last_year_5}}",false);
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
          var fm1  = app["big-int-real"];
          var fm2 = app.percentage;
          var year = this.option.val ;
          var ordered = this.da.get_top_x([year,'employee_type'],Infinity,
              {gross_percentage: true, format: false});
          this.rows = _.zip(
              ordered.employee_type,
              _.map(ordered[year], fm1),
              _.map(ordered[year+"gross_percentage"], fm2));
          this.headers = [[
            this.header_lookup('employee_type'),
            this.gt("employee_type"),
            "(%)" ]];
        }
      },
      "graphics" : {
        "details_display_order" :[
          "employee_type"
        ],
        "total_employment" : function(){
          var data,text,args={
            height : this.height,
            formater : app.compact
          };

          if (this.dept){
            text = "dept_this_year_total_employment";
            args.data = [
              {name:"this_year_auth",value: this.data.gov_this_year_total_employment},
              {name:"dept_this_year_auth",value: this.data.dept_this_year_total_employment}
            ];
            args.center = true;
          } else {
            args.data = [ {name : "this_year_auth",value: this.data.gov_this_year_total_employment} ];
            text = "gov_this_year_total_employment";
            args.font_size = "24";
          }

          return {
            graph : PACK.circle_pie_chart(args),
            text : app.get_text(text, this.written_data),
            title : app.get_text("people_data"),
            source : [this.create_links({
              cols : "{{last_year}}"
            })],
          };
        },
        "employee_type": function(){
          var data = this.data;
              graph_area = this.panel.areas().graph;

           if (this.data.dept) {
            STACKED.stacked_series({
              labels : data.emp_types,
              height : this.height,
              colors : D3.tbs_color(),
              data : [
                {tick :data.last_years[0], vals : data.dept_last_year_5_emp_types  },
                {tick :data.last_years[1], vals : data.dept_last_year_4_emp_types  },
                {tick :data.last_years[2], vals : data.dept_last_year_3_emp_types  },
                {tick :data.last_years[3], vals : data.dept_last_year_2_emp_types  },
                {tick :data.last_years[4], vals : data.dept_last_year_emp_types  },
              ]
            })(graph_area);
           } else {
            PIE.pie({
              labels : data.emp_types,
              height : this.height,
              colors : D3.tbs_color(),
              label_attr : "label" ,
              data_attr : "val",
              inner_radius: 40,
              data : _.chain(data.gov_last_year_emp_types)
                       .map(function(v,k){ return {val: v, label: k};})
                       .value(),
            })(graph_area);
           }
           return {
             text : "",
             title :this.table.title[app.lang],
             source : [this.create_links({
               cols : _.last(years)
             })]
           };
        }
      }
     });
  });
})();
