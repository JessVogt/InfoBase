(function (root) {

  var D3 = ns('D3');
  var GRAPHS = ns('GRAPHS');
  var GROUP = ns('GROUP');
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var UTILS = ns('UTILS');
  var MAPPERS = ns('MAPPERS');

  TABLES.template_args = {
      'common': {
          'in_year_short': '2014',
          'qfr_last_year_short': '2013',
          'last_year_short': '2012',
          'last_year_2_short': '2011',
          'last_year_3_short': '2010',
          'month': 3,
          'q': 1
      },
      'en': {
          'month_name': 'August',
          'qfr_month_name': 'June 30th',
          'in_year': '2013-14',
          'qfr_last_year': '2012-13',
          'last_year': '2011-12',
          'last_year_2': '2010-11',
          'last_year_3': '2009-10'
      },
      'fr': {
          'month_name': 'août',
          'qfr_month_name': '30 juin',
          'in_year': '2013‒2014',
          'qfr_last_year': '2012‒2013',
          'last_year': '2011‒2012',
          'last_year_2': '2010‒2011',
          'last_year_3': '2009‒2010'
      }
  };


    // customize the final app initialization by activating
    // selected gui elements
   APP.dispatcher.once("app_ready", function (app) {
      app.full_dept_list = new APP.fullDeptList({
        app: app,
        cols: 2,
        target: '.org_list_by_min'
      });
   });

  APP.dispatcher.on("dept_ready", function (app) {
      // add the reset button
      $('#back_button').children().remove();
      $('<a class="button button-alert"></a>')
    .html(app.get_text("restart"))
    .attr("href", "#")
    .on("vclick", app.reset)
    .appendTo($('#back_button'))
    .focus();
  });

  APP.dispatcher.on("reset", function (app) {
      $('#back_button').find("a").remove();
  });

  APP.dispatcher.on("new_details_view", function (dv) {
      // add event listener to the back button
      dv.$el.find('li a.back').on("click", dv.tear_down);
      // for IE resize the container to avoid vertical scroll bars
      $('.sidescroll').css(
    { 'height': $('.sidescroll').children().height() + 40 + 'px'
    });

      // add the description
      dv.description = dv.$el.find('.table_description');
      dv.description.html($('#' + dv.def.id + "_" + dv.lang).html());
      // add the QFR link
      if (dv.dept.qfr_link){
        dv.description.find(".qfr_link").attr("href",dv.dept.qfr_link[dv.lang]);
      }

      // setup the open datalinks ** must be after the description setup
      $('a.od_link').attr("href", dv.def.link[dv.lang]);

      // create the graph
      dv.graph_payload = dv.$el.find('.graph_payload');
      // check if department is TBS and then remove the
      // central votes
      dv.graph_view = new dv.def.graph_view({
          key: dv.key,
          app: dv.app,
          def: dv.def,
          data: dv.data,
          footnotes: []
      });
      dv.graph_payload.append(dv.graph_view.render().$el);

      // append the horizontal table text below the table
      //$('.horizontal_instructions')
      //  .append($('#'+ dv.def.id+'_horizontal_instructions_' + dv.lang).html());
  });


  APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m = function(s){
      var lang = app.state.get('lang');
      var args = TABLES.template_args['common'];
      _.extend(args,TABLES.template_args[lang]);
      if (s){
        return Handlebars.compile(s)(args);
      }
      return '';
    };

    APP.dispatcher.trigger("new_table",
    {"id": 'table1',
     "coverage": "in_year",
     "add_cols": function(){
      this.add_col("")
      .add_child([
      {
        "type":"int",
        "key" : true,
        "hidden" : true,
        "nick" : "dept",
        "header":''
      },
      { 
        "type":"int",
        "key" : true,
        "nick" : "votenum",
        "header":{
          "en":"Vote / Statutory",
          "fr":"Crédit / Statutaire"
        }
      },
      {
        "type":"int",
        "key" : true,
        "hidden" : true,
        "nick" : "votestattype",
        "header":''
      },
      {
        "type":"wide-str",
        "nick" : "desc",
        "header":{
          "en":"Description",
          "fr":"Description"
        }
      }
      ]);
      this.add_col("{{in_year}}")
      .add_child([
        {
          "type":"big-int",
          "nick" : 'thisyearauthorities',
          "header":{
            "en":"Total available for use for the year ending March 31, {{in_year_short}}",
            "fr":"Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{in_year_short}}"
          }
        },
        {
          "type": "big-int",
          "header":{
            "en":"Used during the quarter ended {{qfr_month_name}},{{qfr_last_year_short}}",
            "fr":"Crédits utilisés pour le trimestre terminé le {{qfr_month_name}} {{qfr_last_year_short}}"
          }
        },
        {
          "type":"big-int",
          "nick" : 'thisyearexpenditures',
          "header":{
            "en":"Year to date used at quarter-end",
            "fr":"Cumul des crédits utilisés à la fin du trimestre"
          }
        }
      ]);
      this.add_col("{{qfr_last_year}}")
        .add_child([
          {
            "type":"big-int",
            "nick" : 'lastyearauthorities',
            "header":{
              "en":"Total available for use for the year ending March 31, {{qfr_last_year_short}}",
              "fr":"Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{qfr_last_year_short}}"
            }
          },
          {
            "type":"big-int",
            "header":{
              "en":"Used during the quarter ended {{qfr_month_name}},{{last_year_short}} ",
              "fr":"Crédits utilisés pour le trimestre terminé le {{qfr_month_name}} {{last_year_short}}"
            }
          },
          {
            "type":"big-int",
            "nick" : 'lastyearexpenditures',
            "header":{
              "en":"Year to date used at quarter-end",
              "fr":"Cumul des crédits utilisés à la fin du trimestre"
            }
          }
      ]);
     },
     "data_access" : {
     },
     "link": {
         "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
         "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
     },
     "name": { "en": "Statement of Authorities and Expenditures",
         "fr": "État des autorisations et des dépenses"
     },
     "title": { "en": "Statement of Authorities and Expenditures ($000)",
         "fr": "État des autorisations et des dépenses (en milliers de dollars)"
     },
     "mapper": {
         "to": function (row) {
            if (this.lang == 'en') {
              row.splice(4, 1);
            } else {
              row.splice(3, 1);
            }
            return _.tail(row,2);
         },
        "sort": function (mapped_rows) {
            var grps = _.groupBy(mapped_rows, function (row) { 
              return _.isNumber(row[0]);
            });
            if (_.has(grps, true)) {
                grps[true] = _.sortBy(grps[true], function (row) { 
                  return row[0];
                });
            } else {
                grps[true] = [];
            }
            if (_.has(grps, false)) {
                grps[false] = _.sortBy(grps[false], function (row) { 
                  return row[1]; 
                });
            } else {
                grps[false] = [];
            }
            return grps[true].concat(grps[false]);
        },
        "make_filter": function (source_row) {
           return function (candidate_row) {
               if (typeof source_row[1] === 'string') {
                   return candidate_row[4] == source_row[4];
               } else {
                   return candidate_row[2] === source_row[2];
               }
           };
       }
     },
     "table_view": {
       hide_col_ids: [],
       sum_cols: [2, 3, 4, 5, 6, 7],
       min_func: TABLES.add_ministry_sum,
       init_row_data: function () {
         var total = GROUP.fnc_on_group(
           this.row_data,
           { txt_cols: { 0: this.gt("total") },
               func_cols: this.sum_cols,
               func: GROUP.sum_rows
           });
         var self = this;
         this.merge_group_results(
         GROUP.group_rows(
           this.row_data,
           function (row) { return _.isString(row[0]);},
           { txt_cols: { 0: this.gt("sub_total"),
               1: function (g) {
                   var row = _.first(g);
                   return _.isString(row[0]) ? self.gt("stat") : self.gt('voted');
               }
           },
               func_cols: this.sum_cols,
               func: GROUP.sum_rows
           }));
         this.merge_group_results([[this.row_data, total]]);
       }
     },
     mini_view: {
       description: {
            "en": "Total budgetary authorities and expenditures for Q{{q}} {{in_year}} and percent change from the same quarter of the previous fiscal year ({{qfr_last_year}}).",
            "fr": "Total des autorisations et des dépenses budgétaires pour le premier trimestre de {{in_year}} et variation en pourcentage par rapport au même trimestre de l’exercice précédent ({{qfr_last_year}})."
       },
       headers_classes : ['left_text','right_text','right_text','right_text'],
       row_classes : [ 'left_text', 'right_number', 'right_number', 'right_number'],
       prep_data: function () {
          this.rows = _.map(['authorities',"expenditures"],
              function(type){
                var ty = "thisyear"+type, 
                ly= "lastyear"+type,
                total = this.da.get_total([ty, ly]),
                change =  total[ty] / (total[ly] + 1) - 1;
            return [type,
                    this.ttf('big-int',total[ty]),
                    this.ttf("big-int",total[ly]),
                    this.ttf("percentage",change)];
          },this);
          this.headers = [_.map(["Type",
                              "{{in_year_short}} ($000)",
                              "{{qfr_last_year_short}} ($000)",
                              this.gt("change") + " (%)"], m)];
       }
    },
     graph_view: {
            titles: {
                1: {
                    "en": "Largest voted and statutory net expenditures used at quarter-end ($000)",
                    "fr": "Plus importantes dépenses nettes votées et législatives utilisées à la fin du trimestre (en milliers de dollars)"
                }
            },
       descriptions: {
          1: {
              "en": "Graph 1 presents the organization’s five largest voted and statutory net expenditures used at quarter-end. Voted expenditures reflect spending that received parliamentary approval through an appropriation bill, while statutory expenditures reflect spending whose authority was granted through other legislation. Where applicable, the “Other” category captures all other expenditures up to the end of the specified period.",
              "fr": "Le graphique 1 présente les cinq plus importantes dépenses nettes votées et législatives utilisées à la fin du trimestre par le ministère ou l'organisme. Les dépenses votées représentent les dépenses approuvées par le Parlement par l'entremise d'un projet de loi de crédits tandis que les dépenses législatives correspondent aux dépenses autorisées par l'entremise d'autres lois. S’il y a lieu, l’autre catégorie intègre toutes les autres dépenses de l’organisation jusqu'à la fin de la période précisée."
          }
      },
       prep_data: function () {
                var sorter = function (row) { return row[1]; }
                var mapped = _.sortBy(_.map(this.mapped_objs, function (obj) {
                    return [obj["Description"].substring(0, 120),
                  Math.abs(obj["{{in_year}}-Year to date used at quarter-end"])];
                }), sorter).reverse();
                this.top = _.first(mapped, 5)
                var rest = _.reduce(_.rest(mapped, 5),
            function (x, y) { return x + y[1] },
            0);
                if (rest != 0) {
                    this.top = this.top.concat([[this.gt("other"), rest]]);
                }
            }
      , render: function () {
          var exp_pie = $(
        this.template({
            id: this.make_id(1)
          , header: ''
          , description: m(this.descriptions[1][this.lang])
        }));
          this.$el.append(exp_pie);
          var make_graph = this.make_graph;
          setTimeout(function () { make_graph(); });
          return this;
      }
      , make_graph: function () {
          var ticks = _.pluck(this.top, 0);
          var data = _.pluck(this.top, 1);
          var plot = GRAPHS.bar(this.make_id(1),
                  [data],
                 { title: m(this.titles[1][this.lang]),
                     legend: { show: false },
                     ticks: ticks,
                     rotate: true
                 });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
      }
  });

  APP.dispatcher.trigger("new_table",
  {
      id: "table2",
      coverage: "in_year",
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
                "header":{
                  "en":"Planned expenditures for the year ending March 31, {{in_year_short}}",
                  "fr":"Dépenses prévues pour l'exercice se terminant le 31 mars {{in_year_short}}"
                }
             },
             {
                "type":"big-int",
                "header":{
                  "en":"Expended during the quarter ended {{qfr_month_name}}, {{qfr_last_year_short}}",
                  "fr":"Dépensées durant le trimestre terminé le {{qfr_month_name}} {{qfr_last_year_short}}"
                }
             },
             {
                "type":"big-int",
                "nick" : "ytd-exp",
                "header":{
                  "en":"Year to date used at quarter-end",
                  "fr":"Cumul des crédits utilisés à la fin du trimestre"
                }
             }
        ]);
        this.add_col("{{qfr_last_year}}")
          .add_child([
            {
              "type":"big-int",
              "header":{
                "en":"Planned expenditures for the year ending March 31, {{qfr_last_year_short}}",
                "fr":"Dépenses prévues pour l'exercice se terminant le 31 mars {{qfr_last_year_short}}"
              }
            },
            {
              "type":"big-int",
              "header":{
                "en":"Expended during the quarter ended {{qfr_month_name}}, {{last_year_short}}",
                "fr":"Dépensées durant le trimestre terminé le {{qfr_month_name}} {{last_year_short}}"
              }
            },
            {
              "type":"big-int",
              "header":{
                "en":"Year to date used at quarter-end",
                "fr":"Cumul des crédits utilisés à la fin du trimestre"
              }
            }
        ]);
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
      }
    , mapper: {
        to: function (row) {
          row = _.tail(row,2);
          if (row[0] != 'ZGOC') {
            row.splice(1, 1, sos[row[1]][this.lang]);
          }
          return row;
        }
      , make_filter: function (source_row) {
          return function (candidate_row) {
              return (candidate_row[1] == source_row[1]);
          }
      }
    }
    , table_view: {
        sum_cols: [1, 2, 3, 4, 5, 6]
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
         top3['so'],
         top3["ytd-exp"],
         top3["ytd-expgross_percentage"]);
        this.headers= [[this.gt("so"), ' ($000)', '(%)']];
      }
    },
      graph_view: {
          titles: {
              1: {
                  "en": "Largest net expenditures by Standard Object ($000)",
                  "fr": "Plus importantes dépenses nettes par article courant (en milliers de dollars)"
              }
          }
      , descriptions: {
          1: {
              "en": "The graph presents the 5 largest categories of expenditure by Standard Object up to the specified quarter in 2013-14. Standard Object categories reflect expenditures on major items such as transfer payments and personnel.",
              "fr": "Le graphique présente les cinq plus importantes catégories de dépenses par article courant jusqu’au trimestre précisé en 2013-2014. Les catégories d’articles courants font état des dépenses liées aux principaux postes, comme les paiements de transfert et ceux ayant trait au personnel."
          }
      }
      , prep_data: function () {
          var sorter = function (row) { return row[1]; }
          var mapped = _.sortBy(_.map(this.mapped_objs, function (obj) {
              return [obj["Standard Object"].substring(0, 120),
                  obj["{{in_year}}-Year to date used at quarter-end"]];
          }), sorter).reverse();
          this.top = _.first(mapped, 5)
          var rest = _.reduce(_.rest(mapped, 5),
            function (x, y) { return x + y[1] },
            0);
          if (rest != 0) {
              this.top = this.top.concat([[this.gt("other"), rest]]);
          }
      }
      , render: function () {
          var exp_pie = $(
        this.template({
            id: this.make_id(1)
          , header: ''
          , description: m(this.descriptions[1][this.lang])
        }));
          this.$el.append(exp_pie);
          var self = this;
          setTimeout(function () {
              self.make_graph();
          });
          return this;
      }
      , make_graph: function () {
          var ticks = _.pluck(this.top, 0);
          var data = _.pluck(this.top, 1);
          var plot = GRAPHS.bar(this.make_id(1),
                  [data],
                 { title: m(this.titles[1][this.lang]),
                     ticks: ticks,
                     legend: { show: false },
                     rotate: true
                 });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
    }
  });
      //{
      // id: "table3",
      //  "col_defs" : ["wide-str",
      //    "big-int",
      //    "big-int",
      //    "big-int",
      //    "big-int"],
      //  "coverage" : "in_year",
      //  "headers" : { "en" :[[
      //    { "colspan" : 1,
      //      "header" : ""
      //    },
      //    { "colspan" : 2,
      //      "header" : "{{year}}"
      //    },
      //    { "colspan" : 2,
      //      "header" : "{{last_year}}"
      //    }],
      //    [
      //    "Program",
      //    "Expended during the quarter ended {{month}}-{{year}}",
      //    "Year to date used at quarter-end",
      //    "Expended during the quarter ended {{month}}-{{last_year}}",
      //    "Year to date used at quarter-end"
      //    ]],
      //    "fr": [[
      //    { "colspan" : 1,
      //      "header" : ""
      //    },
      //    { "colspan" : 2,
      //      "header" : "{{year}}"
      //    },
      //    { "colspan" : 2,
      //      "header" : "{{last_year}}"
      //    }],
      //    [
      //      "Program",
      //    "Dépensées durant le trimestre terminé le {{month}}-{{year}}",
      //    "Cumul des crédits utilisés à la fin du trimestre",
      //    "Dépensées durant le trimestre terminé le {{month}}-{{last_year}}",
      //    "Cumul des crédits utilisés à la fin du trimestre"
      //    ]]
      //  },
      //  "link" : {
      //    "en" : "",
      //    "fr" : ""
      //  },
      //  "name" : { "en" : "Budgetary expenditures by Program",
      //    "fr" : "Dépenses ministérielles budgétaires par program"
      //  },
      //  "title" : { "en" : "Budgetary expenditures by Program ($000)",
      //    "fr" : "Dépenses ministérielles budgétaires par program ($000)"
      //  }
      //  ,"key" : [0] 
      //  ,mapper : {
      //    to : function(row){
      //      if (this.lang == 'en'){
      //        row.splice(2,1);
      //      } else {
      //        row.splice(1,1);
      //      }
      //      return _.tail(row);
      //    }
      //    ,make_filter : function(source_row){
      //      if (source_row[1] === 'Internal Services'){
      //        return function(candidate_row){ 
      //          return candidate_row[1] == 'Internal Services'
      //        }
      //      }else {
      //        return function(candidate_row){
      //          return (candidate_row[1] != 'Internal Services' &&
      //                  candidate_row[0] != 'ZGOC');
      //        }
      //      }
      //    }
      //  }
      //  ,table_view : { 
      //    sum_cols : []
      //    ,min_func : TABLES.add_ministry_sum
      //    ,init_row_data : function(){
      //    }
      //  }
      //  ,mini_view : {
      //    prep_data : function(){
      //      var ttf = this.app.formater
      //      var col = "Expended during the quarter ended {{month}}-{{year}}";
      //      var data = _.sortBy(this.data, function(d){
      //        return -d[col]
      //      });    
      //      var first = data.shift();
      //      var second = data.shift();
      //      var rest = _.reduce(data, function(x,y){
      //         return x + y[col];
      //      },0);
      //      this.rows = [
      //        ['Top Programs','($000)'],
      //        [first["Program"],first[col]],
      //        [second["Program"],second[col]],
      //        [this.gt("remainder"),rest]
      //      ];
      //      this.rows = _.map(this.rows, function(row){
      //        if (_.isNumber(row[1])){
      //          return [row[0], ttf("big-int",row[1])];
      //        } else {
      //          return [row[0], row[1]];
      //        }
      //      });
      //    }
      //    ,render_data : function(){
      //      this.content = TABLES.build_table({
      //        headers : [[this.gt("program"),' ($000)']],
      //        body : this.rows,
      //        css : [{'font-weight' : 'bold'}, {'text-align' : 'right'}]
      //      });
      //    }
      //  },
      //  graph_view : {
      //    prep_data : function(){
      //    }
      //    ,render : function(){
      //    }
      //  }
      //},
  APP.dispatcher.trigger("new_table",
  {
  id: "table4",
  "coverage": "historical",
  "add_cols": function(){
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
         "nick" : "votenum",
         "header":{
           "en":"Vote {{last_year}} / Statutory",
           "fr":"Crédit {{last_year}} / Légis."
         }
        },
        {
          "type":"int",
          "key" : true,
          "hidden" : true,
          "nick" : "votestattype",
          "header":'',
        },
        {
         "type":"wide-str",
          "header":{
            "en":"Description",
            "fr":"Description"
          }
        }
     ]);
     _.each(['{{last_year_3}}','{{last_year_2}}','{{last_year}}'],
         function(header){
           this.add_col(header)
             .add_child([
                 {
                   "type":"big-int",
                   "nick" : header+"auth",
                   "header":{
                     "en":"Total budgetary authority available for use",
                     "fr":"Autorisations budgétaires disponibles pour l'emploi"
                   }
                 },
                 {
                   "type":"big-int",
                   "nick" : header+"exp",
                   "header":{
                     "en":"Expenditures",
                     "fr":"Dépenses"
                   }
                 }
             ]);
     },this);
  },
  "link": {
      "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
      "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
  },
  "name": { "en": "Authorities and Expenditures",
      "fr": "Autorisations et dépenses"
  },
  "title": { "en": "Authorities and Actual Expenditures ($000)",
      "fr": "Autorisations et dépenses réelles (en milliers de dollars)"
  },
  "sort": function (mapped_rows, lang) {
      var grps = _.groupBy(mapped_rows, function (row) { return _.isNumber(row[0]) });
      if (_.has(grps, true)) {
          grps[true] = _.sortBy(grps[true], function (row) { return row[0] });
      } else {
          grps[true] = [];
      }
      if (_.has(grps, false)) {
          grps[false] = _.sortBy(grps[false], function (row) { return row[1]; });
      } else {
          grps[false] = [];
      }
      return grps[true].concat(grps[false]);
  },
  "on": {
    "data_loaded" : function(app){
      var group = this.depts.group().reduceSum(function(r){ return r['{{last_year}}exp']}).all();
      var group_key = _.object(_.map(group,function(x){
        return [x.key, x.value];
      }));
      _.chain(depts)
        .each(function(dept,key){
          dept.fin_size = group_key[key];
        })
        .filter(function(dept,key){
          return _.isUndefined(dept.fin_size);
        })
        .each(function(dept,key){
          dept.fin_size =0;
        })
    }
  },
  mapper: {
        to: function (row) {
            if (this.lang == 'en') {
                row.splice(3, 1);
            } else {
                row.splice(4, 1);
            }
            // remove acronym and vote type
            return row;
        }
      , make_filter: function (source_row) {
          return function (candidate_row) {
              if (typeof source_row[2] === 'string') {
                  return candidate_row[4] == source_row[4];
              } else {
                  return candidate_row[1] === source_row[1];
              }
          }
      }
  },
  table_view: {
        sum_cols: [2, 3, 4, 5, 6, 7]
      , min_func: TABLES.add_ministry_sum
      , init_row_data: function () {
          var total = GROUP.fnc_on_group(
            this.row_data,
            { txt_cols: { 0: this.gt("total") },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            });
          var self = this;
          this.merge_group_results(
          GROUP.group_rows(
            this.row_data,
            function (row) { return _.isString(row[0]) },
            { txt_cols: { 0: this.gt("sub_total"),
                1: function (g) {
                    var row = _.first(g);
                    return _.isString(row[0]) ? self.gt("stat") : self.gt('voted')
                }
            },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            }));
          this.merge_group_results([[this.row_data, total]]);
      }
  },
  mini_view: {
   description: {
       "en": "Total budgetary voted and statutory authorities and expendiures.",
       "fr": "Montant total des autorisations et dépenses budgétaires votées et législatives."
   },
   classes : [ 'left_text', 
     'right_number', 
     'right_number'],
   prep_data: function () {
     this.rows = _.map(['{{last_year}}','{{last_year_2}}','{{last_year_3}}'],
         function(year){
           var vals = this.da.get_total([year+'auth',year+'exp'],{format: true});
           return [m(year),vals[year+'auth'],vals[year+'exp']];
     },this);
     this.headers = [
       [this.gt("year"),
       this.gt("authorities") + ' ($000)',
       this.gt("expenditures") + ' ($000)']
     ];
   }
  },
  graph_view: {
      titles: {
          1: {
              "en": "Total Organization Voted and Statutory Net Expenditures($000)",
              "fr": "Le total des dépenses votées et des dépenses législatives nettes (en milliers de dollars)"
          },
          2: {
              "en": "Detailed Net Expenditures by Voted/Statutory Item ($000)",
              "fr": "Détail des dépenses nettes par crédit voté/poste législatif (en milliers de dollars)"
          }
      }
      , descriptions: {
          1: {
              "en": "Graph 1 presents total organization voted and statutory net expenditures in each fiscal year from 2009‒10 to 2011‒12. Voted expenditures reflect spending that received parliamentary approval through an appropriation bill, while statutory expenditures reflect spending whose authority was granted through other legislation. Select the fiscal year in the left side-bar to plot the expenditures on the graph.",
              "fr": "Le graphique 1 montre le total des dépenses votées et des dépenses législatives nettes pour chaque exercice de 2009‒2010 à 2011‒2012. Les dépenses votées sont les dépenses qui ont été approuvées par le Parlement au moyen d’un projet de loi de crédits tandis que les dépenses législatives sont des dépenses qui ont été autorisées par une autre loi. Choisissez l’exercice dans le menu de gauche pour en représenter les dépenses."
          },
          2: {
              "en": "Graph 2 presents the net expenditure trend for individual voted and statutory items from fiscal year 2009‒10 to 2011‒12. Select an individual item in the left side-bar to plot an expenditure on the graph.",
              "fr": "Le graphique 2 présente le profil des dépenses nettes de chaque poste voté et législatif des exercices 2009‒2010 à 2011‒2012. Choisissez un poste dans le menu de gauche pour en représenter les dépenses."
          }
      }
      , prep_data: function () {
          var exp = "-Expenditures";
          this.years = ['{{last_year_3}}',
                      '{{last_year_2}}',
                      "{{last_year}}"];
          this.to_years = _.object(_.map(this.years, m), this.years);
          var v_s = _.groupBy(this.mapped_objs,
            function (x) {
                return _.isNumber(x['Vote {{last_year}} / Statutory']);
            });
          v_s[true] = v_s[true] || [_.object(_.zip(this.years),_.map(this.years,function(){return 0;}))];
          v_s[false]= v_s[false] || [_.object(_.zip(this.years),_.map(this.years,function(){return 0;}))];
          this.map_reduce_v_s = function (col) {
              return _.map([true,false], function (v) {
                  return _.reduce(v_s[v], function (x, y) {
                      return x + y[col + exp];
                  }, 0);
              });
          };
          this.get_year_vals = function (description) {
              var line = _.first(_.filter(this.mapped_objs,
                function (obj) {
                    return obj['Description'] == description;
                }));
              return [line['{{last_year_3}}' + exp],
                  line['{{last_year_2}}' + exp],
                line['{{last_year}}' + exp]];
          };
      }
      , render: function () {
          var by_year_graph = $(
            this.template({
                id: this.make_id(1)
              , header: this.gt("year")
              , description: this.descriptions[1][this.lang]
              , items: [m("{{last_year}}"),
                        m("{{last_year_2}}"),
                        m("{{last_year_3}}")]
            })
          );
          var by_item_graph = $(
            this.template({
                id: this.make_id(2)
              , description: this.descriptions[2][this.lang]
              , header: this.gt("votestat")
              , items: _.pluck(this.data, 1)
              , filter: true
            })
          );
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
          var ticks = [this.gt("voted"), this.gt("stat")];
          var data = this.map_reduce_v_s(this.to_years[$(event.target).html()]);
          var plot = GRAPHS.bar(this.make_id(1),
            [data],
            { title: m(this.titles[1][this.lang])
            , legend: { show: false }
            , barWidth: 100
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
      , item_click: function (event) {
          var years = this.get_year_vals($(event.target).html());
          var data = _.map(years, function (x) { return x });
          var ticks = _.map(this.years, m)
          var plot = GRAPHS.bar(this.make_id(2),
            [data],
            { title: this.titles[2][this.lang]
            , legend: { show: false }
            , barWidth: 100
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
    }
  });

  APP.dispatcher.trigger("new_table",
    {
     "id": "table5",
     "coverage": "historical",
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
             "nick" : 'so',
             "header":{
               "en":"Standard Object",
               "fr":"Article courtant"
             }
           }
       );
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
     "sort": function (rows, lang) { return rows },
     mapper: {
        to: function (row) {
          if (row[0] != 'ZGOC') {
            row.splice(1, 1, sos[row[1]][this.lang]);
          }
          return row;
        }
      , make_filter: function (source_row) {
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
             top3['so'],
             top3[year],
             top3[year+"gross_percentage"]);
        this.headers = [[
           this.header_lookup('so'),
           this.gt("expenditures") + ' ($000)',
           "(%)" ]];
      }
    },
      graph_view: {
          titles: {
              1: {
                  "en": "Standard Object Expenditures, by Fiscal Year ($000)",
                  "fr": "Articles courants de dépense, par exercice (en milliers de dollars)"
              },
              2: {
                  "en": "Expenditures by Standard Object, 2009–10 to 2011–12 ($000)",
                  "fr": "Dépenses par article courant, 2009–2010 à 2011–2012 (en milliers de dollars)"
              }
          }
      , descriptions: {
          1: {
              "en": "Graph 1 compares total organizational expenditures by Standard Object category for each fiscal year from 2009-10 to 2011-12. Standard Object categories reflect expenditures on major items such as transfer payments and personnel. Select a fiscal year in the left side-bar to plot the expenditure on the graph. ",
              "fr": "Le graphique 1 montre une comparaison du total des dépenses par article courant des exercices de 2009-2010 à 2011-2012. Les articles courants sont les grandes catégories de dépenses telles que les paiements de transfert et le personnel. Choisissez un exercice dans le menu de gauche pour en représenter les dépenses sur le graphique. "
          },
          2: {
              "en": "Graph 2 presents the expenditure trend for individual Standard Object items from fiscal year 2009-10 to 2011-12. Select an individual Standard Object in the left side-bar to plot the expenditure on the graph. ",
              "fr": "Le graphique 2 présente le profil de chaque article courant pour les exercices 2009‑2010 à 2011‑2012. Choisissez un article courant dans le menu de gauche pour en représenter les dépenses. "
          }
      }
      , prep_data: function () {
          var years = this.years = ['{{last_year_3}}',
                                  '{{last_year_2}}',
                                  "{{last_year}}"];
          this.to_years = _.object(_.map(years, m), this.years);
          this.extract_for_year = function (year) {
              return _.filter(_.map(this.mapped_objs, function (obj) {
                  return [obj['Standard Object'], obj[year]];
              }), function (x) { return x[1] != 0 });
          };
          this.get_year_vals = function (so) {
              var line = _.first(_.filter(this.mapped_objs,
                function (obj) {
                    return obj['Standard Object'] == so;
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
          , header: this.gt("so")
          , items: _.pluck(this.mapped_objs, "Standard Object")
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
          var sos = this.extract_for_year(this.to_years[$(event.target).html()]);
          var data = _.map(_.pluck(sos, 1), function (x) { return x });
          var ticks = _.pluck(sos, 0);
          var plot = GRAPHS.bar(this.make_id(1),
            [data],
            { title: this.titles[1][this.lang]
            , legend: { show: false }
            , rotate: true
            , footnotes: this.footnotes
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
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
      }
  });
  APP.dispatcher.trigger("new_table",
  {
   id: "table6",
   "coverage": "historical",
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
       return _.sortBy(mapped_rows, function (row) { return row[0] });
   },
   mapper: {
        to: function (row) {
            if (this.lang == 'en') {
                row.splice(2, 1);
            } else {
                row.splice(1, 1);
            }
            return row;
        }
      , make_filter: function (source_row) {
          return function (candidate_row) {
              return (candidate_row[1] == source_row[1] &&
                    candidate_row[0] != 'ZGOC');
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
             top3['prgm'],
             top3[year],
             top3[year+"gross_percentage"]);
        this.headers = [[
           this.header_lookup('prgm'),
           this.gt("expenditures") + ' ($000)',
           "(%)" ]];
      }
    },
      graph_view: {
          titles: {
              1: {
                  "en": "Net Expenditures by Program ($000)",
                  "fr": "Dépenses nettes par programme (en milliers de dollars)"
              }
          }
      , descriptions: {
          1: {
              "en": "Graph 1 presents the net expenditure trend for individual programs from fiscal year 2009‒10 to 2011‒12. Select an individual program in the left side-bar to plot the expenditure on the graph.",
              "fr": "Le graphique 1 montre le profil des dépenses nettes par programme pour les exercices de 2009‒2010 à 2011‒2012. Choisissez un programme dans le menu de gauche pour en représenter les dépenses."
          }
      }
      , prep_data: function () {
          var years = this.years = ['{{last_year_3}}',
                                  '{{last_year_2}}',
                                  "{{last_year}}"];
          this.get_year_vals = function (so) {
              var line = _.first(_.filter(this.mapped_objs,
                function (obj) {
                    return obj['Program'] == so;
                }));
              return _.map(years, function (year) { return line[year] });
          };
      }
      , render: function () {
          by_item_graph = $(
        this.template({
            id: this.make_id(2)
          , description: this.descriptions[1][this.lang]
          , filter: true
          , header: this.gt("program")
          , items: _.sortBy(_.pluck(this.mapped_objs, "Program"), _.identity)
        }));
          this.$el.append(by_item_graph);
          this.$el.on("click", "#" + this.make_id(2) + "_sidebar a", this.item_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);

          var self = this;
          setTimeout(function () {
              self.$el.find("#" + self.make_id(2) + "_sidebar a:first").trigger("click");
          });

          return this;
      }
      , item_click: function (event) {
          var years = this.get_year_vals($(event.target).html());
          var ticks = _.map(this.years, m);
          var data = _.map(years, function (x) { return x });
          var plot = GRAPHS.bar(this.make_id(2),
            [data],
            { title: this.titles[1][this.lang]
            , legend: { show: false }
            , footnotes: this.footnotes
            , barWidth: 100
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
      }
  });
  APP.dispatcher.trigger("new_table",
  {
   id: "table7",
   "coverage": "historical",
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
           "type":"int",
           "key" : true,
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
     _.each(['{{last_year_3}}','{{last_year_2}}','{{last_year}}'],
         function(header){
           this.add_col(header)
            .add_child([
            { 
              "type":"big-int",
              "header":{
                "en":"Total budgetary authority available for use",
                "fr":"Autorisations budgétaires disponibles pour l'emploi"
              }
            },{
              "type":"big-int",
               "nick" : header+'exp',
              "header":{
                "en":"Expenditures",
                "fr":"Dépenses"
              }
            }
     ]);
     },this);
   },
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
   "sort": function (mapped_rows, lang) {
        return _.sortBy(mapped_rows, function (row) { return row[0] });
    }
    , mapper: {
        to: function (row) {
            if (this.lang == 'en') {
                row.splice(2, 1);
                row.splice(3, 1);
            } else {
                row.splice(1, 1);
                row.splice(2, 1);
            }
            // remove acronym and vote type
            return row;
        },
        make_filter: function (source_row) {
            var is_stat = source_row[3].substring(0, 3) == '(S)';
            return function (candidate_row) {
                var is_stat_2 = candidate_row[3].substring(0, 3) == '(S)';
                return (candidate_row[1] == source_row[1] &&
                   is_stat == is_stat_2);
            }
        }
    }
    , table_view: {
        sum_cols: [2, 3, 4, 5, 6, 7]
      , min_func: TABLES.add_ministry_sum
      , init_row_data: function () {
          var total = GROUP.fnc_on_group(
            this.row_data,
            { txt_cols: { 0: this.gt("total") },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            });
          var self = this;
          this.merge_group_results(
          GROUP.group_rows(
            this.row_data,
            function (row) { return row[0] },
            { txt_cols: { 0: this.gt("sub_total"),
                1: function (g) {
                    var row = _.first(g);
                    return row[0]
                }
            },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            }));
          this.merge_group_results([[this.row_data, total]]);
      }
    }
    , mini_view: {
        description: {
            "en": "Organization’s transfer payments with the greatest expenditures by value ($000) and proportion of total expenditures (%). Select the fiscal year in the drop-down menu to display the expenditures.",
            "fr": "Les paiements de transfert représentant les plus importantes dépenses en fonction de leur valeur (en milliers de dollars) et en tant que pourcentage des dépenses totales (%). Sélectionnez l'exercice financier figurant dans le menu déroulant pour afficher les dépenses."
        },
        drop_down_options : [
          {val:"{{last_year}}",selected: true},
          {val:"{{last_year_2}}"},
          {val:"{{last_year_3}}"}
        ],
        classes : [
            'left_text', 
            'right_number', 
            'right_number'],
        prep_data: function () {
          var year = this.option.val + 'exp';
          var top3 = this.da.get_top_x([year,'tp'],3,
              {gross_percentage: true, format: true});
          this.rows = _.zip(
               top3['tp'],
               top3[year],
               top3[year+"gross_percentage"]);
          this.headers = [[
             this.header_lookup('tp'),
             this.gt("expenditures") + ' ($000)',
             "(%)" ]];
      }
    },
      graph_view: {
          titles: {
              1: {
                  "en": "Net Expenditures for the largest Transfer Payments ($000)",
                  "fr": "Dépenses nettes pour les plus importants paiements de transfert (en milliers de dollars) "
              },
              2: {
                  "en": "Detailed Net Budgetary authorities available for use and Expenditures by Grant, Contribution, or Other Transfer Payment Item ($000)",
                  "fr": "Détail des autorisations budgétaires nettes disponibles pour emploi et dépenses budgétaires nettes par poste pour une subvention, une contribution ou un autre paiement de transfert (en milliers de dollars)"
              }
          }
      , descriptions: {
          1: {
              "en": "Graph 1 presents the organization four largest transfer payments based on the proportion of the net expenditures for each fiscal year from 2009-10 to 2011-12. Where applicable, the other category captures the expenditures for all the other transfer payments of the selected organization.  Select the fiscal year in the left side-bar to plot the expenditures on the graph.",
              "fr": "Le graphique 1 présente les quatre plus importants paiements de transfert du ministère ou de l'organisme selon leur pourcentage des dépenses nettes pour chaque exercice financier de 2009-2010 à 2011-2012. S’il y a lieu, l’autre catégorie intègre les dépenses de tous les autres paiements de transfert de l’organisation visée. Sélectionnez l’exercice figurant dans la colonne à gauche de l’écran pour faire le tracé des dépenses sur le graphique. "
          },
          2: {
              "en": "Graph 2 presents the net expenditures for individual grant, contribution, and other transfer payment items from fiscal year 2009-10 to 2011-12. Select an individual item in the left side-bar to plot an expenditure on the graph or search by typing one or more key word(s) in the search field to identify specific transfer payment items. The graph allows users to interact with the graphs and focus on particular variables by selecting either budgetary Authorities available for use or Expenditures. ",
              "fr": "Le graphique 2 présente les dépenses nettes pour chaque poste pour une subvention, une contribution ou un autre paiement de transfert des exercices 2009-2010 à 2011-2012. Sélectionnez un poste dans la colonne à gauche de l'écran pour faire le tracé d'une dépense sur le graphique ou effectuez une recherche en saisissant un ou plusieurs mots-clés dans le champ de recherche pour relever des postes particuliers liés aux paiements de transfert. Les utilisateurs peuvent modifier les graphiques afin qu'ils mettent l'accent sur des variables particulières en sélectionnant soit les autorisations budgétaires disponibles pour emploi ou soit les dépenses."
          }
      }
      , prep_data: function () {
          var auth = "-" + this.def.headers['en'][1][2];
          var exp = "-" + this.def.headers['en'][1][3];
          var years = this.years = ['{{last_year_3}}',
                      '{{last_year_2}}',
                      "{{last_year}}"];
          this.to_years = _.object(_.map(this.years, m), this.years);
          this.year_to_top = function (year) {
              var ordered_exps = _.sortBy(_.map(this.mapped_objs,
              function (d) {
                  return [d['Transfer Payment'].substring(0, 100),
                        d[year + exp]];
              })
              , function (x) { return x[1] }
          );
              var top_4 = _.last(ordered_exps, 4);
              if (ordered_exps.length > 4) {
                  top_4.push([
              this.gt("other"),
              UTILS.sum_ar(_.initial(ordered_exps, 4),
                function (x) { return x[1] })
            ]);
              }
              return top_4;
          };
          this.name_to_years = function (name) {
              var line = _.first(_.filter(this.mapped_objs,
                function (obj) {
                    return obj['Transfer Payment'] == name;
                }));
              return _.map([auth, exp], function (x) {
                  return _.map(years, function (year) {
                      return line[year + x];
                  });
              });
          };
      }
      , render: function () {
          var by_year_graph = $(
        this.template({
            id: this.make_id(1)
          , header: this.gt("year")
          , description: m(this.descriptions[1][this.lang])
          , items: [m("{{last_year}}"),
                    m("{{last_year_2}}"),
                    m("{{last_year_3}}")]
        }));
          var by_item_graph = $(
        this.template({
            id: this.make_id(2)
          , filter: true
          , description: m(this.descriptions[2][this.lang])
          , header: this.def.headers[this.lang][1][1]
          , items: _.pluck(this.data, 1)
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
          var top = this.year_to_top(this.to_years[$(event.target).html()]);
          var ticks = _.pluck(top, 0);
          var data = _.pluck(top, 1);
          var plot = GRAPHS.bar(this.make_id(1),
                  [data],
                 { title: m(this.titles[1][this.lang]),
                     ticks: ticks,
                     legend: { show: false },
                     rotate: true
                 });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
      , item_click: function (event) {
          var data = this.name_to_years($(event.target).text());
          var ticks = _.map(this.years, m);
          var series = [
              { label: this.def.headers[this.lang][1][2] },
              { label: this.def.headers[this.lang][1][3] }
        ];
          var plot = GRAPHS.bar(this.make_id(2),
            data,
            { title: m(this.titles[2][this.lang])
            , series: series
            , barWidth: 100
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, data, ticks, this.app);
      }
    }
  });
  APP.dispatcher.trigger("new_table",
  {
   id: "table8",
   "coverage": "in_year",
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
            "type":"int",
            "key":true,
            'nick' : "votenum",
            "header":{
              "en":"Vote {{in_year}} / Statutory",
              "fr":"Crédit {{in_year}} / Légis."
            }
          },
          {
            "type":"int",
            "key" : true,
            "hidden" : true,
            "nick" : "votestattype",
            "header":'',
          },
          {
            "type":"wide-str",
            "header":{
              "en":"Description",
              "fr":"Description du crédit"
            }
          }
      ]);
      this.add_col({
        "header":{
          "en":"Estimates",
          "fr":"Budgets des dépenses"
        }    
      }).add_child([
          {
            "type":"big-int",
            "nick": "mains",
            "header":{
              "en":"Main Estimates",
              "fr":"Budget Principal"
            }
          },
          {
            "type":"big-int",
            "header":{
              "en":"Available from Previous Years",
              "fr":"Disponibles des exercices antérieurs"
            }
          },
          {
            "type":"big-int",
            "nick": "suppsa",
            "header":{
              "en":"Supplementary Estimates A",
              "fr":"Budget supplémentaire A"
            }
          },
          {
            "type":"big-int",
            "nick": "suppsb",
            "header":{
              "en":"Supplementary Estimates B",
              "fr":"Budget supplémentaire B"
            }
          },
          {
            "type":"big-int",
            "nick": "suppsc",
            "header":{
              "en":"Supplementary Estimates C",
              "fr":"Budget supplémentaire C"
            }
          }
      ]);
      this.add_col("")
        .add_child([
          {
            "type":"big-int",
            "header":{
              "en":"Adjustments",
              "fr":"Ajustements"
            }
          },
          {
            "type":"big-int",
            "header":{
              "en":"Total Net Authority",
              "fr":"Autorisations totales nettes"
            }
          }
      ]);
   },
     "link": {
      "en": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
      "fr": "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
     },
     "name": { "en": "Current-year Authorities",
         "fr": "Autorisations pour l'exercice en cours"
     },
     "title": { "en": "Current-year Authorities ($000)",
         "fr": "Autorisations pour l'exercice en cours (en milliers de dollars)"
     }
    , "mapper": {
        "to": function (row) {
            if (this.lang == 'en') {
                row.splice(4, 1);
            } else {
                row.splice(3, 1);
            }
            // remove acronym and vote type
            return row;
        }
      , "make_filter": function (source_row) {
          return function (candidate_row) {
              if (typeof source_row[1] === 'string') {
                  return candidate_row[3] == source_row[3];
              } else {
                  return candidate_row[2] === source_row[2];
              }
          };
      }
    }
    , table_view: {
        hide_col_ids: []
      , sum_cols: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      , min_func: TABLES.add_ministry_sum
      , init_row_data: function () {
          var total = GROUP.fnc_on_group(
            this.row_data,
            { txt_cols: { 0: this.gt("total") },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            });
          var self = this;
          this.merge_group_results(
          GROUP.group_rows(
            this.row_data,
            function (row) { return _.isString(row[0]) },
            { txt_cols: { 0: this.gt("sub_total"),
                1: function (g) {
                    var row = _.first(g);
                    return _.isString(row[0]) ? self.gt("stat") : self.gt('voted')
                }
            },
                func_cols: this.sum_cols,
                func: GROUP.sum_rows
            }));
          this.merge_group_results([[this.row_data, total]]);
      }
    },
    mini_view: {
      description: {
        "en": "Current-year budgetary authorities granted by Parliament by appropriation act as of {{month_name}}, 2013, by value ($000) and proportion of total authorities (%).",
        "fr": "Les autorisations budgétaires délivrées par le Parlement pour l’exercice courant au moyen de la Loi de crédits à compter de {{month_name}} 2013 selon la valeur ($000) et la proportion des autorisations totales (%)."
      },
      classes : ['left_text','right_number','right_number'],
      prep_data: function () {
        var headers = ['mains', 'suppsa', 'suppsb', 'suppsc'];
        var data = this.da.get_total(headers);
        var total = _.reduce(_.values(this.data),function(x,y){return x+y});
        this.rows = _.map(headers, function(h){
          return [this.header_lookup(h),
                  this.ttf("big-int",data[h]),
                  this.ttf("percentage",data[h]/(total+1)-1)];
        },this);
        this.headers= [[this.gt("Estimates"),
                       this.gt("Amount") + ' ($000)', 
                       '(%)']];
      }
    }
    , graph_view: {
        titles: {
            1: {
                "en": "Detailed Net Authorities by Voted/Statutory Item ($000) and by Estimates period as of {{month_name}} 31st, 2013",
                "fr": "Détail des autorisations nettes par crédit voté/poste législatif (en milliers de dollars) et par période de budget de dépenses en date du 31 août 2013"
            }
        }
      , descriptions: {
          1: {
              "en": "This graph presents the net budgetary authority trend for individual voted and statutory items by sources of authority. Select an individual item in the left side-bar to plot an authority on the graph.",
              "fr": "Ce graphique présente la tendance relative aux autorisations nettes pour chaque crédit voté et poste législatif en fonction des sources d'autorisation. Sélectionnez un poste donné figurant dans la colonne à gauche de l’écran pour faire le tracé d'une autorisation sur le graphique. "
          }
      },
        prep_data: function () {
            this.cols = ['Main Estimates',
                     'Supplementary Estimates A',
                     'Supplementary Estimates B',
                     'Supplementary Estimates C'];
            this.type_to_approp = function (type) {
                var line = _.find(this.mapped_objs, function (x) {
                    return x['Description'] == type;
                });
                return _.map(this.cols, function (col) {
                    return line[col];
                });
            }
        }
      , render: function () {
          var by_vote_graph = $(
        this.template({
            id: this.make_id(1)
          , description: m(this.descriptions[1][this.lang])
          , header: this.gt("votestat")
          , filter: true
          , items: _.pluck(this.mapped_objs, "Description")
        }));
          this.$el.append(by_vote_graph);
          this.$el.on("click", "#" + this.make_id(1) + "_sidebar a", this.vote_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);
          var self = this;
          setTimeout(function () {
              self.$el.find("#" + self.make_id(1) + "_sidebar a:first").trigger("click");
          });
          return this;
      }
      , vote_click: function (event) {
          var data = this.type_to_approp($(event.target).html());
          var ticks = this.cols;
          var plot = GRAPHS.bar(this.make_id(1),
            [data],
            { title: m(this.titles[1][this.lang])
            , legend: { show: false }
            , rotate: true
            , ticks: ticks
            });
          GRAPHS.fix_bar_highlight(plot, [data], ticks, this.app);
      }
    }
    });
 });
})(this);
