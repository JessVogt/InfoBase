(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
     id: "table10",
     "col_defs": ["wide-str",
                "big-int-real",
                "big-int-real",
                "big-int-real"
    ],
     "coverage": "Historical",
     "headers": { "en": [[
        "Geographic Region",
        "{{last_year_3}}",
        "{{last_year_2}}",
        "{{last_year}}"
       ]],
         "fr": [[
          "Région géographique",
          "{{last_year_3}}",
          "{{last_year_2}}",
          "{{last_year}}"
          ]]
     },
     "link": {
        "en": "http://www.tbs-sct.gc.ca/res/stats/ssa-pop-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/res/stats/ssa-pop-fra.asp"
     },
     "name": { "en": "Population by Geographic Region",
         "fr": "Effectif par région géographique"
     },
     "title": { "en": "Population by Geographic Region",
         "fr": "Effectif par région géographique"
     }
    , "key": [0]
    , "mapper": {
        "to": function (row) {
           var lookup = window.provinces[row[1]];
           var new_value = lookup[this.lang];
           row.splice(1, 1, new_value);
           return _.tail(row);
        }
      , "make_filter": function (source_row) {
          return function (candidate_row) {
              return (candidate_row[1] == source_row[1]);
          }
      }
    }
    , table_view: {
        sum_cols: [1, 2, 3]
      , min_func: TABLES.add_ministry_sum
      , init_row_data: function () {
          var txt = this.gt("total");
          this.merge_group_results(
          [[this.row_data,
          GROUP.fnc_on_group(
            this.row_data,
            { txt_cols: { 0: txt },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            })]]);
      }
    }
    , mini_view: {
        description: {
            "en": "Organization’s active employee population by region of work by value (number of employees) and proportion of total population (%). The National Capital Region (NCR) includes both Ottawa (ON) and Gatineau (QC). Select the fiscal year in the drop-down menu to display the population for that year.",
            "fr": "Population active par région géographique en fonction du nombre d'employés et en tant que pourcentage du total de la population (%). La région de la capitale nationale (RCN) inclus Ottawa (ON) et Gatineau (QC). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher la population."
        },
        year: "{{last_year}}",
        prep_data: function () {
            var lang = this.lang;
            var year = this.year;
            var ttf = this.app.formater;
            var name = "Geographic Region";
            var lk =  window.provinces;
            var ncr = lang === 'en'  ? "NCR" : "RCN";
            var abroad = lk['Abroad'][lang];
            var non_ncr = "Non-NCR"
            var dept_total = UTILS.sum_ar(_.pluck(this.data, this.year));

            var groups = _.groupBy(this.data, function (x) {
                if (x[name] === lk['NCR ON'][lang] || x[name] === lk['NCR QC'][lang]) {
                   return ncr;
                } else if (x[name] === lk['Abroad'][lang]) {
                   return abroad;
                } else {
                   return non_ncr;
                }
            });
            this.rows = _.map([ncr, non_ncr, abroad], function (key) {
                var relevant_group = groups[key];
                var sub_column = _.pluck(relevant_group, year);
                var group_total = UTILS.sum_ar(sub_column);
                return [key, ttf("big-int-real",group_total), ttf("percentage", group_total / dept_total)];
            });
        },
        render_data: function () {
            this.content = TABLES.build_table({
                headers: [[this.gt("Geographic Region"),
                         this.gt("Number of Employee"),
                         '(%)']],
               body: this.rows,
                css: [{ 'font-weight': 'bold', 'text-align': 'left' },
                    { 'text-align': 'right' },
                    { 'text-align': 'right'}]
          , classes: ['', 'wrap-none', 'wrap-none']
            });
        }
      , post_render: function () {
          this.$el.find('.description').append(
         make_year_select()
         );
          _.bindAll(this, "on_select");
          this.$el.find(".description select")
          .on("change", this.on_select)
          .val(this.year);
      }
      , on_select: function (e) {
          this.year = $(e.target).val();
          this.render();
          this.$el.find("select").focus();
          this.resize_my_row();
      }
    },
    graph_view : {
          titles: {
              1: {
                  "en": "Population by Geographic Region by fiscal year",
                  "fr": "Effectif par région géographique par exercice financier"
              },
              2: {
                  "en": "Population by selected Geographic Region",
                  "fr": "Effectif par région géographique sélectionnée"
              }
          }
      , descriptions: {
          1: {
              "en": "Graph 1 compares the organization’s employee population across geographic regions in each fiscal year from 2010-11 to 2012-13. <p>Select a fiscal year from the list on the left side-bar to view the organization’s employee population across geographic regions for that year.</p> ",
              "fr": "Le graphique 1 montre une comparaison de la population active de l’organisation par région géographique pour chaque exercice de 2010‒2011 à 2012‒2013. <p>Choisissez un exercice financier dans le menu de gauche pour en représenter l’effectif par région géographique.</p>"
          },
          2: {
              "en": "Graph 2 presents the population trend for the organization from the fiscal year 2010-11 to 2012-13. Select a province or a territory from the list on the left side-bar to view the population count for the organization by fiscal year for that region. ",
              "fr": "Le graphique 2 présente les tendances de la population de l’organisation de l’exercice financier 2010-2011 à 2012-2013. Choisissez une province ou un territoire dans le menu de gauche pour en représenter l’effectif pour la région géographique sélectionnée par exercice."
          }
      }
      , prep_data: function () {
          var years = this.years = ['{{last_year_3}}',
                                  '{{last_year_2}}',
                                  "{{last_year}}"];
          this.to_years = _.object(_.map(years, m), this.years);
          var name = 'Geographic Region';
          this.extract_for_year = function (year) {
              return _.map(this.mapped_objs, function (obj) {
                  return [obj[name], obj[year]];
              });
          };
          this.get_year_vals = function (prov) {
              var line = _.first(_.filter(this.mapped_objs,
                function (obj) {
                    return obj['Geographic Region'] == prov;
                }));
              return _.map(years, function (year) { return line[year] });
          }
      }
      , render: function () {
          var by_year_graph = $(
        this.template({
            id: this.make_id(1)
          , description: this.descriptions[1][this.lang]
          , header: this.gt("year")
          , items: [m("{{last_year}}"),
                    m("{{last_year_2}}"),
                    m("{{last_year_3}}")]
        }));
          var by_item_graph = $(
        this.template({
            id: this.make_id(2)
          , description: this.descriptions[2][this.lang]
          , header: this.gt("Geographic Region")
          , items: _.pluck(this.mapped_objs, "Geographic Region")
        }));
          this.$el.append(by_year_graph);
          this.$el.append(by_item_graph);
          this.$el.on("click", "#" + this.make_id(1) + "_sidebar a", this.year_click);
          this.$el.on("click", "#" + this.make_id(2) + "_sidebar a", this.item_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);

          var self = this;
          setTimeout(function () {
              self.$el.find("#" + self.make_id(1) + "_sidebar a:first").trigger("click");
              self.$el.find("#" + self.make_id(2) + "_sidebar a:first").trigger("click");
          });
          return this;
      }
      , year_click: function (event) {
        var selected_year =  $(event.target).text();
        var column_name = this.to_years[selected_year];
        var column_to_be_graphed = this.extract_for_year(column_name);
        var data = _.pluck(column_to_be_graphed, 1);
        var ticks = _.pluck(column_to_be_graphed, 0);
        var plot = GRAPHS.bar(this.make_id(1),
          [data],
          { title: this.titles[1][this.lang]
          , legend: { show: false }
          , rotate: true
          , footnotes: this.footnotes
          , format_style: "big-int-real"
          , ticks: ticks
          });
        GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
      , item_click: function (event) {
          var years = this.get_year_vals($(event.target).html());
          var data = _.map(years, function (x) { return x });
          var ticks = _.map(this.years, m);
          var plot = GRAPHS.bar(this.make_id(2),
            [data],
            { title: this.titles[2][this.lang]
            , legend: { show: false }
            , barWidth: 100
            , footnotes: this.footnotes
            , format_style: "big-int-real"
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
    }
    });
  });
})();
