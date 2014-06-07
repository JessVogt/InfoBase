(function (root) {
  var TABLES = ns('TABLES');
  var D3 = ns('D3');
  var APP = ns('APP');
  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
      {
        id: "table2",
      "coverage": TABLES.coverage.in_year,
      "data_type" :TABLES.data_types.financial,
      add_cols : function(){
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
          "key" : true,
      "type":"wide-str",
      "nick" : "so",
      "header":{
        "en":"Standard Object",
      "fr":"Article Courant"
      }
        } 
        ]);
    this.add_col("{{in_year}}")
      .add_child([
          {
            "type":"big-int",
        "nick" : "plannedexp",
        "header":{
          "en":"Planned expenditures for the year ending March 31, {{in_year_short}}",
        "fr":"Dépenses prévues pour l'exercice se terminant le 31 mars {{in_year_short}}"
        },
              "description": {
                  "en": "Corresponds to the planned expenditures tabled by agencies and departments in their QFR for the fiscal year ending on March 31st of the relevant year.",
                  "fr": "Correspondent aux dépenses prévues présentées par les organismes et ministères dans leur rapport financier trimestriel (RFT) pour l’exercice se terminant le 31 mars de l’année pertinente."
              }
          },
          {
            "type":"big-int",
        "header":{
          "en":"Expended during the quarter ended {{qfr_month_name}}, {{qfr_last_year_short}}",
        "fr":"Dépensées durant le trimestre terminé le {{qfr_month_name}} {{qfr_last_year_short}}"
        },
              "description": {
                  "en": "Represents the expenditures that have been made for the selected quarter.",
                  "fr": "Représentent les dépenses engagées pendant le trimestre sélectionné."
              }
          },
          {
            "type":"big-int",
        "nick" : "ytd-exp",
        "header":{
          "en":"Year to date used at quarter-end",
          "fr":"Cumul des crédits utilisés à la fin du trimestre"
        },
              "description": {
                  "en": "Represents the sum of all spending made by the organization up to the specified period.",
                  "fr": "Désigne la somme de toutes les dépenses effectuées par le ministère ou l’organisme jusqu’à la période sélectionnée."
              }
          }
    ]);
    this.add_col("{{qfr_last_year}}")
      .add_child([
          {
            "type":"big-int",
            "nick" :  "last_year_plannedexp",
        "header":{
          "en":"Planned expenditures for the year ending March 31, {{qfr_last_year_short}}",
        "fr":"Dépenses prévues pour l'exercice se terminant le 31 mars {{qfr_last_year_short}}"
        },
              "description": {
                  "en": "Corresponds to the planned expenditures tabled by agencies and departments in their QFR for the fiscal year ending on March 31st of the relevant year.",
                  "fr": "Correspondent aux dépenses prévues présentées par les organismes et ministères dans leur rapport financier trimestriel (RFT) pour l’exercice se terminant le 31 mars de l’année pertinente."
              }
          },
          {
            "type":"big-int",
        "header":{
          "en":"Expended during the quarter ended {{qfr_month_name}}, {{last_year_short}}",
        "fr":"Dépensées durant le trimestre terminé le {{qfr_month_name}} {{last_year_short}}"
        },
              "description": {
                  "en": "Represents the expenditures that have been made for the selected quarter.",
                  "fr": "Représentent les dépenses engagées pendant le trimestre sélectionné."
              }
          },
          {
            "type":"big-int",
        "header":{
          "en":"Year to date used at quarter-end",
        "fr":"Cumul des crédits utilisés à la fin du trimestre"
        },
              "description": {
                  "en": "Represents the sum of all spending made by the organization up to the specified period.",
                  "fr": "Désigne la somme de toutes les dépenses effectuées par le ministère ou l’organisme jusqu’à la période sélectionnée."
              }
          }
    ]);
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
      link: {
        "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      name: { "en": "Expenditures by Standard Object",
        "fr": "Dépenses par article courant"
      },
      title: { "en": "Expenditures by Standard Object ($000)",
        "fr": "Dépenses par article courant (en milliers de dollars)"
      },
      "mapper": function (row) {
        if (row[0] !== 'ZGOC') {
          row.splice(1, 1, sos[row[1]][this.lang]);
        }
        return row;
      },
      mini_view: {
        description: {
          "en": "Top three net expenditure categories as of Q{{q}} {{in_year}} by value ($000) and proportion of total expenditures (%).",
            "fr": "Les trois plus importantes catégories de dépenses nettes lors du premier trimestre de {{in_year}} en fonction de leur valeur (en milliers de dollars) et en tant que pourcentage des dépenses totales (%)."
        },
        classes : [ 'left_text', 
        'right_number', 
        'right_number'],
        prep_data: function () {
          var top3 = this.da.get_top_x(["ytd-exp",'so'],3,
              {gross_percentage: true, format: true});
          this.rows = _.zip(
              top3.so,
              top3["ytd-exp"],
              top3["ytd-expgross_percentage"]);
          this.headers= [[this.gt("so"), ' ($000)', '(%)']];
        }
      },
      dept_info : function(c,q){
        c.dept_in_year_qfr_so_spend = this.horizontal("plannedexp",c.dept,true);
        c.dept_last_year_qfr_so_spend = this.horizontal("last_year_plannedexp",c.dept,true);
        c.dept_this_year_type_spend = q.get_cols(["plannedexp","so"],{"sorted": true});
      },
      info : function(c,q){
        c.gov_this_year_type_spend =  this.spending_type("plannedexp",false);
      },
      graphics : {
       "details_display_order" : [
         "so_spending",
       ],
        "so_spending": function(options){
          var last_year_data =  this.data.dept_last_year_qfr_so_spend;
          // ensure the graph will always be span-8
          this.graph_area.classed("span-4",false);
          this.graph_area.classed("span-8",true);

          D3.pack_and_bar({
            "height" : 400,
            "formater" : this.compact1,
            "app" : this.app,
            "graph_area": this.graph_area,
            "pack_data" :  _.chain(this.data.dept_in_year_qfr_so_spend)
                          .pairs()
                          .map(function(x){ return {value:x[1],name:x[0]};})
                          .value(),
            "post_bar_render": function(bar_container,d){
              bar_container.selectAll(".x.axis .tick text")
                .style({ 'font-size' : "10px" });
              bar_container.selectAll(".title")
                .style({ 'font-size' : "14px","font-weight":"bold" });
            },
            "packed_data_to_bar" : function(d){
               return [
                 last_year_data[d.name] || 0,
                 d.__value__
                ];
            },
            "ticks" : function(d){
              return [
                  m("{{qfr_last_year}}"),
                  m("{{in_year}}")
                ];
            }
          });
        }
      }
    });
  });
})();
