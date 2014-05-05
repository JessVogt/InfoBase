(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var STACKED = ns('D3.STACKED');

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
        id: "table6",
      "attaches_to": "hist_exp",
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
          'nick' : 'prgm',
          "header":{
            "en":"Program",
          "fr":"Programme"
          }
          });
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
        "horizontal": function(options){
          var app = options.app;
          var col = options.col;
          options.table.horizontal_group_sort = function(group){
            // ensure internal services is listed last
            if (group ==='Internal Services' || group === 'Services internes'){
              return Math.pow(10,100);
            }
            return -accounting.unformat(group);
          };
          var func  = function(row){
            if (row.prgm === 'Internal Services' || row.prgm === 'Services internes'){
              return row.prgm;
            }
            var val = row[col];
            // capture the negative and 0 values and return them as being
            // smaller than 100k
            if (val<=0){
              return app.get_text("less_than")+ " " +app.formater("big-int2",Math.pow(10,5));
            }
            var floor = Math.floor(Math.log(val)/ Math.log(10));
            if (floor <= 5){
              return app.get_text("less_than")+ " " +app.formater("big-int2",Math.pow(10,5));
            } else {
              return app.get_text("greater_than")+ " " +app.formater("big-int2",Math.pow(10,floor));
            }
          };
          return func;
        }
      },
      "link": {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name": { "en": "Expenditures by Program",
        "fr": "Dépenses par programme"
      },
      "title": { "en": "Expenditures by Program from {{last_year_3}} to {{last_year}} ($000)",
        "fr": "Dépenses par programme de {{last_year_3}} à {{last_year}} (en milliers de dollars)"
      },
      "sort": function (mapped_rows, lang) {
        return _.sortBy(mapped_rows, function (row) { return row[0];});
      },
      mapper: function (row) {
        if (this.lang === 'en') {
          row.splice(2, 1);
        } else {
          row.splice(1, 1);
        }
        return row;
      },
      mini_view: {
        description: {
          "en": "Organization’s programs with the greatest expenditures by value ($000) and proportion of total expenditures (%).Select the fiscal year in the drop-down menu to display the expenditures. ",
          "fr": "Les programmes représentant les plus importantes dépenses en fonction de leur valeur (en milliers de dollars) et en tant que pourcentage des dépenses totales (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher les dépenses. "
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
            var top3 = this.da.get_top_x([year,'prgm'],3,
                {gross_percentage: true, format: true});
            this.rows = _.zip(
                top3.prgm,
                top3[year],
                top3[year+"gross_percentage"]);
            this.headers = [[
              this.header_lookup('prgm'),
              this.gt("expenditures") + ' ($000)',
              "(%)" ]];
          }
      },
      "queries" : {
         "sorted_programs" : function(){
           return _.sortBy(this.data, function(x){
             return -x[_.last(years)];
           });
         }
      },
      dept_info : function(c,q){
        c.dept_historical_program_spending = q.sorted_programs();
        var is = app.get_text("internal_services");
        c.dept_is = [this.horizontal("{{last_year_3}}",c.dept,true)[is],
                       this.horizontal("{{last_year_2}}",c.dept,true)[is],
                       this.horizontal("{{last_year}}",c.dept,true)[is]];
      },
      info : function(c,q){
        var is = app.get_text("internal_services");
        c.gov_is = [this.horizontal("{{last_year_3}}",false)[is],
                    this.horizontal("{{last_year_2}}",false)[is],
                    this.horizontal("{{last_year}}",false)[is]];
      },
      graphics : {
       "details_display_order" : [
         "program_spending"
       ],
       "program_spending": function(){
          var data = _.map(this.data.dept_historical_program_spending ,_.identity);
          var col_attrs = years;

          if (data.length <= 1){
            return false;
          }

          _.each(data, function(d){
            d.prgm = APP.abbrev(app,d.prgm, 100);
          });

          STACKED.relaxed_stacked({
            colors : d3.scale.category20(),
            radius : 35,
            rows : data,
            formater : this.compact,
            total_formater : this.compact1,
            display_cols : this.data.last_years,
            col_attrs : col_attrs,
            text_key : "prgm"
          })(this.graph_area);

        }
      }
      });

  });
})();
