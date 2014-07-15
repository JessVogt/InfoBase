(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var PACK = ns('D3.PACK');
  var D3 = ns("D3");
  var LINE = ns("D3.LINE");

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
     "id": "table7",
     "coverage": TABLES.coverage.historical,
     "data_type" :TABLES.data_types.financial,
     "link": {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
     },
     "name": {
       "en": "Transfer Payments",
       "fr": "Paiements de transfert"
     },
     "title": {
       "en": "Transfer Payments from {{last_year_3}} to {{last_year}} ($000)",
       "fr": "Paiements de transfert de {{last_year_3}} à {{last_year}} (en milliers de dollars)"
     },
     "add_cols" : function(){
       this.add_col("")
           .add_child([
            {
            "type":"int",
            "key" : true,
            "hidden" : true,
            "nick" : "dept",
            "header":'',
            },
            {
               "type":"int",
               "key" : true,
               "nick" : "type",
               "header":{
                 "en":"Payment Type",
                 "fr":"Type de paiement"
               }
             },
             {
               "type":"wide-str",
               "key" : true,
               "nick" : 'tp',
               "header":{
                 "en":"Transfer Payment",
                 "fr":"Paiement de transfert"
               }
             }
       ]);
       _.each(years,
           function(header){
             this.add_col(header)
              .add_child([
              {
                "type":"big-int",
                 "nick" : header+'auth',
                  "header":{
                    "en":"Total budgetary authority available for use",
                    "fr":"Autorisations budgétaires disponibles pour l'emploi"
                  },
                  "description": {
                      "en": "Corresponds to the authorities provided by Parliament, including transfers from other organizations or adjustments that are made during the year. ",
                      "fr": "Correspond aux autorisations accordées par le Parlement, y compris les transferts provenant d’autres organismes ou les rajustements qui ont été effectués au cours de l’exercice."
              }
              },{
                "type":"big-int",
                 "nick" : header+'exp',
                  "header":{
                    "en":"Expenditures",
                    "fr":"Dépenses"
                  },
                  "description": {
                      "en": "Reflects expenditures against these budgetary authorities.",
                      "fr": "Représentent les dépenses par rapport à ces autorisations budgétaires."
              }
           }
       ]);
       },this);
     },
     "dimensions" : {
        "horizontal" : function(options){
          return function(row){
            var type = row.type;
            if (row.tp.substring(0,3) === '(S)'){
              return type + ' - ' + app.get_text("stat");
            } else {
              return type + ' - ' + app.get_text("voted");
            }
          };
        },
        "payment_types" : function(options){
          return function(row){
            return row.type;
          };
        }
     },
     "sort": function (mapped_rows, lang) {
          return _.sortBy(mapped_rows, function (row) { return row[0];});
      },
      "mapper": function (row) {
         if (this.lang === 'en') {
             row.splice(2, 1);
             row.splice(3, 1);
         } else {
             row.splice(1, 1);
             row.splice(2, 1);
         }
         // remove acronym and vote type
         return row;
      },
      "mini_view": {
          "description": {
              "en": "Organization’s transfer payments with the greatest expenditures by value ($000) and proportion of total expenditures (%). Select the fiscal year in the drop-down menu to display the expenditures.",
              "fr": "Les paiements de transfert représentant les plus importantes dépenses en fonction de leur valeur (en milliers de dollars) et en tant que pourcentage des dépenses totales (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher les dépenses."
          },
          "drop_down_options" : [
            {val:"{{last_year}}",selected: true},
            {val:"{{last_year_2}}"},
            {val:"{{last_year_3}}"}
          ],
          "classes" : [
              'left_text',
              'right_number',
              'right_number'],
          "prep_data": function () {
            var year = this.option.val + 'exp';
            var top3 = this.da.get_top_x([year,'tp'],3,
                {gross_percentage: true, format: true});
            this.rows = _.zip(
                 top3.tp,
                 top3[year],
                 top3[year+"gross_percentage"]);
            this.headers = [[
               this.header_lookup('tp'),
               this.gt("expenditures") + ' ($000)',
               "(%)" ]];
        }
      },
      "dept_info" : function(c,q){
         var cols =  _.map(years, function(year){
           return year+"auth";
         });
         c.dept_g_and_cs =   this.payment_types(cols, c.dept, false);
         c.dept_g_and_c_summary = this.payment_types(cols, c.dept);
         c.dept_last_year_g_and_c   = q.sum("{{last_year}}auth");
         c.dept_last_year_1_g_and_c = q.sum("{{last_year_1}}auth");
         c.dept_last_year_2_g_and_c = q.sum("{{last_year_2}}auth");
         c.dept_last_year_3_g_and_c = q.sum("{{last_year_3}}auth");
         c.dept_last_year_4_g_and_c = q.sum("{{last_year_4}}auth");
      },
      "info" : function(c,q){
         var cols =  _.map(years, function(year){
           return year+"auth";
         });
         c.gov_last_year_g_and_c =   q.sum("{{last_year}}auth");
         c.gov_last_year_1_g_and_c = q.sum("{{last_year_1}}auth");
         c.gov_last_year_2_g_and_c = q.sum("{{last_year_2}}auth");
         c.gov_last_year_3_g_and_c = q.sum("{{last_year_3}}auth");
         c.gov_last_year_4_g_and_c = q.sum("{{last_year_4}}auth");
         c.gov_g_and_c_types = this.payment_types(cols, false);
      },
      "graphics" : {
       "details_display_order" : [
         "comparison",
         "g_and_c_history",
         "payments"
        ],
        "comparison" : function(){
          // this graph will compare both the total
          // g&c spend of this department with the govenrment
          // and with the rest of the it's budget using
          // two circle charts
          var graph = this.chapter.areas().graph;

          this.chapter.split_graph();

          PACK.circle_pie_chart( {
            height : this.height,
            formater : app.compact1,
            font_size : "20",
            data : [
            { value: this.data.gov_last_year_g_and_c,name :'x'},
            { value: this.data.dept_last_year_g_and_c,name :'y'}
            ]
          })(graph.select(".first"));

          PACK.circle_pie_chart( {
            height : this.height,
            formater : app.compact1,
            font_size : "20",
            data : [
            { value: this.data.dept_last_year_auth,name :'x'},
            { value: this.data.dept_last_year_g_and_c,name :'y'}
            ]
          })(graph.select(".second"));

          return {
            title : "clever title",
            text : ""
          };
        },
        "g_and_c_history" : function(){
          var data;
          if (this.dept){
             data = this.data.dept_g_and_c_summary;
          } else {
             data = this.data.gov_g_and_c_types;
          }
          data = _.chain(data)
            .map(function(values, key){
               return {
                 label : key,
                 data : values,
                 active : false
               };
            })
            .sortBy(function(x){ return -d3.sum(x.data);})
            .value();

          // create the list as a dynamic graph legend
          var list = D3.create_list(this.chapter.areas().text,data, {
            html : function(d){
              return d.label;
            },
            height : this.height,
            width : 300,
            interactive : true,
            title : app.get_text("legend"),
            legend : true,
            ul_classes : "legend",
            multi_select : true}
          );

          // create the graph
          var graph = LINE.ordinal_line({
            add_legend : false,
            add_xaxis : true,
            ticks : this.data.last_years,
            formater : app.compact1
          });

          // run the graph once on empty data to establish the sizes
          graph(this.chapter.areas().graph);
          // hook the list dispatcher up to the graph
          list.dispatch.on("click", LINE.ordinal_on_legend_click(graph));
          // simulate the first item on the list being selected
          list.dispatch.click(data[0],0,list.first,list.list);
          return {
            "title" : "grants and contributions - translate",
            //"source" : ,
          };
        },
        "payments": function(){
          var self = this;
          var data = d3.keys(this.data.dept_g_and_cs);
          // split the graph area for the legend + graph
          var _graph_area = this.chapter
                                .change_span("span-8")
                                .split_graph()
                                .areas()
                                .graph;
          var legend_area = _graph_area.select(".first");
          var graph_area = _graph_area.select(".second");
          
          var select = legend_area
            .append("div")
            .append("select")
            .on("change", function(d){
              //The currently selected option index is kept in a
              //property called selectedIndex on the select element.
              //Selections are arrays, so elements can be accessed
              //directly (e.g., selection[0][0]).
              //Each option element will have data bound to it, stored
              //in a property called __data__:
              var index = this.selectedIndex;
              draw_graph(self.data.dept_g_and_cs[this[index].__data__]);
            })
            .selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .attr("value",_.identity )
            .html(_.identity);

          var draw_graph = function(_data){
            // remove evreything from the legend and graph area to be redrawn
            _graph_area.selectAll(".first .d3-list, .second *").remove();

            _data = _.chain(_data)
              .map(function(row){
                return {label : row.tp,
                        data : _.map(years, function(year){
                                  return row[year+"auth"];
                              }),
                        active : false};
              })
              .sortBy(function(x){
                  return -d3.sum(x.data);
              })
              .value();

            // create the list as a dynamic graph legend
            var list = D3.create_list(legend_area,_data, {
              html : function(d){
                return d.label;
              },
              height : self.height,
              width : 400,
              interactive : true,
              title : app.get_text("legend"),
              legend : true,
              ul_classes : "legend",
              multi_select : true}
            );

            // create the graph
            var graph = LINE.ordinal_line({
              add_legend : false,
              add_xaxis : true,
              ticks : self.data.last_years,
              formater : app.compact1
            });

            // run the graph once on empty data to establish the sizes
            graph(graph_area);
            // hook the list dispatcher up to the graph
            list.dispatch.on("click", LINE.ordinal_on_legend_click(graph));
            // simulate the first item on the list being selected
            list.dispatch.click(_data[0],0,list.first,list.list);
          };
          draw_graph(self.data.dept_g_and_cs[data[0]]);
          return {
            title : "individual grant payments - translate",
            text : "awesome text here - develop/translate"
          };
        }
      }
    });
  });
})();
