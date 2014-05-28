(function (root) {
  var TABLES = ns('TABLES');
  var APP = ns('APP');
  var STACKED = ns('D3.STACKED');
  var BAR = ns('D3.BAR');
  var D3 = ns('D3');

 APP.dispatcher.on("load_tables", function (app) {
    var m = TABLES.m;
    var years = TABLES.years;
    APP.dispatcher.trigger("new_table",
    {
    "id": "table4",
    "coverage": TABLES.coverage.historical,
    "data_type" :TABLES.data_types.financial,
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
       _.each(years, function(header){
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
       },
       "voted_items" : function(cut_off){
         this.vote_stat_query =  vote_stat_query;
         return this.vote_stat_query("voted",cut_off);
       },
       "stat_items" : function(cut_off){
         this.vote_stat_query =  vote_stat_query;
         return this.vote_stat_query("stat",cut_off);
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
    dept_info : function(c, q){
      c.dept_last_year_auth =  q.sum('{{last_year}}auth');
      c.dept_last_year_2_auth = q.sum('{{last_year_2}}auth');
      c.dept_last_year_3_auth = q.sum('{{last_year_3}}auth');
      c.dept_last_year_stat_voted = this.voted_stat('{{last_year}}auth',c.dept,true);
      c.dept_last_year_2_stat_voted =  this.voted_stat('{{last_year_2}}auth',c.dept,true); 
      c.dept_last_year_3_stat_voted = this.voted_stat('{{last_year_3}}auth',c.dept,true); 
      _.each(["","_2","_3"],function(x){
        var key = "dept_last_year"+x+"_stat_voted";
        c[key].voted = c[key].voted || 0;
        c[key].stat = c[key].stat || 0;
      });
      c.dept_historical_voted = q.voted_items();
      c.dept_historical_stat = q.stat_items();
    },
    info : function(c,q){
      c.gov_last_year_auth =  q.sum('{{last_year}}auth');
      c.gov_last_year_2_auth = q.sum('{{last_year_2}}auth');
      c.gov_last_year_3_auth = q.sum('{{last_year_3}}auth');
      c.gov_last_year_stat_voted = this.voted_stat('{{last_year}}auth',false); 
      c.gov_last_year_2_stat_voted =  this.voted_stat('{{last_year_2}}auth',false);
      c.gov_last_year_3_stat_voted = this.voted_stat('{{last_year_3}}auth',false); 
    },
    "graphics": {
       "details_display_order" : [
         "historical_auth",
         "vote_stat_split",
         "voted_spending",
         "stat_spending"
       ],
       "vote_stat_split": function(){
          var graph = BAR.bar,
              colors = D3.tbs_color(),
              d=this.data,text,args={
                height : this.height,
                label_formater : this.compact1,
                add_legend : true,
                x_axis_line : false,
                add_xaxis : true,
                add_labels : true,
                html_ticks : true,
                ticks : this.data.last_years,
                series : {}
              },gt=app.get_text;
          
          if (!this.data.dept){
            text = "gov_historical_auth";
            args.series[gt("stat")] = [ d.gov_last_year_3_stat_voted.stat, d.gov_last_year_2_stat_voted.stat, d.gov_last_year_stat_voted.stat ];
            args.series[gt("voted")] = [ d.gov_last_year_3_stat_voted.voted, d.gov_last_year_2_stat_voted.voted, d.gov_last_year_stat_voted.voted ];
          } else {
            args.x_axis_line = true;
            text = "dept_historical_auth";
            args.series[gt("stat")] = [ d.dept_last_year_3_stat_voted.stat, d.dept_last_year_2_stat_voted.stat, d.dept_last_year_stat_voted.stat ];
            args.series[gt("voted")] = [ d.dept_last_year_3_stat_voted.voted, d.dept_last_year_2_stat_voted.voted, d.dept_last_year_stat_voted.voted ];
          }

          graph(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));

       },
       "historical_auth" : function(){

          var graph = BAR.bar,
              d=this.data,text,args={
                add_xaxis : true,
                add_labels : true,
                x_axis_line : false,
                html_ticks : true,
                height : this.height,
                label_formater : this.compact1,
                ticks : this.data.last_years,
                series : {'':null}
              };


          if (!this.dept){

            text = "gov_historical_auth";
            args.series[''] = [ d.gov_last_year_3_auth, d.gov_last_year_2_auth, d.gov_last_year_auth ];
          } else {
            this.graph_area.classed("span-4",true);
            this.text_area.classed("span-4",true);
            this.graph_area.classed("span-8",false);
            this.text_area.classed("span-8",false);

            args.x_axis_line = true;
            text = "dept_historical_auth";
            args.series[''] = [ d.dept_last_year_3_auth, d.dept_last_year_2_auth, d.dept_last_year_auth ];
          }

          graph(args)(this.graph_area);
          this.text_area.html(m(app.get_text(text), this.written_data));
       },
       "voted_spending" :   function(){
         var func = _.bind(create_stacked_graph,this);
         this.data_type = 'voted';
         return func();
       },
       "stat_spending" :  function(){
         var func = _.bind(create_stacked_graph,this);
         this.data_type = 'stat';
         return func();
       },                    
       "top_vote_items" : function(){

       },
       "top_stat_items" : function(){

       }
    } 
    });

    var vote_stat_query = function(vote_or_stat, cut_off){
       var total=0,cut_off_counter=0;
       var dept = this.dept || true;
       return _.chain(this.table.voted_stat(undefined,dept, false)[vote_or_stat])
         .map(_.clone)
         .flatten()
         .sortBy(function(d){
           d.total = d["{{last_year_3}}auth"]+d["{{last_year_2}}auth"]+d["{{last_year}}auth"];
           total += d.total;
           return -d.total;
         })
         .each(function(d){
           d.percent = d.total / total;
         }) 
         .each(function(d){
           if (!cut_off){return;}
           cut_off_counter += d.percent;
           d.cut_off = cut_off_counter >= cut_off ? true : false;
         })
         .value();
    };

    var create_stacked_graph = function(){
      var radius = 35;
      var data_type = "dept_historical_" + this.data_type;
      var data = _.map(this.data[data_type] ,_.identity);
      var col_attrs = _.map(years, function(year){
                        return year+"auth";
                      });
      var text_length = (this.graph_area.node().offsetWidth -  col_attrs.length * radius)/4;
      if (data.length <= 1){
        return false;
      }

      // ensure the graph will always be span-8
      this.graph_area.classed("span-4",false);
      this.graph_area.classed("span-8",true);

      _.each(data, function(d){
        d.desc = APP.abbrev(app,d.desc, Math.floor(text_length));
      });

      STACKED.relaxed_stacked({
        colors : D3.tbs_color(),
        radius : radius,
        rows : data,
        formater : this.compact,
        total_formater : this.compact1,
        display_cols : this.data.last_years,
        col_attrs : col_attrs,
        text_key : "desc"
      })(this.graph_area);

    };
  });
})();
