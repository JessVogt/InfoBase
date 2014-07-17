(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var LINE = ns('D3.LINE');
  var D3 = ns('D3');

  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
        id: "table6",
      "csv_url" : "../InfoBase/data/table6.csv",
      "coverage": TABLES.coverage.historical,
      "data_type" :TABLES.data_types.financial,
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
        _.each(years, function(header){
              this.add_col(
                {
                  "type":"big-int",
                  "nick":header,
                  "header":header,
                  "description": {
                    "en": "Corresponds to the funds spent by program during the fiscal year " + header,
                    "fr": "Correspondent aux dépenses par programme effectuées au cours de l'exercice financier " + header
                  }
                });
            },this);
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
              return app.get_text("less_than")+ " " +app["big-int-real"](Math.pow(10,5));
            }
            var floor = Math.floor(Math.log(val)/ Math.log(10));
            if (floor <= 5){
              return app.get_text("less_than")+ " " +app["big-int-real"](Math.pow(10,5));
            } else {
              return app.get_text("greater_than")+ " " +app["big-int-real"](Math.pow(10,floor));
            }
          };
          return func;
        }
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
        c.gov_is = _.map(years, function(year){
           return this.horizontal(year,c.dept,true)[is];
        },this);
      },
      info : function(c,q){
        var is = app.get_text("internal_services");
        c.gov_is = _.map(years, function(year){
           return this.horizontal(year,false)[is];
        },this);
      },
      graphics : {
       "details_display_order" : [
         "program_spending"
       ],
       "gov_internal_services" : function(){
         // this is a GoC only graph
         if (this.dept){
            return false;
         }

         data =_.zip( this.data.last_years, this.written_data.gov_is ) ;
         var graph = LINE.ordinal_line({
           series :  {'':  _.clone(this.data.gov_is)},
           ticks : this.data.last_years,
           add_yaxis : true,
           add_xaxis : true,
           formater : app.compact1
         });

         var text_node = this.chapter.areas().text.node();
         text_node.innerHTML = app.get_text("internal_service_spend");
         // add the  table
         TABLES.prepare_and_build_table({
           table_class : "table-condensed ",
           stripe : true,
           rows : data,
           headers : [['','']],
           row_class : ['left_text','right_number'],
           node : text_node
         });

         return {
           graph : graph,
           title : "Internal Services - translate",
         };
       },
       "program_spending": function(){
          var data = _.chain(this.data.dept_historical_program_spending)
            .map(function(row){
              return {label : row.prgm ,
                      data : _.map(years, function(year){
                                return row[year];
                            }),
                      active : false};
            })
            .sortBy(function(x){
                return -d3.sum(x.data);
            })
            .value();

          // create the list as a dynamic graph legend
          var list = D3.create_list(this.chapter.areas().text,data, {
            html : function(d){
              return d.label;
            },
            height : this.height,
            width : 300,
            interactive : true,
            legend : true,
            title : app.get_text("legend"),
            ul_classes : "legend",
            multi_select : true} );

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
            title : "Progam activity spending - translate",
            source : [this.create_links({
              cols : years
            })]
          };
        }
      }
    });
  });
})();
