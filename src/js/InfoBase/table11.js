(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {id: "table11",
            "col_defs": [ "wide-str",
                  "big-int-real",
                "big-int-real",
                "big-int-real"
    ],
     "coverage": "historical",
     "headers": { "en": [ [
        "Age Group",
        "{{last_year_3}}",
        "{{last_year_2}}",
        "{{last_year}}"
       ]],
         "fr": [[
          "Groupe d’âge",
          "{{last_year_3}}",
          "{{last_year_2}}",
          "{{last_year}}"
          ]]
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
      

     "key": [0],
      "mapper": {
        "to": function (row) {
                return _.tail(row);
        }
      , "make_filter": function (source_row) {
          return function (candidate_row) {
              return (candidate_row[1] == source_row[1]);
          }
      }
    },
     table_view: {
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
    },
    mini_view: {
      description: {
          "en": "Organization’s active employee population by age group by value (number of employees) and proportion of total population (%). Select the fiscal year in the drop-down menu to display the population.",
          "fr": "Population active par groupe d’âge en fonction du nombre d'employés et en tant que pourcentage du total de la population (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher la population."
        },
      year: "{{last_year}}",
      prep_data: function () {
        var year = this.year
        var ttf = this.app.formater;
        var name = "Age Group";
        var column = _.pluck(this.data, this.year);
        var dept_total = UTILS.sum_ar(column);
            // breakdown the data into 4 individual groups, each of which will need to have it's
            // own seperate total calculated
        var groups = _.groupBy(this.data, function(x){
              if (x[name] === '< 20' || x[name] === '20-24' || x[name] === '25-29' ){
                 return "< 30";
              }
              if (x[name] === '30-34' || x[name] === '35-39' || x[name] === '40-44' ){
                 return "30-44";
              }
              if (x[name] === '45-49' || x[name] === '50-54' || x[name] === '55-59' ){
                 return "45-59";
              }
              if (x[name] === '60-64' || x[name] === '65-69' || x[name] === '70 +'){
                 return "> 60";
              }
            })
            // delete missing rows
            //delete groups[undefined]
            // use the keys you've alrady defined and iterate over them in the order
            // of your choice -- impose an order on the unordered groups objects
         var mapfunc = function(key){
              var relevant_group = groups[key];
              var mini_column = _.pluck(relevant_group, year);
              var group_total = UTILS.sum_ar(mini_column);
              return [key, ttf("big-int-real",group_total), ttf("percentage",group_total/dept_total)];
            }
         this.rows = _.map(['< 30','30-44','45-59','> 60'], mapfunc);
      },
      render_data: function () {
          this.content = TABLES.build_table({
              headers: [[this.gt("Age Group"),
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
                  "en": "Population by Employee Age Group by fiscal year",
                  "fr": "Effectif par groupe d’âge par exercice financier"
              },
              2: {
                  "en": "Population by selected Employee Age Group",
                  "fr": "Effectif par groupe d’âge sélectionné"
              }
          }
      , descriptions: {
          1: {
              "en": "Graph 1 compares the organization’s employee population across age bands in each fiscal year from 2010-11 to 2012-13. Select a fiscal year from the list on the left side-bar to view the organization’s employee population across age group for that fiscal year.",
              "fr": "Le graphique 1 montre une comparaison de la population active de l’organisation par groupe d’âge pour chaque exercice de 2010‒2011 à 2012‒2013. Choisissez un exercice financier dans le menu de gauche pour en représenter l’effectif par groupe d’âge."
          },
          2: {
              "en": "Graph 2 presents the population trend for the organization from the fiscal year 2010-11 to 2012-13. Select an individual age group from the list on the left side-bar bar to view the organization’s population by fiscal year for that age group. ",
              "fr": "Le graphique 2 présente les tendances de la population de l’organisation de l’exercice financier 2010-2011 à 2012-2013. Choisissez un groupe d'âge dans le menu de gauche pour en représenter l’effectif de l'organisation par exercice."
          }
                }
      , prep_data: function () {
          var name = "Age Group";
          var years = this.years = ['{{last_year_3}}',
                                  '{{last_year_2}}',
                                  "{{last_year}}"];
          this.to_years = _.object(_.map(years, m), this.years);
          this.extract_for_year = function (year) {
              return _.filter(_.map(this.mapped_objs, function (obj) {
                  return [obj[name], obj[year]];
              }), function (x) { return x[1] != 0 });
          };
          this.get_year_vals = function (age_band) {
              var line = _.first(_.filter(this.mapped_objs,
                function (obj) {
                    return obj[name] == age_band;
                }));
              return _.map(years, function (year) { return line[year] });
          };
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
            , header: this.gt("Age Group")
            , items: _.pluck(this.mapped_objs, "Age Group")
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
          var age_bands = this.extract_for_year(this.to_years[$(event.target).html()]);
          var data = _.map(_.pluck(age_bands, 1), function (x) { return x });
          var ticks = _.pluck(age_bands, 0);
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
          var years = this.get_year_vals($(event.target).text());
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
