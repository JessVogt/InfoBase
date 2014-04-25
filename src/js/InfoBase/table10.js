(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var CANADA = ns("D3.CANADA");

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table", {
      "id": "table10",
      "attaches_to" : "hist_pm",
      "add_cols": function () {
        this.add_col({
          "type": "int",
          "key": true,
          "hidden": true,
          "nick": "dept",
          "header": ''
        });
        this.add_col({
          "type": "wide-str",
          "hidden": true,
          "nick": 'region_code',
          "header": ""
        });
        this.add_col({
          "key": true,
          "type": "wide-str",
          "nick": 'region',
          "header": {
            "en": "Geographic Region",
            "fr": "Région géographique"
          }
        });
        _.each(['{{last_year_3}}', '{{last_year_2}}', '{{last_year}}'],
          function (header) {
            this.add_col({
              "type": "big-int-real",
              "nick": header,
              "header": header
            });
          }, this);
      },
      "link": {
        "en": "http://www.tbs-sct.gc.ca/res/stats/ssa-pop-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/res/stats/ssa-pop-fra.asp"
      },
      "name": {
        "en": "Population by Geographic Region",
        "fr": "Effectif par région géographique"
      },
      "title": {
        "en": "Population by Geographic Region",
        "fr": "Effectif par région géographique"
      },
      "mapper": function (row) {
        var new_value = window.provinces[row[1]][this.lang];
        row.splice(2, 0, new_value);
        return row;
      },
      "dept_info": function (c, q) {
        c.dept_last_year_prov_split = this.horizontal_code("{{last_year}}", c.dept, true);
        c.dept_last_year_2_prov_split = this.horizontal_code("{{last_year_2}}", c.dept, true);
        c.dept_last_year_3_prov_split = this.horizontal_code("{{last_year_3}}", c.dept, true);
      },
      "info": function (c, q) {
        c.gov_last_year_prov_split = this.horizontal_code("{{last_year}}", false);
        c.gov_last_year_2_prov_split = this.horizontal_code("{{last_year_2}}", false);
        c.gov_last_year_3_prov_split = this.horizontal_code("{{last_year_3}}", false);
      },
      "queries": {
        "high_level_prov_split": function (year, options) {
          options = options || {};
          var lk = window.provinces,
            format = options.format || false,
            fm1 = this.app.make_formater("big-int-real"),
            fm2 = this.app.make_formater("percentage"),
            ncr = this.lang === 'en' ? "NCR" : "RCN",
            non_ncr = "Non-NCR",
            abroad = lk.Abroad[this.lang],
            dept_total = d3.sum(this.data, function (d) {
              return d[year];
            });
          groups = _.groupBy(this.data, function (x) {
            if (x.region_code === 'NCR ON' || x.region_code === 'NCR QC') {
              return ncr;
            } else if (x.region_code === "Abroad") {
              return abroad;
            } else {
              return non_ncr;
            }
          }, this);
          return _.map([ncr, non_ncr, abroad], function (key) {
            var relevant_group = groups[key];
            var sub_column = _.pluck(relevant_group, year);
            var group_total = d3.sum(sub_column);
            if (format) {
              return [key, fm1(group_total), fm2(group_total / dept_total)];
            } else {
              return [key, group_total, group_total / dept_total];
            }
          });
        }
      },
      "dimensions": {
        "horizontal": function (options) {
          return function (row) {
            return row.region;
          };
        },
        "horizontal_code": function (options) {
          return function (row) {
            return row.region_code;
          };
        }
      },
      "mini_view": {
        "description": {
          "en": "Organization’s active employee population by region of work by value (number of employees) and proportion of total population (%). The National Capital Region (NCR) includes both Ottawa (ON) and Gatineau (QC). Select the fiscal year in the drop-down menu to display the population for that year.",
          "fr": "Population active par région géographique en fonction du nombre d'employés et en tant que pourcentage du total de la population (%). La région de la capitale nationale (RCN) inclus Ottawa (ON) et Gatineau (QC). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher la population."
        },
        drop_down_options: [{ val: "{{last_year}}", selected: true }, 
        { val: "{{last_year_2}}" }, 
        { val: "{{last_year_3}}" }
        ],
        classes: ['left_text',
          'right_number',
          'right_number'
        ],
        prep_data: function () {
          var year = this.option.val;
          this.rows = this.da.high_level_prov_split(year, {
            format: true
          });
          this.headers = [
            [this.gt("geo_region"),
              this.gt("num_employees"),
              '(%)'
            ]
          ];
        }
      },
      "graphics" : {
        "details_display_order" : [
          "prov_split"
        ],
        "prov_split" : function(){

          // reformat the data for display
          var data = _.map([this.data.dept_last_year_3_prov_split,
                           this.data.dept_last_year_2_prov_split,
                           this.data.dept_last_year_prov_split
                         ],
              function(obj){
                var d = _.extend({},obj);
                d.QC = d['QC (minus NCR)'];
                d.ON = d['ON (minus NCR)'];
                d.NCR = d["NCR ON"]+d['NCR QC'];
                delete d['QC (minus NCR)'];
                delete d['ON (minus NCR)'];
                delete d['NCR ON'];
                delete d['NCR QC'];
                delete d.Abroad;
                return d;
          });

          CANADA.canada({
            data : data,
            ticks : this.data.last_years,
            formater : this.bigintreal
          })(this.graph_area);
        }
      }
    });
  });
})();
