(function(root){

  var GRAPHS = ns('GRAPHS');
  var GROUP = ns('GROUP');
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var UTILS = ns('UTILS');
  var MAPPERS = ns('MAPPERS');

  TABLES.template_args = {
    'common' : {
      'in_year_short' : '2014',
      'qfr_last_year_short' : '2013',
      'last_year_short' : '2012',
      'last_year_2_short' : '2011',
      'last_year_3_short' : '2010',
      'month' : 3,
      'q' : 1
    },
    'en' : {
      'month_name' : 'June',
      'in_year' : '2013-14',
       'qfr_last_year' : '2012-13',
      'last_year' : '2011-12',
      'last_year_2' : '2010-11',
      'last_year_3' : '2009-10'
    },
    'fr' : {
      'month_name' : 'juin',
      'in_year' : '2013‒2014',
       'qfr_last_year' : '2012‒13',
      'last_year' : '2011‒2012',
      'last_year_2' : '2010‒2011',
      'last_year_3' : '2009‒2010'
    }
  };

  var make_year_select = function(){
    var m = TABLES.m ;
    return $('<select>')
      .append($("<option>").attr("value","{{last_year}}").html(m("{{last_year}}")))
      .append($("<option>").attr("value","{{last_year_2}}").html(m("{{last_year_2}}")))
      .append($("<option>").attr("value","{{last_year_3}}").html(m("{{last_year_3}}")));
  }

  // customize the final app initialization by activating
  // selected gui elements
  APP.dispatcher.once("app_ready",function(app){
    app.full_dept_list = new APP.fullDeptList({
      app:app
      ,cols : 2
      ,target: '.org_list_by_min'
    });
  });

  APP.dispatcher.on("dept_ready",function(app){
    // add the reset button
    $('#back_button').children().remove();
    $('<a class="button button-alert"></a>')
      .html(app.get_text("restart"))
      .attr("href" , "#")
      .on("vclick",app.reset)
      .appendTo($('#back_button'))
      .focus()
  });

  APP.dispatcher.on("home", function(app){
    $('#back_button').find("a").remove();
  });

  APP.dispatcher.on("new_org_view",function(dv){
    window.scrollTo(0,$('h1.dept').position().top);
  });

  APP.dispatcher.on("new_details_view",function(dv){
    // add event listener to the back button
    dv.$el.find('li a.back').on("click",dv.tear_down);
    // for IE resize the container to avoid vertical scroll bars
    $('.sidescroll').css(
      {'height' : $('.sidescroll').children().height()+40 +'px'
    });

    // add the description
    dv.description = dv.$el.find('.table_description');
    dv.description.html($('#'+dv.def.id+"_"+dv.lang).html());

    // setup the open datalinks ** must be after the description setup
    $('a.od_link').attr("href",dv.def.link[dv.lang]);

    // create the graph
    dv.graph_payload = dv.$el.find('.graph_payload');
    // check if department is TBS and then remove the
    // central votes
    dv.graph_view = new dv.def.graph_view({
      key : dv.key,
      app : dv.app,
      def : dv.def,
      data : dv.data,
      footnotes : []
    });
    dv.graph_payload.append(dv.graph_view.render().$el);

    // append the horizontal table text below the table
    //$('.horizontal_instructions')
    //  .append($('#'+ dv.def.id+'_horizontal_instructions_' + dv.lang).html());
  });

  APP.dispatcher.on("load_tables",function(app){
    var m = TABLES.m;
    TABLES.tables.add([
      {
      "id": 'table1',
      "col_defs" : [ "int",
                    "wide-str",
                    "big-int",
                    "big-int",
                    "big-int",
                    "big-int",
                    "big-int",
                    "big-int",
                      ],
      "coverage" : "in_year",
      "headers" : {"en" :[
      [
        { "colspan" : 2,
        "header" : ""
        },
        { "colspan" : 3,
        "header" : "{{in_year}}"
        },
        { "colspan" : 3,
        "header" : "{{qfr_last_year}}"
        }
      ],[
        "Vote / Statutory",
        "Description",
        "Total available for use for the year ending March 31,{{in_year_short}}",
        "Used during the quarter ended {{month_name}}-{{in_year_short}}",
        "Year to date used at quarter-end",
        "Total available for use for the year ending March 31,{{qfr_last_year_short}}",
        "Used during the quarter ended {{month_name}}-{{qfr_last_year_short}} ",
        "Year to date used at quarter-end"
      ]],
        "fr": [ [
        { "colspan" : 2,
        "header" : ""
        },
        { "colspan" : 3,
        "header" : "{{in_year}}"
        },
        { "colspan" : 3,
        "header" : "{{qfr_last_year}}"
        }
      ],[
        "Crédit / Statutaire",
        "Description", 
        "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{year}}",
        "Crédits utilisés pour le trimestre terminé le {{month}}-{{in_year}}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {{qfr_last_year}}",
        "Crédits utilisés pour le trimestre terminé le {{month}}-{{qfr_last_year}}",
        "Cumul des crédits utilisés à la fin du trimestre"
        ]]},
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Statement of Authorities and Expenditures",
                "fr" : "État des autorisations et Dépenses"
              },
      "title" : { "en" : "Statement of Authorities and Expenditures",
                "fr" : "État des autorisations et Dépenses"
                }
      ,"sort" : function(mapped_rows,lang){
          var grps = _.groupBy(mapped_rows,function(row){ return _.isNumber(row[0])});
          if (_.has(grps,true)) {
            grps[true] = _.sortBy(grps[true],function(row){ return row[0]});
          } else {
            grps[true] = [];
          }
          if (_.has(grps,false)) {
            grps[false] = _.sortBy(grps[false],function(row){ return row[1]; });
          } else {
            grps[false] = [];
          }
          return grps[true].concat(grps[false]);
      }
      ,"key" : [0,1]
      ,"mapper" : {
        "to" : function(row){
          if (this.lang == 'en'){
            row.splice(3,1);
          } else {
            row.splice(4,1);
          }
          // remove acronym and vote type
          return _.tail(row,2);
        }
        ,"make_filter" : function(source_row){
          return function(condidate_row){

          };
        }
      }
      ,"table_view" : { 
        hide_col_ids : []
        ,sum_cols : [2,3,4,5,6,7]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var total =   GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : this.gt("total")},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows});
          var self = this;
          this.merge_group_results(
            GROUP.group_rows(
              this.row_data,
              function(row){ return _.isString(row[0])},
              {txt_cols : {0 : this.gt("sub_total"),
                            1 : function(g){
                              var row = _.first(g);
                              return _.isString(row[0]) ? self.gt("stat") : self.gt('vote') }},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows}));
            this.merge_group_results([[this.row_data,total]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "Change in authorities and expenditures between {{in_year}} and {{qfr_last_year}}",
          "fr" : "Différence entre les autorisations et les dépenses entre {in_{year}} et {{qfr_last_year}}"
        }
        ,prep_data : function(){
          var ttf = _.partial(this.app.formater,"percentage");
          var mapper =  function(x){return [
            x['Total available for use for the year ending March 31,{{in_year_short}}'],
            x["{{qfr_last_year}}-Year to date used at quarter-end"],
            x['Total available for use for the year ending March 31,{{qfr_last_year_short}}'],
            x["{{in_year}}-Year to date used at quarter-end"]];
          };
          var v_s = _.groupBy(this.data,function(x){
            return _.isNumber(x['Vote / Statutory']);
          });
          var lines = _.map(this.data,mapper);
          var total = _.reduce(lines,UTILS.add_ar, [0,0,0,0]);
          var auth = total[0] / (total[2]+1) -1;
          var exp = total[1] / (total[3]+1) -1;
          var auth_text = auth >= 0 ? this.gt("up") : this.gt("down");
          var exp_text = auth >= 0 ? this.gt("up") : this.gt("down");
          this.rows = [
            [this.gt("authorities"), 
             auth_text + " " + ttf(Math.abs(auth))
            ],
            [this.gt("expenditures"), 
             auth_text + " " + ttf(Math.abs(exp))
            ]
          ];
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [],
            body : this.rows,
            css : [{'font-weight' : 'bold','text-align' : 'left'}, 
                    {'text-align' : 'left'}
          ]
          });
        }
      },
      graph_view : {
        prep_data : function(){
          var sorter =  function(row){ return row[1]; }
          var mapped = _.sortBy(_.map(this.mapped_objs, function(obj){
            return [obj["Description"].substring(0,120),
                    Math.abs(obj["{{in_year}}-Year to date used at quarter-end"])];
          }),sorter).reverse();
          this.top = _.first(mapped,5)
          var rest = _.reduce(_.rest(mapped,5),
              function(x,y){ return x + y[1]},
              0);
          if (rest != 0 ) {
            this.top = this.top.concat([ [this.gt("other"), rest]]); 
          }
        }
        ,render : function(){
          var exp_pie = $(
          this.template({
            id : this.make_id(1)
            ,header : ''
            ,description : '' //this.descriptions[1][this.lang]
          }));
          this.$el.append(exp_pie);
          var make_graph=this.make_graph;
          setTimeout(function(){ make_graph(); });
          return this;
        }
        ,make_graph : function(){
          var ticks = _.pluck(this.top, 0);
          var data = _.pluck(this.top, 1);
          var plot = GRAPHS.bar(this.make_id(1),
                    [data],
                   {title : "",
                    legend : {show:false},
                    ticks : ticks,
                    rotate : true
                   });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
      }
    },
    {
      id: "table2",
      col_defs : ["wide-str",
        "big-int",
        "big-int",
        "big-int",
        "big-int",
        "big-int",
        "big-int"],
      coverage : "in_year",
      headers : {"en" :[[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 3,
          "header" : "{{in_year}}"
        },
        { "colspan" : 3,
          "header" : "{{qfr_last_year}}"
        }],
        [
        "Standard Object",
        "Planned expenditures for the year ending March 31, {{in_year}}",
        "Expended during the quarter ended {{month}}-{{in_year}}",
        "Year to date used at quarter-end",
        "Planned expenditures for the year ending March 31, {{qfr_last_year}}",
        "Expended during the quarter ended {{month}}-{{qfr_last_year}}",
        "Year to date used at quarter-end"
        ]],
        "fr": [[
        { "colspan" : 1,
          "header" : ""
        },
        { "colspan" : 3,
          "header" : "{{in_year}}"
        },
        { "colspan" : 3,
          "header" : "{{qfr_last_year}}"
        }],
        [
          "Article Courant",
        "Dépenses prévues pour l'exercice se terminant le 31 mars, {{in_year}}",
        "Dépensées durant le trimestre terminé le {{month}}-{{in_year}}",
        "Cumul des crédits utilisés à la fin du trimestre",
        "Dépenses prévues pour l'exercice se terminant le 31 mars, {{qfr_last_year}}",
        "Dépensées durant le trimestre terminé le {{month}}-{{qfr_last_year}}",
        "Cumul des crédits utilisés à la fin du trimestre"
        ]]},
      link : {
        "en" : "",
        "fr" : ""
      },
      name : { "en" : "Expenditures by Standard Object",
        "fr" : "Dépenses ministérielles budgétaires par article courant"
      },
      title : { "en" : "Expenditures by Standard Object ($000)",
        "fr" : "Dépenses ministérielles budgétaires par article courant ($000)"
      }
      ,key : [0]
      ,mapper : {
        to : function(row){
          return _.tail(row)
        }
        ,make_filter : function(source_row){
          return function(candidate_row){
          };
        }
      }
      ,table_view : { 
        sum_cols : [1,2,3,4,5,6]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var txt = this.gt("total");
          this.merge_group_results(
            [[this.row_data,
            GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : txt},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows})]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "The top expenditure categories as of {{month_name}}, {{in_year}}",
          "fr" : "Les dépenses les plus importantes du {{month_name}}, {{in_year}}"
        }
        ,prep_data : function(){
          var ttf_f = _.partial(this.app.formater,'big-int');
          var ttf_p = _.partial(this.app.formater,'percentage');

          var col = "Expended during the quarter ended {{month}}-{{in_year}}";
          var data = _.sortBy(this.data, function(d){
            return -d[col]
          });    

          var sum = _.reduce(_.map(data,
                                   function(x){return x[col]}),
                            function(x,y){
                              return Math.abs(x)+Math.abs(y)
                            }
          );
          this.rows  = _.map( _.head(data,3),function(row){
            return  [row["Standard Object"],
                    ttf_f(row[col]),
                    ttf_p( row[col]/(sum || 1))]
          });
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [[this.gt("so"),' ($000)','(%)']],
            body : this.rows,
            css : [{'font-weight' : 'bold','text-align' : 'left'}, 
                   {'text-align' : 'right'},
                   {'text-align' : 'right'},
          ]
          });
        }
      },
      graph_view : {
        prep_data : function(){
          var sorter =  function(row){ return row[1]; }
          var mapped = _.sortBy(_.map(this.mapped_objs, function(obj){
            return [obj["Standard Object"].substring(0,120),
                    Math.abs(obj["{{in_year}}-Year to date used at quarter-end"])];
          }),sorter).reverse();
          this.top = _.first(mapped,5)
          var rest = _.reduce(_.rest(mapped,5),
              function(x,y){ return x + y[1]},
              0);
          if (rest != 0 ) {
            this.top = this.top.concat([ [this.gt("other"), rest]]); 
          }
        }
        ,render : function(){
          var exp_pie = $(
          this.template({
            id : this.make_id(1)
            ,header : ''
            ,description : '' //this.descriptions[1][this.lang]
          }));
          this.$el.append(exp_pie);
          var self=this;
          setTimeout(function(){
            self.make_graph();
          });
          return this;
        }
        ,make_graph : function(){
          var ticks = _.pluck(this.top, 0);
          var data = _.pluck(this.top, 1);
          var plot = GRAPHS.bar(this.make_id(1),
                    [data],
                   {title : "",
                    ticks : ticks,
                    legend : {show:false},
                    rotate : true
                   });
          debugger
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
      }
    },
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
    {
      id: "table4",
      col_defs : [ 'int',
        "wide-str",
        "big-int",
        "big-int",
        "big-int",
        "big-int",
        "big-int",
        "big-int"
      ],
      "coverage" : "historical",
      "headers" : {"en" :[[
        { "colspan" : 2,                   
        "header" : ""                      
        },                                 
        { "colspan" : 2,                  
        "header" : "{{last_year_3}}"  
        },                                 
        { "colspan" : 2,                   
        "header" : "{{last_year_2}}" 
        },                                 
        { "colspan" : 2,                   
        "header" : "{{last_year}}"         
        }                                  
        ],
        [
          "Vote {{last_year}}/ Statutory",
          "Description",
          "Total budgetary authority available for use",
          "Expenditures",
          "Total budgetary authority available for use",
          "Expenditures",
          "Total budgetary authority available for use",
          "Expenditures"
        ]],
        "fr": [
              [
                { "colspan" : 2,                   
                "header" : ""                      
                },                                 
                { "colspan" : 2,                  
                "header" : "{{last_year_3}}"  
                },                                 
                { "colspan" : 2,                   
                "header" : "{{last_year_2}}" 
                },                                 
                { "colspan" : 2,                   
                "header" : "{{last_year}}"         
                }                                  
            ],
          [
          "Crédit {{last_year}} / Légis.",
          "Description",
          "Autorisations budgétaires disponibles pour l'emploi",
          "Dépenses",
          "Autorisations budgétaires disponibles pour l'emploi",
          "Dépenses",
          "Autorisations budgétaires disponibles pour l'emploi",
          "Dépenses"
        ]]},
      "link" : {
        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name" : { "en" : "Authorities and Expenditures",
        "fr" : "Autorisations et dépenses"
      },
        "title" : { "en" : "Authorities and Actual Expenditures ($000)",
        "fr" : "Autorisations et dépenses réelles ($000)"
      }
      ,"sort" : function(mapped_rows,lang){
          var grps = _.groupBy(mapped_rows,function(row){ return _.isNumber(row[0])});
          if (_.has(grps,true)) {
            grps[true] = _.sortBy(grps[true],function(row){ return row[0]});
          } else {
            grps[true] = [];
          }
          if (_.has(grps,false)) {
            grps[false] = _.sortBy(grps[false],function(row){ return row[1]; });
          } else {
            grps[false] = [];
          }
          return grps[true].concat(grps[false]);
      }
      ,"key" : [0,1]
      ,mapper : {
        to : function(row){
          if (this.lang == 'en'){
            row.splice(3,1);
            row.splice(3,1);
          } else {
            row.splice(2,1);
            row.splice(4,1);
          }
          // remove acronym and vote type
          return _.tail(row,2);
        }
        ,make_filter : function(source_row){
          return function(candidate_row){
            if (typeof source_row[2] === 'string'){
              return  candidate_row[4] == source_row[4];
            } else {
              return candidate_row[1] === source_row[1];
            }
          }
        }
      }
      ,table_view : { 
        sum_cols : [2,3,4,5,6,7]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var total =   GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : this.gt("total")},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows});
          var self = this;
          this.merge_group_results(
            GROUP.group_rows(
              this.row_data,
              function(row){ return _.isString(row[0])},
              {txt_cols : {0 : this.gt("sub_total"),
                            1 : function(g){
                              var row = _.first(g);
                              return _.isString(row[0]) ? self.gt("stat") : self.gt('vote') }},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows}));
            this.merge_group_results([[this.row_data,total]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "Total budgetary voted and statutory authorities",
          "fr" : "Montant total des autorisations budgétaires votées et législatives"
        }
        ,prep_data : function(){
          var ttf = this.app.formater;
          var total = _.map(["{{last_year_3}}-Total budgetary authority available for use",
                            "{{last_year_3}}-Expenditures",
                            "{{last_year_2}}-Total budgetary authority available for use", 
                            "{{last_year_2}}-Expenditures",
                            "{{last_year}}-Total budgetary authority available for use", 
                            "{{last_year}}-Expenditures"],
                function(col){ 
                  return _.reduce(_.pluck(this.data,col),
                    function(x,y){
                      return x+y;
                    });
                },this);
          total = _.map(total, function(x){return ttf("big-int",x)});
          this.rows = [
            [m('{{last_year_short}}'),total[4],total[5]],
            [m('{{last_year_2_short}}'),total[2],total[3]],
            [m('{{last_year_3_short}}'),total[0],total[1]]];
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [[this.gt("year"),
                        this.gt("authorities")+' ($000)',
                        this.gt("expenditures")+' ($000)' ]],
            body : this.rows,
            css : [{'font-weight' : 'bold'}, 
                   {'text-align' : 'right'},
                   {'text-align' : 'right'}]
            ,classes : ['','','wrap-none']
            });
        }
      },
      graph_view : {
        titles : {
          1 : {
            "en" : "Total Organization Voted and Statutory Net Expenditures($000)",
            "fr" : "Le total des dépenses votées et des dépenses législatives nettes (en milliers de dollars)"
          },
          2 : {
            "en" : "Detailed Net Expenditures by Voted/Statutory Item ($000)",
            "fr" : "Détail des dépenses nettes par crédit voté/poste législatif (en milliers de dollars)"
          }
        }
        ,descriptions : {
          1 : {
            "en" : "Graph 1 presents total organization voted and statutory net expenditures in each fiscal year from 2009‒10 to 2011‒12. Voted expenditures reflect spending that received parliamentary approval through an appropriation bill, while statutory expenditures reflect spending whose authority was granted through other legislation. Select the fiscal year in the left side-bar to plot the expenditures on the graph.",
            "fr" : "Le graphique 1 montre le total des dépenses votées et des dépenses législatives nettes pour chaque exercice de 2009‒2010 à 2011‒2012. Les dépenses votées sont les dépenses qui ont été approuvées par le Parlement au moyen d’un projet de loi de crédits tandis que les dépenses législatives sont des dépenses qui ont été autorisées par une autre loi. Choisissez l’exercice dans le menu de gauche pour en représenter les dépenses."
          },
          2 : {
            "en" : "Graph 2 presents the net expenditure trend for individual voted and statutory items from fiscal year 2009‒10 to 2011‒12. Select an individual item in the left side-bar to plot an expenditure on the graph.",
            "fr" : "Le graphique 2 présente le profil des dépenses nettes de chaque poste voté et législatif des exercices 2009‒2010 à 2011‒2012. Choisissez un poste dans le menu de gauche pour en représenter les dépenses."
          }
        }
        ,prep_data : function(){
          var exp = "-Expenditures";
          this.years = ['{{last_year_3}}',
                        '{{last_year_2}}',
                        "{{last_year}}"];
          this.to_years = _.object(_.map(this.years,m),this.years);
          var v_s= _.groupBy(this.mapped_objs,
              function(x){
                return _.isNumber(x['Vote {{last_year}}/ Statutory']);
          });
          this.map_reduce_v_s = function(col){
            return _.map(v_s, function(group){
              return _.reduce(group, function(x,y){
                return x + y[col+exp];
              },0);
            });
          };
          this.get_year_vals = function(description){
            var line = _.first(_.filter(this.mapped_objs,
                  function(obj){
                    return obj['Description'] == description;
                  }));
            return [line['{{last_year_3}}'+exp],
                    line['{{last_year_2}}'+exp],
                  line['{{last_year}}'+exp]];
          };
        }
        ,render : function(){
          var by_year_graph = $(
          this.template({
            id : this.make_id(1)
            ,header : this.gt("year")
            ,description : this.descriptions[1][this.lang]
            ,items : [m("{{last_year}}"),
                      m("{{last_year_2}}"),
                      m("{{last_year_3}}")]
          }));
          var by_item_graph = $(
          this.template({
            id : this.make_id(2)
            ,description : this.descriptions[2][this.lang]
            ,header : this.gt("votestat")
            ,items : _.pluck(this.data,1)
            ,filter : true
          }));                 
          this.$el.append(by_year_graph);
          this.$el.append(by_item_graph);
          this.$el.on("click","#"+this.make_id(1)+"_sidebar a",this.year_click);
          this.$el.on("click","#"+this.make_id(2)+"_sidebar a",this.item_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);

          var self=this;
          setTimeout(function(){
            self.$el.find("#"+self.make_id(1)+"_sidebar a:first").trigger("click");
            self.$el.find("#"+self.make_id(2)+"_sidebar a:first").trigger("click");
          });

          return this;
        }
        ,year_click : function(event){
          var ticks =  [this.gt("vote"),this.gt("stat")];
          var data = this.map_reduce_v_s(this.to_years[$(event.target).html()]);
          var plot = GRAPHS.bar(this.make_id(1), 
              [data],
              {title: this.titles[1][this.lang]
              ,legend : {show: false} 
              ,barWidth : 100
              ,ticks : ticks
              });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
        ,item_click : function(event){
          var years = this.get_year_vals($(event.target).html());
          var data = _.map(years,function(x){return x});
          var ticks =  _.map(this.years,m)
          var plot = GRAPHS.bar(this.make_id(2), 
              [data],
              {title: this.titles[2][this.lang]
              ,legend : {show: false} 
              ,barWidth : 100
              ,ticks : ticks
              });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);

        }
      }
    },
    {
      id: "table5",
      "col_defs" : ["wide-str",
        "big-int",
        "big-int",
        "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
        "Standard Object",
        "{{last_year_3}}",
        "{{last_year_2}}",
        "{{last_year}}"
        ]],
        "fr": [[
          "Article courtant",
        "{{last_year_3}}",
        "{{last_year_2}}",
        "{{last_year}}"
        ]]},
      "link" : {
        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name" : { "en" : "Expenditures by Standard Object",
        "fr" : "Dépenses par article courant"
      },
      "title" : { "en" : "Expenditures by Standard Object from {{last_year_3}} to {{last_year}} ($000)",
        "fr" : "Dépenses par article courant de {{last_year_3}} à {{last_year}} ($000)"
      }
      ,"key" : [0]
      , "sort" : function(rows,lang){return rows}
      ,mapper : {
        to : function(row){
          if (row[0] != 'ZGOC'){
            row.splice(1,1,sos[row[1]][this.lang]);
          }
          return _.tail(row)
        }
        ,make_filter : function(source_row){
          return function(candidate_row){
            return (candidate_row[1] == source_row[1]);
          }
        }
      }
      ,table_view : { 
        sum_cols : [1,2,3]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var txt = this.gt("total");
          this.merge_group_results(
            [[this.row_data,
            GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : txt},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows})]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "An organization’s standard object with the greatest expenditures for ",
          "fr" : "L'article courant de l’organisation le plus important sur le plan des dépenses pour l’exercice indiqué"
        }
        ,year : "{{last_year}}"
        ,prep_data : function(){
          var ttf = this.app.formater;
          var name = "Standard Object";
          var total = UTILS.sum_ar(_.pluck(this.data,this.year)) + 1;
          var sorted = _.sortBy(this.data, function(obj){
            return obj[this.year];
          },this).reverse();
          this.rows = _.map(_.head(sorted,3),function(obj){
             return [obj[name],
                      ttf("big-int",obj[this.year]),
                      ttf("percentage",obj[this.year]/total)];
          },this);
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [[this.gt("so"),'($000)',"(%)"]],
            body : this.rows,
            css : [{'font-weight' : 'bold','text-align' : 'left'},
                   {'text-align' : 'right'},
                   {'text-align' : 'right'}]
            ,classes : ['','','wrap-none']
          });
        }
        ,post_render : function(){
          this.$el.find('.description').append(
           make_year_select()
           );
          _.bindAll(this,"on_select");
          this.$el.find(".description select")
            .on("change",this.on_select)
            .val(this.year);
        }
        ,on_select : function(e){
          this.year = $(e.target).val();
          this.render();
        }
      },
      graph_view : {
        titles : {
          1 : {
            "en" : "Standard Object Expenditures, by Fiscal Year ($000)",
            "fr" : "Articles courants de dépense, par exercice (en milliers de dollars)"
          },
          2 : {
            "en" : "Expenditures by Standard Object, 2009–10 to 2011–12 ($000)",
            "fr" : "Dépenses par article courant, 2009–2010 à 2011–2012 (en milliers de dollars)"
          }
        }
        ,descriptions : {
          1 : {
            "en" : "Graph 1 compares total organizational expenditures by Standard Object category for each fiscal year from 2009-10 to 2011-12. Standard Object categories reflect expenditures on major items such as transfer payments and personnel. Select a fiscal year in the left side-bar to plot the expenditure on the graph.",
            "fr" : "Le graphique 1 montre une comparaison du total des dépenses par article courant des exercices de 2009-2010 à 2011-2012. Les articles courants sont les grandes catégories de dépenses telles que les paiements de transfert et le personnel. Choisissez un exercice dans le menu de gauche pour en représenter les dépenses sur le graphique."
          },
          2 : {
            "en" : "Graph 2 presents the expenditure trend for individual Standard Object items from fiscal year 2009-10 to 2011-12. Select an individual Standard Object in the left side-bar to plot the expenditure on the graph.",
            "fr" : "Le graphique 2 présente le profil de chaque article courant pour les exercices 2009‑2010 à 2011‑2012. Choisissez un article courant dans le menu de gauche pour en représenter les dépenses."
          }
        }
        ,prep_data : function(){
          var years = this.years = ['{{last_year_3}}',
                                    '{{last_year_2}}',
                                    "{{last_year}}"];
          this.to_years = _.object(_.map(years,m),this.years);
          this.extract_for_year = function(year){
            return _.filter(_.map(this.mapped_objs,function(obj){
              return [obj['Standard Object'],obj[year]];
            }),function(x){return x[1] != 0});
          };
          this.get_year_vals = function(so){
            var line = _.first(_.filter(this.mapped_objs,
                  function(obj){
                    return obj['Standard Object'] == so;
                  }));
            return _.map(years,function(year){return line[year]});
          };
        }
        ,render : function(){
          var by_year_graph = $(
          this.template({
            id : this.make_id(1)
            ,description : this.descriptions[1][this.lang]
            ,header : this.gt("year")
            ,items : [m("{{last_year}}"),
                      m("{{last_year_2}}"),
                      m("{{last_year_3}}")]
          }));
          var by_item_graph = $(
          this.template({
            id : this.make_id(2)
            ,description : this.descriptions[2][this.lang]
            ,header : this.gt("so")
            ,items : _.pluck(this.mapped_objs,"Standard Object")
          }));                 
          this.$el.append(by_year_graph);
          this.$el.append(by_item_graph);
          this.$el.on("click","#"+this.make_id(1)+"_sidebar a",this.year_click);
          this.$el.on("click","#"+this.make_id(2)+"_sidebar a",this.item_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);

          var self=this;
          setTimeout(function(){
            self.$el.find("#"+self.make_id(1)+"_sidebar a:first").trigger("click");
            self.$el.find("#"+self.make_id(2)+"_sidebar a:first").trigger("click");
          });

          return this;
        }
        ,year_click : function(event){
          var sos = this.extract_for_year(this.to_years[$(event.target).html()]);
          var data =  _.map(_.pluck(sos,1),function(x){return x});
          var ticks =  _.pluck(sos,0);
          var plot = GRAPHS.bar(this.make_id(1), 
              [data],
              {title: this.titles[1][this.lang]
              ,legend : {show: false} 
              ,rotate : true
              ,footnotes : this.footnotes
              ,ticks : ticks
              });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
        ,item_click : function(event){
          var years = this.get_year_vals($(event.target).html());
          var data = _.map(years,function(x){return x});
          var ticks =  _.map(this.years,m);
          var plot = GRAPHS.bar(this.make_id(2), 
              [data],
              {title:  this.titles[2][this.lang]
              ,legend : {show: false} 
              ,barWidth : 100
              ,footnotes : this.footnotes
              ,ticks : ticks
              });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
      }
    },
    {
      id: "table6",
      "col_defs" : ["wide-str",
      "big-int",
      "big-int",
      "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
          "Program",
          "{{last_year_3}}",
          "{{last_year_2}}",
          "{{last_year}}"
        ]],
        "fr": [[
          "Program",
          "{{last_year_3}}",
          "{{last_year_2}}",
          "{{last_year}}"
        ]]},
      "link" : {
        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name" : { "en" : "Expenditures by Program",
        "fr" : "Dépenses par programme"
      },
      "title" : { "en" : "Expenditures by Program from {{last_year_3}} to {{last_year}} ($000)",
        "fr" : "Dépenses par programme de {{last_year_3}} à {{last_year}} ($000)"
      }
      ,"key" : [0]
      ,"sort" : function(mapped_rows,lang) {
        return _.sortBy(mapped_rows,function(row){return row[0]});
      }
      ,mapper : {
        to : function(row){
          if (this.lang == 'en'){
            row.splice(2,1);
          } else {
            row.splice(1,1);
          }
          return _.tail(row);
        }
        ,make_filter : function(source_row){
            return function(candidate_row){ 
              return (candidate_row[1] == source_row[1] &&
                      candidate_row[0] != 'ZGOC');
            }
         }
      }
      ,table_view : { 
        sum_cols : [1,2,3]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var txt = this.gt("total");
          this.merge_group_results(
            [[this.row_data,
            GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : txt},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows})]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "An organization’s program with the greatest expenditures for ",
          "fr" : "Le programme de l’organisation le plus important sur le plan des dépenses pour "
        }
        ,year : "{{last_year}}"
        ,prep_data: function(){
          var ttf = this.app.formater;
          var name = "Program";
          var total = UTILS.sum_ar(_.pluck(this.data,this.year)) + 1;
          var sorted = _.sortBy(this.data, function(obj){
            return obj[this.year];
          },this).reverse();
          this.rows = _.map(_.head(sorted,3),function(obj){
             return [obj[name],
                      ttf("big-int",obj[this.year]),
                      ttf("percentage",obj[this.year]/total)];
          },this);
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [[this.gt("program"),'($000)',"(%)"]],
            body : this.rows,
            css : [{'font-weight' : 'bold'}, {'text-align' : 'left'},{'text-align' : 'right'}]
            ,classes : ['','','wrap-none']
          });
        }
        ,post_render : function(){
          this.$el.find('.description').append(
           make_year_select()
           );
          _.bindAll(this,"on_select");
          this.$el.find(".description select")
            .on("change",this.on_select)
            .val(this.year);
        }
        ,on_select : function(e){
          this.year = $(e.target).val();
          this.render();
        }
      },
      graph_view : {
        titles : {
          1 : {
            "en" : "Net Expenditures by Program ($000)",
            "fr" : "Dépenses nettes par programme (en milliers de dollars)"
          }
        }
        ,descriptions : {
          1 : {
            "en" : "Graph 1 presents the net expenditure trend for individual programs from fiscal year 2009‒10 to 2011‒12. Select an individual program in the left side-bar to plot the expenditure on the graph.",
            "fr" : "Le graphique 1 montre le profil des dépenses nettes par programme pour les exercices de 2009‒2010 à 2011‒2012. Choisissez un programme dans le menu de gauche pour en représenter les dépenses."
          }
        }
        ,prep_data : function(){
          var years = this.years = ['{{last_year_3}}',
                                    '{{last_year_2}}',
                                    "{{last_year}}"];
          this.get_year_vals = function(so){
            var line = _.first(_.filter(this.mapped_objs,
                  function(obj){
                    return obj['Program'] == so;
                  }));
            return _.map(years,function(year){return line[year]});
          };
        }
        ,render : function(){
          by_item_graph = $(
          this.template({
            id : this.make_id(2)
            ,description : this.descriptions[1][this.lang]
            ,filter : true
            ,header : this.gt("program")
            ,items : _.sortBy(_.pluck(this.mapped_objs,"Program"),_.identity)
          }));                 
          this.$el.append(by_item_graph);
          this.$el.on("click","#"+this.make_id(2)+"_sidebar a",this.item_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);

          var self=this;
          setTimeout(function(){
            self.$el.find("#"+self.make_id(2)+"_sidebar a:first").trigger("click");
          });

          return this;
        }
        ,item_click : function(event){
          var years = this.get_year_vals($(event.target).html());
          var ticks =  _.map(this.years,m);
          var data =  _.map(years,function(x){return x});
          var plot = GRAPHS.bar(this.make_id(2), 
              [data],
              {title: this.titles[1][this.lang]
              ,legend : {show: false} 
              ,footnotes : this.footnotes
              ,barWidth : 100
              ,ticks : ticks
              });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
      }
    },
    {
      id: "table7",
      "col_defs" : ["int",
      "wide-str",
      "big-int",
      "big-int",
      "big-int",
      "big-int",
      "big-int",
      "big-int" ],
      "coverage" : "historical",
      "headers" : {"en" :[[
        { "colspan" : 2, "header" : ""},
        { "colspan" : 2, "header" :   "{{last_year_3}}"},
        { "colspan" : 2, "header" :   "{{last_year_2}}"},
        { "colspan" : 2, "header" :   "{{last_year}}"}
        ],[
          "Payment Type",
          "Transfer Payment",
          "Total budgetary authority available for use",
          "Expenditures",
          "Total budgetary authority available for use",
          "Expenditures",
          "Total budgetary authority available for use",
          "Expenditures"
          ]],
        "fr": [[
        { "colspan" : 2, "header" : ""},
        { "colspan" : 2, "header" :   "{{last_year_3}}"},
        { "colspan" : 2, "header" :   "{{last_year_2}}"},
        { "colspan" : 2, "header" :   "{{last_year}}"}
        ],
        [
          "Type de paiement",
          "Paiement de Transfer",
          "Autorisations budgétaires disponibles pour l'emploi",
          "Dépenses",
          "Autorisations budgétaires disponibles pour l'emploi",
          "Dépenses",
          "Autorisations budgétaires disponibles pour l'emploi",
          "Dépenses"
        ]]},
      "link" : {
        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
      },
      "name" : { "en" : "Transfer Payments",
        "fr" : "Paiements de tranfert"
      },
      "title" : { "en" : "Transfer Payments from {{last_year_3}} to {{last_year}} ($000)",
        "fr" : "Paiements de tranfert de {{last_year_3}} à {{last_year}} ($000)"
      }
      ,"key" : [0,1]
      ,"sort" : function(mapped_rows,lang) {
        return _.sortBy(mapped_rows,function(row){return row[0]});
      }
      ,mapper : {
        to: function(row){
          if (this.lang == 'en'){
            row.splice(2,1);
            row.splice(3,1);
          } else {
            row.splice(1,1);
            row.splice(2,1);
          }
          // remove acronym and vote type
          return _.tail(row);
        },
        make_filter : function(source_row){
          var is_stat = source_row[3].substring(0,3) == '(S)';
          return function(candidate_row){
            var is_stat_2 =  candidate_row[3].substring(0,3) == '(S)';
             return (candidate_row[1] == source_row[1] &&
                     is_stat == is_stat_2);
          }
        }
      }
      ,table_view : {
        sum_cols : [2,3,4,5,6,7]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var total =   GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : this.gt("total")},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows});
          var self = this;
          this.merge_group_results(
            GROUP.group_rows(
              this.row_data,
              function(row){ return row[0]},
              {txt_cols : {0 : this.gt("sub_total"),
                            1 : function(g){
                              var row = _.first(g);
                              return row[0]}},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows}));
            this.merge_group_results([[this.row_data,total]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "An organization’s transfer payment with the greatest expenditures for the specified year",
          "fr" : "Le paiement de transfert de l’organisation le plus important sur le plan des dépenses pour l’exercice indiqué"
        }
        ,year : "{{last_year}}"
        ,prep_data : function(){
          var ttf =this.app.formater;
          var name =  'Transfer Payment'
          var year = this.year+ '-Expenditures';
          var total = UTILS.sum_ar(_.pluck(this.data,year)) + 1;
          var sorted = _.sortBy(this.data, function(obj){
            return obj[year];
          }).reverse();
          this.rows = _.map(_.head(sorted,3),function(obj){
            return [obj[name],
                     ttf("big-int",obj[year]),
                     ttf("percentage",obj[year]/total)];
          });
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [[this.def["headers"][this.lang][1][1],
                      this.gt("expenditures")+' ($000)',
                      "(%)" ]]
            ,body : this.rows
            ,css : [{'font-weight' : 'bold'}, 
                   {'text-align' : 'left'},
                   {'text-align' : 'right'}]
            ,classes : ['','','wrap-none']
            });
        }
        ,post_render : function(){
          this.$el.find('.description').append(
           make_year_select()
           );
          _.bindAll(this,"on_select");
          this.$el.find(".description select")
            .on("change",this.on_select)
            .val(this.year);
        }
        ,on_select : function(e){
          this.year = $(e.target).val();
          this.render();
        }
      }, 
      graph_view : {
        titles : {
          1 : {
            "en" : "",
            "fr" : ""
          },
          2 : {
            "en" : "",
            "fr" : ""
          }
        }
        ,descriptions : {
          1 : {
            "en" : "",
            "fr" : ""
          },
          2 : {
            "en" : "",
            "fr" : ""
          }
        }
        ,prep_data : function(){
          var auth =  "-"+this.def.headers['en'][1][2];
          var exp = "-"+this.def.headers['en'][1][3];
          var years = this.years = ['{{last_year_3}}',
                        '{{last_year_2}}',
                        "{{last_year}}"];
          this.to_years = _.object(_.map(this.years,m),this.years);
          this.year_to_top = function(year){
            var ordered_exps =  _.sortBy(_.map(this.mapped_objs,
                function(d){ 
                  return [d['Transfer Payment'].substring(0,100),
                          d[year+exp]];
                })
                ,function(x){ return x[1]}
            );
            var top_4 = _.last(ordered_exps,4);
            if (ordered_exps.length > 4){
              top_4.push([
                this.gt("other"),
                UTILS.sum_ar(_.initial(ordered_exps,4),
                  function(x){ return x[1]})
              ]);
            }
            return top_4;
          };
          this.name_to_years = function(name){
            var line = _.first(_.filter(this.mapped_objs,
                  function(obj){
                    return obj['Transfer Payment'] == name;
                  }));
            return _.map([auth,exp],function(x){
              return _.map(years,function(year){
                return line[year+x];
              });
            });
          };
        }
        ,render : function(){
          var by_year_graph = $(
          this.template({
            id : this.make_id(1)
            ,header : this.gt("year")
            ,description : '' //this.descriptions[1][this.lang]
            ,items : [m("{{last_year}}"),
                      m("{{last_year_2}}"),
                      m("{{last_year_3}}")]
          }));
          var by_item_graph = $(
          this.template({
            id : this.make_id(2)
            ,filter : true
            ,description : '' //this.descriptions[2][this.lang]
            ,header : this.def.headers[this.lang][1][1]
            ,items : _.pluck(this.data,1)
          }));                 
          this.$el.append(by_year_graph);
          this.$el.append(by_item_graph);
          this.$el.on("click","#"+this.make_id(1)+"_sidebar a",this.year_click);
          this.$el.on("click","#"+this.make_id(2)+"_sidebar a",this.item_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);

          var self=this;
          setTimeout(function(){
            self.$el.find("#"+self.make_id(1)+"_sidebar a:first").trigger("click");
            self.$el.find("#"+self.make_id(2)+"_sidebar a:first").trigger("click");
          });

          return this;
        }
        ,year_click : function(event){
          var top = this.year_to_top(this.to_years[$(event.target).html()]);
          var ticks = _.pluck(top, 0);
          var data = _.pluck(top, 1);
          var plot = GRAPHS.bar(this.make_id(1),
                    [data],
                   {title : "",
                    ticks : ticks,
                    legend : {show:false},
                    rotate : true
                   });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
        ,item_click : function(event){
          var data = this.name_to_years($(event.target).text());
          var ticks = _.map(this.years,m);
          var series =  [
                {label: this.def.headers[this.lang][1][2]}, 
                {label: this.def.headers[this.lang][1][3]}, 
          ];          
          var plot = GRAPHS.bar(this.make_id(2), 
              data,
              {title: ''//this.titles[2][this.lang]
              ,series : series
              ,barWidth : 100
              ,ticks :ticks
              });
          GRAPHS.fix_bar_highlight(plot,data,ticks,this.app);
        }
      }
    }
   ,{
      id: "table8",
      "col_defs" : ["int",
                  "wide-str",
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int", 
                  "big-int" 
      ],
      "coverage" : "in_year",
      "headers" : {"en" :[
         [
            { "colspan" : 2,
            "header" : ""
            },
            { "colspan" : 4,
            "header" : "Estimates"
            },
            { "colspan" : 1,
            "header" : ""
            },
            { "colspan" : 6,
            "header" : "TBS Central Votes"
            },
            { "colspan" : 1,
            "header" : ""
            } 
         ],[
          "Vote",
          "Description",
          "Main Estimates",
          "Supps A",
          "Supps B",
          "Supps C",
          "Adjustments",
          "Vote 5",
          "Vote 10",
          "Vote 15",
          "Vote 25",
          "Vote 30",
          "Vote 33",
          "Total Net Authority"
         ]],
          "fr" : [[
            { "colspan" : 2,
            "header" : ""
            },
            { "colspan" : 4,
            "header" : "Budgets"
            },
            { "colspan" : 1,
            "header" : ""
            },
            { "colspan" : 6,
            "header" : "Crédits Centraux de SCT"
            },
            { "colspan" : 1,
            "header" : ""
            } 
            ],[
            "Crédit",
            "Description du crédit",
            "Budget Principal",
            "Supp. A",
            "Supp. B",
            "Supp. C",
            "Ajustements*",
            "Crédit 5",
            "Crédit 10",
            "Crédit 15",
            "Crédit 25",
            "Crédit 30",
            "Crédit 33",
            "Autorisations totales nettes"
            ]
      ]},
      "link" : {
        "en" : "",
        "fr" : ""
      },
      "name" : { "en" : "Parliamentary Authorities",
                "fr" : "Autorisations parliamentaires"
              },
      "title" : { "en" : "Parliamentary Authorities",
                "fr" : "Autorisations parliamentaires"
      }
      ,"key" : [0,1]
      ,"mapper" : {
        "to" : function(row){
          if (this.lang == 'en'){
            row.splice(2,1);
          } else {
            row.splice(3,1);
          }
          // remove acronym and vote type
          for (var i in row){
            if (i>2){ row[i] = row[i]*1000}
          }
          return _.tail(row);
        }
        ,"make_filter" : function(source_row){
          return function(condidate_row){

          };
        }
      }
      ,table_view:{
        hide_col_ids : []
        ,sum_cols : [2,3,4,5,6,7,8,9,10,11,12,13]
        ,min_func : TABLES.add_ministry_sum
        ,init_row_data : function(){
          var total =   GROUP.fnc_on_group(
              this.row_data,
              {txt_cols : {0 : this.gt("total")},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows});
          var self = this;
          this.merge_group_results(
            GROUP.group_rows(
              this.row_data,
              function(row){ return _.isString(row[0])},
              {txt_cols : {0 : this.gt("sub_total"),
                            1 : function(g){
                              var row = _.first(g);
                              return _.isString(row[0]) ? self.gt("stat") : self.gt('vote') }},
                func_cols : this.sum_cols,
                func : GROUP.sum_rows}));
            this.merge_group_results([[this.row_data,total]]);
        }
      }
      ,mini_view : {
        description : {
          "en" : "Details of expenditure authorities granted by Parliament as of {{month_name}}, {{in_year_short}}",
          "fr" : "Détails des autorités approuvé pas parliament dès {{month_name}}, {{in_year_short}}"
        }
        ,prep_data : function(){
          var ttf = this.app.formater;
          var total = UTILS.sum_ar(_.pluck(this.data,"Total Net Authority")) + 1;
          var cols = ['Main Estimates',
                      'Supps A',
                      'Supps B',
                      'Supps C' ] ;
          this.rows = _.map(cols, function(col){
            var col_total =  UTILS.sum_ar(_.pluck(this.data,col));
            return [this.to_lang(col),
                    ttf("big-int",col_total),
                    ttf("percentage",col_total/total)];
          },this);
        }
        ,render_data : function(){
          this.content = TABLES.build_table({
            headers : [['Estimates','Amount ($000)','(%)']] ,
            body : this.rows,
            css : [{'font-weight' : 'bold', 'text-align' : 'left'}, 
                    {'text-align' : 'right'},
                    {'text-align' : 'right'}
          ]
          });
        }
      }
      ,graph_view : {
        prep_data : function(){
          this.cols =  ['Main Estimates',
                       'Supps A',
                       'Supps B',
                       'Supps C' ];
          this.type_to_approp = function(type){
            var line = _.find(this.mapped_objs, function(x){
              return x['Description'] == type;
            });
            return _.map(this.cols, function(col){
              return line[col];
            });
          } 
        }
        ,render : function(){
          var by_vote_graph = $(
          this.template({
            id : this.make_id(1)
            ,description : ''
            ,header : this.gt("votestat")
            ,filter : true
            ,items :  _.pluck(this.mapped_objs,"Description")
          }));
          this.$el.append(by_vote_graph);
          this.$el.on("click","#"+this.make_id(1)+"_sidebar a",this.vote_click);
          this.$el.on("click", ".sidebar a", this.set_side_bar_highlight);
          var self=this;
          setTimeout(function(){
            self.$el.find("#"+self.make_id(1)+"_sidebar a:first").trigger("click");
          });
          return this;
        }
        , vote_click : function(event){
          var data = this.type_to_approp($(event.target).html());
          var ticks = this.cols;
          var plot = GRAPHS.bar(this.make_id(1), 
              [data],
              {title: ''
              ,legend : {show: false} 
              ,rotate : true
              ,ticks : ticks
              });
          GRAPHS.fix_bar_highlight(plot,[data],ticks,this.app);
        }
      }
   } 
   ]);
 });
})(this);
