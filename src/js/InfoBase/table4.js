(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var PACK = ns('D3.PACK');
  var D3 = ns('D3');

 APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
    "id": "table4",
    "data_type" : "financial_data",
    "coverage": "historical",
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
            "en":"Vote {{last_year}} / Statutory",
            "fr":"Crédit {{last_year}} / Légis."
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
          "key" : true,
          "nick" : "desc",
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
    "queries" : {
       "exp_auth_by_year" : function(year,format){
          format =  format === undefined ? false : true;
          var vals = this.sum([year+'auth',year+'exp'],{format: format});
          return [m(year),vals[year+'auth'],vals[year+'exp']];
       }
    },
    "dimensions" : {
       "include_in_analytics" : ["voted_stat"],
       "horizontal" : TABLES.major_vote_stat,
       "voted_stat" : TABLES.vote_stat_dimension
    },
    "sort": function (mapped_rows, lang) {
        var grps = _.groupBy(mapped_rows, function (row) { return _.isNumber(row[0]);});
        if (_.has(grps, true)) {
            grps[true] = _.sortBy(grps[true], function (row) { return row[0];});
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
        var fin_sizes = this.dept_rollup('{{last_year}}exp',true);
        _.chain(depts)
          .each(function(dept,key){
            dept.fin_size = fin_sizes[key];
          })
          .filter(function(dept,key){
            return _.isUndefined(dept.fin_size);
          })
          .each(function(dept,key){
            dept.fin_size =0;
          })
          .value();
      }
    },
    mapper: function (row) {
      if (this.lang === 'en') {
          row.splice(3, 1);
      } else {
          row.splice(4, 1);
      }
      // remove acronym and vote type
      return row;
    },
    mini_view: {
      description: {
          "en": "Total budgetary voted and statutory authorities and expendiures.",
          "fr": "Montant total des autorisations et dépenses budgétaires votées et législatives."
      },
      headers_classes : ['left_text','right_text','right_text'],
      row_classes : [ 'left_text wrap-none', 'right_number', 'right_number'],
      prep_data: function () {
        this.rows = [
         this.da.exp_auth_by_year("{{last_year}}",true),
         this.da.exp_auth_by_year("{{last_year_2}}",true),
         this.da.exp_auth_by_year("{{last_year_3}}",true)
       ];
        this.headers = [
          [this.gt("year"),
          this.gt("authorities") + ' ($000)',
          this.gt("expenditures") + ' ($000)']
        ];
      }
    },
    info : function(context){
      var q,c= context,dept;
      if (context.dept){
        dept = context.dept;
        q = this.q(context.dept);
        c.dept_last_year_auth =  q.sum('{{last_year}}auth');
        c.dept_last_year_2_auth = q.sum('{{last_year_2}}auth');
        c.dept_last_year_3_auth = q.sum('{{last_year_3}}auth');
        c.dept_last_year_stat_voted = this.voted_stat('{{last_year}}auth',dept,true);
        c.dept_last_year_2_stat_voted =  this.voted_stat('{{last_year_2}}auth',dept,true); 
        c.dept_last_year_3_stat_voted = this.voted_stat('{{last_year_2}}auth',dept,true); 
      }
      q = this.q();
      c.gov_last_year_auth =  q.sum('{{last_year}}auth');
      c.gov_last_year_2_auth = q.sum('{{last_year_2}}auth');
      c.gov_last_year_3_auth = q.sum('{{last_year_3}}auth');
      c.gov_last_year_stat_voted = this.voted_stat('{{last_year}}auth',false); 
      c.gov_last_year_2_stat_voted =  this.voted_stat('{{last_year_2}}auth',false);
      c.gov_last_year_3_stat_voted = this.voted_stat('{{last_year_2}}auth',false); 
      
    },
    "graphics": {
       "details_display_order" : [
         "historical_auth",
         "vote_stat_split"
       ],
       "vote_stat_split": function(options){
          var graph = PACK.simple_circle_chart,
              d=this.data,text,args={
                height : this.height,
                formater : this.compact1,
                colors : function(x){ return D3.tbs_color(Math.floor(x/3));},
              },gt=app.get_text;

          if (!this.data.dept){
            text = "gov_historical_auth";
            args.data = [
              {name : 'z',value: d.gov_last_year_3_stat_voted.stat, bottom_text : d.last_years[2]},
              {name : 'y',value: d.gov_last_year_2_stat_voted.stat, bottom_text : d.last_years[1], top_text: gt("stat")},
              {name : 'x',value: d.gov_last_year_stat_voted.stat, bottom_text : d.last_years[0]} ,
              {name : 'a',value: d.gov_last_year_3_stat_voted.voted, bottom_text : d.last_years[2]},
              {name : 'b',value: d.gov_last_year_2_stat_voted.voted, bottom_text : d.last_years[1] ,top_text: gt("voted")},
              {name : 'c',value: d.gov_last_year_stat_voted.voted, bottom_text :  d.last_years[0]}
            ];
          } else {
            text = "dept_historical_auth";
            args.data = [
              {name : 'z',value: d.dept_last_year_3_stat_voted.stat, bottom_text : d.last_years[2]},
              {name : 'y',value: d.dept_last_year_2_stat_voted.stat, bottom_text : d.last_years[1], top_text: gt("stat")},
              {name : 'x',value: d.dept_last_year_stat_voted.stat, bottom_text : d.last_years[0]} ,
              {name : 'a',value: d.dept_last_year_3_stat_voted.voted, bottom_text : d.last_years[2]},
              {name : 'b',value: d.dept_last_year_2_stat_voted.voted, bottom_text : d.last_years[1] ,top_text: gt("voted")},
              {name : 'c',value: d.dept_last_year_stat_voted.voted, bottom_text :  d.last_years[0]}
            ];
          }

          graph(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));

       },
       "historical_auth" : function(container){
          var graph = PACK.simple_circle_chart,
              d=this.data,text,args={
                height : this.height,
                formater : this.compact1
              };

          if (!this.dept){
            text = "gov_historical_auth";
            args.data = [
              {name : 'z',value: d.gov_last_year_3_auth, bottom_text : d.last_years[2]},
              {name : 'y',value: d.gov_last_year_2_auth, bottom_text : d.last_years[1]},
              {name : 'x',value: d.gov_last_year_auth, bottom_text : d.last_years[0]}
            ];
          } else {
            text = "dept_historical_auth";
            args.data = [
              {name : 'z',value: d.dept_last_year_3_auth, bottom_text : d.last_years[2]},
              {name : 'y',value: d.dept_last_year_2_auth, bottom_text : d.last_years[1]},
              {name : 'x',value: d.dept_last_year_auth, bottom_text : d.last_years[0]}
            ];
          }

          graph(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));
       },
       "voted_spending" :   function(container){

       },
       "stat_spending" :  function(container){

       }                     
    } 
    });

  });
})();
