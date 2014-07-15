(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var D3 = ns('D3');
  var LINE = ns('D3.LINE');

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
      "id": "table5",
      "coverage": TABLES.coverage.historical,
      "data_type" :TABLES.data_types.financial,
      add_cols : function(){
        this.add_col( {
           "type":"int",
           "key" : true,
           "hidden" : true,
           "nick" : "dept",
           "header":'',
         });
        this.add_col( {
            "key" : true,
          "type":"wide-str",
          "nick" : 'so',
          "header":{
            "en":"Standard Object",
            "fr":"Article courtant"
            }
          });
        _.each(years, function(header){
              this.add_col(
                { "type":"big-int",
                  "nick":header,
                  "header": header,
                   "description": {
                     "en": "Corresponds to the funds spent during the fiscal year " + header,
                     "fr": "Correspondent aux dépenses effectuées au cours de l'exercice financier " + header
                   }
                });
            },this);
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
        c.dept_last_year_4_so_spend = this.horizontal("{{last_year_4}}",c.dept,true);
        c.dept_last_year_5_so_spend = this.horizontal("{{last_year_5}}",c.dept,true);
      },
      info : function(c,q){
        var personnel = window.sos[1][c.lang];
        c.gov_last_year_type_spend =  this.spending_type("{{last_year}}",false);
        c.gov_last_year_2_type_spend = this.spending_type("{{last_year_2}}",false);
        c.gov_last_year_3_type_spend = this.spending_type("{{last_year_3}}",false);
        c.gov_last_year_4_type_spend = this.spending_type("{{last_year_4}}",false);
        c.gov_last_year_5_type_spend = this.spending_type("{{last_year_5}}",false);
        c.gov_personnel = _.map(years, function(year){
          return this.horizontal(year,false)[personnel];
        },this);
      },
      graphics : {
       "details_display_order" : [
         "type_spend",
       ],
       "type_spend" : function(){

          var text = this.chapter.areas().text,
              data;

          if (this.dept){
            data = _.chain(window.sos)
              .sortBy(function(val, key){
                return +key;
              })
              .map(function(en_fr){
                 return en_fr[app.lang];
              })
              .map(function(so){
                return {
                    label : so,
                    data : [
                        this.data.dept_last_year_so_spend[so],
                        this.data.dept_last_year_2_so_spend[so],
                        this.data.dept_last_year_3_so_spend[so],
                        this.data.dept_last_year_4_so_spend[so],
                        this.data.dept_last_year_5_so_spend[so]
                    ],
                    active : false
                };
              },this)
              .filter(function(d){
                return d3.sum(d.data) !== 0;
              })
              .value();

          } else {
            data = _.chain(TABLES.spending_types)
              .map(function(t){
                return {
                    label : app.get_text(t+"_spend_type"),
                    data : [
                        this.data.gov_last_year_type_spend[t],
                        this.data.gov_last_year_2_type_spend[t],
                        this.data.gov_last_year_3_type_spend[t],
                        this.data.gov_last_year_4_type_spend[t],
                        this.data.gov_last_year_5_type_spend[t]
                    ],
                    active : false
                };
              },this)
              .sortBy(function(x){
                return -d3.sum(x.data);
              })
              .value();
          }

          // create the list as a dynamic graph legend
          var list = D3.create_list(text,data, {
            html : function(d){
              return d.label;
            },
            height : this.height,
            width : 300,
            interactive : true,
            title : "",
            legend : true,
            ul_classes : "legend",
            multi_select : true} );

          // create the graph
          var graph = LINE.ordinal_line({
            add_legend : false,
            add_xaxis : true,
            ticks : this.data.last_years,
            formater : app.compact1
            });
          graph(this.chapter.areas().graph);

          // hook the list dispatcher up to the graph
          list.dispatch.on("click", LINE.ordinal_on_legend_click(graph));
          // simulate the first item on the list being selected
          list.dispatch.click(data[0],0,list.first,list.list);

          return {
            title : "historical - translate",
            source : [this.create_links({
              cols : years
            })]
          };
       },
       "gov_personnel_spend" : function(){
         if (this.dept){
           return false;
         }
         var text = document.createElement("div");

         text.innerHTML = app.get_text("personnel_spend");
         // add the personnel table
         TABLES.prepare_and_build_table({
           table_class : "table-condensed ",
           stripe : true,
           rows : _.zip( this.data.last_years, this.written_data.gov_personnel ),
           headers : [['','']],
           row_class : ['left_text','right_number'],
           node : text
         });
        return {
          graph : LINE.ordinal_line({
           series :  {'':  _.clone(this.data.gov_personnel)},
           ticks : this.data.last_years,
           add_yaxis : true,
           add_xaxis : true,
           formater : app.compact1
          }),
          text : text,
          title : "personnel spending - translate"
        };
       }
      }
    });
  });
})();
