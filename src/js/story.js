(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var HORIZONTAL = ns("D3.HORIZONTAL");
    var STORY = ns('D3.STORY');
    var PACK = ns('D3.PACK');
    var BAR = ns('D3.BAR');

    var height = 250;

    var table_query_link = function(table, func, args){
      return {
        link : HORIZONTAL.create_analytics_link(table, args[0]),
        data : table.q[func].apply(this,args)
      }
    }

    var table_dim_link = function(table, func, args){

    }

    STORY.story =  function(container,app,dept){
      return new _story(container,app,dept);
    };

    _story = function(container,app,dept){
      this.container = d3.select(container[0]);
      this.container.selectAll("*").remove();
      this.app = app;
      this.gt = app.get_text;
      this.calculated_values = {};
      this.lang = app.lang;
      this.create_link = function(table,cols){
        return HORIZONTAL.create_analytics_link(this.t[table],cols,app.lang);
      }
      // set the formaters
      this.percent = function(x){return app.formater("percentage",x);},
      this.compact = function(x){return app.formater("compact1",x);},
      this.compact0 = function(x){return app.formater("compact0",x);},

      // quick access to all tables
      this.t = _.chain(T.tables)
        .map(function(x){ return [x.id, x];})
        .object()
        .value();
      this.q =  _.chain(T.tables)
        .map(function(x){ return [x.id, x.q()];})
        .object()
        .value();

      this.data_prep();
      if (_.isUndefined(dept)){
        this.gov_auth();
        this.estimates_split();
        this.vote_stat_spend();

        this.gov_type_spend();
        this.gov_spend();
        this.gov_spend_change();
      } else {
        this.dept_q =  _.chain(T.tables)
          .map(function(x){ return [x.id, x.q(dept)];})
          .object()
          .value();
        this.dept_data_prep(dept);
        this.dept_auth();
        this.dept_estimates_split();
        this.dept_vote_stat_spend();
        this.dept_type_spend();
        //this.dept_spend();
        //this.dept_spend_change();
      }
      
      STORY.center_text(container);
      this.container.selectAll(".toggle").classed("ui-screen-hidden",true);
    };

    var p = _story.prototype;


    p.data_prep = function(){
      var t = this.t,
          q = this.q,
          app = this.app,
          compact = this.compact,
          written = function(x){return app.formater("compact_writen",x);},
          personnel = sos[1][this.lang],
          is = this.gt("internal_services"),
          qfr_difference = q.table8.qfr_difference(true);
          
      this.data =  {
        last_years : [
         T.m("{{last_year_3}}"),  
         T.m("{{last_year_2}}"),
         T.m("{{last_year}}")
        ],
        gov_this_year_auth : q.table8.sum("total_net_auth"),
        gov_dept_number : _.keys(t.table1.depts).length,
        
        gov_last_year_auth :  q.table4.sum('{{last_year}}auth'),
        gov_last_year_2_auth : q.table4.sum('{{last_year_2}}auth'),
        gov_last_year_3_auth : q.table4.sum('{{last_year_3}}auth'),

        gov_this_year_stat_voted :  t.table8.voted_stat("total_net_auth",false), 
        gov_last_year_stat_voted : t.table4.voted_stat('{{last_year}}auth',false), 
        gov_last_2_year_stat_voted :  t.table4.voted_stat('{{last_year_2}}auth',false), 
        gov_last_3_year_stat_voted : t.table4.voted_stat('{{last_year_2}}auth',false), 

        this_year_voted_num : t.table8.voted_stat("total_net_auth",false,false)['voted'].length,
        this_year_stat_num : t.table8.voted_stat("total_net_auth",false,false)['stat'].length,
        gov_this_year_top_voted : _.chain(t.table8.voted_stat("total_net_auth",false,false)['voted']) 
                              .sortBy(function(x){ return -x['total_net_auth']}) 
                              .first(3)
                              .value(),
        gov_this_year_top_stat : _.chain(t.table8.voted_stat("total_net_auth",false,false)['stat']) 
                              .sortBy(function(x){ return -x['total_net_auth']}) 
                              .first(3)
                              .value(),

        gov_this_year_type_spend :  t.table2.spending_type("plannedexp",false), 
        gov_last_year_type_spend :   t.table5.spending_type("{{last_year}}",false), 
        gov_last_year_2_type_spend : t.table5.spending_type("{{last_year_2}}",false), 
        gov_last_year_3_type_spend : t.table5.spending_type("{{last_year_3}}",false), 

        gov_personnel : [t.table5.horizontal("{{last_year_3}}",false)[personnel],
                        t.table5.horizontal("{{last_year_2}}",false)[personnel],
                        t.table5.horizontal("{{last_year}}",false)[personnel]],

        gov_is : [t.table6.horizontal("{{last_year_3}}",false)[is],
                  t.table6.horizontal("{{last_year_2}}",false)[is],
                  t.table6.horizontal("{{last_year}}",false)[is]],

        gov_estimates_split : q.table8.estimates_split({filter_zeros : true, as_tuple : true}),

        gov_auth_change: q.table1.auth_change(false)[2],
        gov_spend_change : q.table1.exp_change(false)[2],

        gov_this_year_qfr_auth :  q.table1.sum("thisyearauthorities"),
        gov_this_year_qfr_spend :  q.table1.sum("thisyearexpenditures"),
        gov_last_year_qfr_auth :  q.table1.sum("lastyearauthorities"),
        gov_last_year_qfr_spend : q.table1.sum("lastyearexpenditures")

      };

      this.data.gov_this_year_type_spend['crown'] = qfr_difference['crown'];
      this.data.gov_this_year_type_spend['op'] += qfr_difference['op'];

      // the QFR data needs to be enhanced to account for the missing 
      // these two function calls assume that all numbers are in dollars, 
      // however, some are percentages and will have to fixed mannually
      this.compact_data =  _.chain(this.data)
        .map(function(v,k){return [k,compact(v)];})
        .object()
        .value();
      this.written_data =  _.chain(this.data)
        .map(function(v,k){return [k,written(v)];})
        .object()
        .value();

      // these are the percentage corrections
      this.written_data.gov_auth_change = this.compact_data.gov_auth_change = this.percent(this.data.gov_auth_change);
      this.written_data.gov_spend_change = this.compact_data.gov_spend_change = this.percent(this.data.gov_spend_change);
      _.each(this.data.estimates_split,function(name_val,i){
        this.written_data.estimates_split[i][0] = this.compact_data.estimates_split[i][0] = name_val[0];
      },this);

    }

    p.dept_data_prep = function(dept){
      var t = this.t,
          q = this.dept_q,
          app = this.app,
          is = this.gt("internal_services"),
          compact = this.compact,
          written = function(x){return app.formater("compact_writen",x);},
          qfr_difference = q.table8.qfr_difference();
          dept_data = {
          dept_name : window.depts[dept].dept[this.lang],
          dept_this_year_auth : q.table8.sum("total_net_auth"),
          dept_last_year_auth :  q.table4.sum('{{last_year}}auth'),
          dept_last_year_2_auth : q.table4.sum('{{last_year_2}}auth'),
          dept_last_year_3_auth : q.table4.sum('{{last_year_3}}auth'),

          dept_this_year_stat_voted :  t.table8.voted_stat("total_net_auth",dept,true), 
          dept_last_year_stat_voted : t.table4.voted_stat('{{last_year}}auth',dept,true), 
          dept_last_year_2_stat_voted :  t.table4.voted_stat('{{last_year_2}}auth',dept,true), 
          dept_last_year_3_stat_voted : t.table4.voted_stat('{{last_year_2}}auth',dept,true), 


          dept_this_year_type_spend : q.table2.get_cols(["plannedexp","so"],{sorted:true}),
                                      
          dept_this_year_voted_num : t.table8.voted_stat("total_net_auth",dept,false)['voted'].length,
          dept_this_year_stat_num : t.table8.voted_stat("total_net_auth",dept,false)['stat'].length,

          dept_this_year_top_voted : _.chain(t.table8.voted_stat("total_net_auth",dept,false)['voted']) 
                                .sortBy(function(x){ return -x['total_net_auth']}) 
                                .first(3)
                                .value(),
          dept_this_year_top_stat : _.chain(t.table8.voted_stat("total_net_auth",dept,false)['stat']) 
                                .sortBy(function(x){ return -x['total_net_auth']}) 
                                .first(3)
                                .value(),

          dept_estimates_split : q.table8.estimates_split({filter_zeros : true, as_tuple : true}),

          dept_is : [t.table6.horizontal("{{last_year_3}}",dept,true)[is],
                     t.table6.horizontal("{{last_year_2}}",dept,true)[is],
                     t.table6.horizontal("{{last_year}}",dept,true)[is]],

          dept_auth_change: q.table1.auth_change(false)[2],
          dept_spend_change : q.table1.exp_change(false)[2],
          dept_this_year_qfr_auth :  q.table1.sum("thisyearauthorities"),
          dept_this_year_qfr_spend :  q.table1.sum("thisyearexpenditures"),
          dept_last_year_qfr_auth :  q.table1.sum("lastyearauthorities"),
          dept_last_year_qfr_spend : q.table1.sum("lastyearexpenditures")
          
          },

          // the QFR data needs to be enhanced to account for the missing 
          // these two function calls assume that all numbers are in dollars, 
          // however, some are percentages and will have to fixed mannually
          compact_data =  _.chain(dept_data)
            .map(function(v,k){return [k,compact(v)];})
            .object()
            .value(),
          written_data =  _.chain(dept_data)
            .map(function(v,k){return [k,written(v)];})
            .object()
            .value();

      // these are the percentage corrections
      written_data.auth_change = compact_data.auth_change = this.percent(dept_data.auth_change);
      written_data.spend_change = this.compact_data.spend_change = this.percent(dept_data.spend_change);
      _.each(dept_data.estimates_split,function(name_val,i){
        written_data.estimates_split[i][0] = compact_data.estimates_split[i][0] = name_val[0];
      });
      _.extend(this.data, dept_data);
      _.extend(this.compact_data, compact_data);
      _.extend(this.written_data, written_data);
    }

    p.gov_auth = function(){
      var d = this.data,
          text = this.app.get_text("this_year_auth");

      var chapter = new STORY.chapter({
        toggles :[ {
          toggle_text : this.app.get_text("previous_year_fisc")
        }],
        target : this.container,
        sources : [this.create_link("table8","total_net_auth")]
      });

      PACK.simple_circle_chart({
        height : height*1.5,
        formater : this.compact,
        data : [
          {value: d.gov_this_year_auth}
        ]
      })(chapter.graph_area());
      var chart = PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {name : 'z',value: d.gov_last_year_auth, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: d.gov_last_year_2_auth, bottom_text : T.m('{{last_year_2}}')},
          {name : 'x',value: d.gov_last_year_3_auth, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

      chapter.text_area().html(T.m(text, this.written_data));

      

    };

    p.estimates_split = function(){

      var text = this.app.get_text("auth_split"),
          compact = this.compact,
          d = this.data,
          cd = this.compact_data,
          wd = this.written_data,
          label_mapping = {},
          labels = [];
      // create the chapter
      var chapter = new STORY.chapter({
        height : height,
        target : this.container
      });
      //add the text 
      chapter.text_area().html(Handlebars.compile(text)(this.written_data));
    
      BAR.bar({
       series :  {'': _.pluck(this.data.gov_estimates_split,1) },
       ticks : _.pluck(this.data.gov_estimates_split,0),
       add_xaxis : true,
       x_axis_line : false,
       add_labels : true,
       html_ticks : true,
       margin : {top: 20, right: 20, left: 20, bottom: 80},
       label_formater : compact
     })(chapter.graph_area());

    };

    p.gov_type_spend = function(){
      var text = this.gt("gov_type_spending"),
          d = this.data,
          wd = this.written_data,
          cd = this.compact_data,
          compact = this.compact,

          internal_services_text = this.gt("internal_service_spend"),
          internal_services_data = _.zip( d.last_years, wd.gov_is  );
          internal_services_bar = BAR.bar({
            series :  {'':  _.clone(d.gov_is)},
            ticks : d.last_years,
            add_xaxis : true,
            x_axis_line : false,
            add_labels : true,
            html_ticks : true,
            margin : {top: 20, right: 20, left: 20, bottom: 80},
            label_formater : compact
          }),

          perosnnel_text = this.gt("personnel_spend"),
          personnel_data =_.zip( d.last_years, wd.gov_personnel ) ,
          personnel_bar = BAR.bar({
            series :  {'':  _.clone(d.gov_personnel)},
            ticks : d.last_years,
            add_xaxis : true,
            x_axis_line : false,
            add_labels : true,
            html_ticks : true,
            margin : {top: 20, right: 20, left: 20, bottom: 80},
            label_formater : compact
          }),

          label_mapping = {},
          // add in the labels to the data
          data = _.chain(this.data.gov_this_year_type_spend)
              .map(function(value,key){
                var label =  this.gt(key+"_spend_type");
                label_mapping[label]= key;
                return [label,value];
              },this)
              .value(),
          packing_data = {
            name : '',
            children : _.chain(data)
              .map(function(label_value){
                var label=label_value[0], value = label_value[1];
                return {
                  children : null,
                  name :  label + " (" + this.compact0(value)+")",
                  value : value
                };
              },this)
              .value()
          },
          data = _.chain(data)
              .sortBy(function(label_value){
                return -label_value[1];
              })
             .map(function(label_value){
                label_value[1] = this.compact(label_value[1]).replace("B","");
                return label_value;
              },this)
             .value();
          // create the chapter
          chapter = new STORY.chapter({
             toggles :[{
              toggle_text : this.app.get_text("previous_year_fisc"),
              add_divider: true
             },{
              toggle_text : "Personnel Expenditures",
              add_divider: true
             },{
              toggle_text : "Internal Service Expentiures",
              add_divider: true
             } ],
             target : this.container
          }),
          headers = [['','($ B)']],
          pack_chart = PACK.pack({
            width : height*1.7,
            formater : this.compact,
            top_font_size : 14,
            data : packing_data,
            html_tags : true,
            cycle_colours : true
          }),
          //create the graph
          on_label_click = function(label){
            // highlight the current link
            list_div.selectAll("li").classed("background-medium",false);
            list_div.selectAll("li").filter(function(d){return d === label})
              .classed("background-medium",true);
            // remove the previous graph
            graph_div.selectAll("*").remove();
            // look the key back up
            var key = label_mapping[label];
            var years = [ T.m("{{last_year_3}}"), T.m("{{last_year_2}}"), T.m("{{last_year}}") ];
            var data = [
              d.gov_last_year_3_type_spend[key],
              d.gov_last_year_2_type_spend[key],
              d.gov_last_year_type_spend[key]
            ];
            
            BAR.bar({
            series :  {'': data },
            ticks : years,
            height : 300,
            add_xaxis : true,
            x_axis_line : false,
            add_labels : true,
            label_formater : compact
            })(graph_div);
          },
          //create the year options list
          list_div = chapter.toggle_area().select(".text .inner"),
          graph_div = chapter.toggle_area().select(".graphic");

      //add the text 
      chapter.text_area().html(Handlebars.compile(text)(this.written_data));

      // add the table
      T.prepare_and_build_table({
        rows : data,
        headers : headers,
        table_class : "table-condensed ",
        rowseach : function(d,i){
          if (i % 2 === 1 ){
            d3.select(this).classed("odd",true);
          }
        },
        row_class : ['left_text','right_number'],
        node : chapter.text_area().node()
      });

      // add the personnel table
      T.prepare_and_build_table({
        table_class : "table-condensed ",
        rowseach : function(d,i){
          if (i % 2 === 1 ){
            d3.select(this).classed("odd",true);
          }
        },
        rows : personnel_data,
        headers : [['','']],
        row_class : ['left_text','right_number'],
        node : chapter.toggle_area(1).select(".text .inner").node()
      });
      personnel_bar(chapter.toggle_area(1).select(".graphic"));

      // add the personnel table
      T.prepare_and_build_table({
        table_class : "table-condensed ",
        rowseach : function(d,i){
          if (i % 2 === 1 ){
            d3.select(this).classed("odd",true);
          }
        },
        rows : internal_services_data,
        headers : [['','']],
        row_class : ['left_text','right_number'],
        node : chapter.toggle_area(2).select(".text .inner").node()
      });
      internal_services_bar(chapter.toggle_area(2).select(".graphic"));

      // create the pack chart for this year and add to the graph area
      pack_chart(chapter.graph_area());

      // add in the list of items
      list_div
        .append("ul")
        .attr("class","list-bullet-none")
        .selectAll("li")
        .data(d3.keys(label_mapping))
        .enter()
        .append("li")
        .append("a")
        .attr("class","ui-link")
        .html(function(d){return d;})
        .on("click", function(d){on_label_click(d)});

      // select the first item in the list
      on_label_click(d3.keys(label_mapping)[0]);
    }

    p.vote_stat_spend = function(){
      var text = this.gt("gov_vote_stat_spending"),
          d = this.data;
      // create the chapter
      var chapter = new STORY.chapter({
        toggles : [ 
          {toggle_text : this.app.get_text("previous_year_fisc") },
          {toggle_text : "More details on mandatory spending", add_divider : true },
          {toggle_text : "More details on discretionary spending" , add_divider : true }
        ],
        target : this.container
      });
      // setup the main chart
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
            {name: 'x', value:d.gov_this_year_stat_voted.stat, bottom_text : this.gt("stat") },
            {name: 'y', value:d.gov_this_year_stat_voted.voted, bottom_text :this.gt("voted") }
        ]
      })(chapter.graph_area());
      //setup the text area
      chapter.text_area().html(T.m(text, this.written_data));

      // setup the stat/voted trend area
      PACK.simple_circle_chart({
        height : height*1.10,
        formater : this.compact,
        colors : function(x){ return D3.tbs_color(Math.floor(x/3));},
        data : [
          {name : 'z',value: d.gov_last_3_year_stat_voted.stat, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: d.gov_last_2_year_stat_voted.stat, bottom_text : T.m('{{last_year_2}}'), top_text: this.gt("stat")},
          {name : 'x',value:  d.gov_last_year_stat_voted.stat, bottom_text : T.m('{{last_year}}')} ,
          {name : 'a',value: d.gov_last_3_year_stat_voted.voted, bottom_text : T.m('{{last_year_3}}')},
          {name : 'b',value: d.gov_last_2_year_stat_voted.voted, bottom_text : T.m('{{last_year_2}}'),top_text: this.gt("voted")},
          {name : 'c',value:  d.gov_last_year_stat_voted.voted, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

      // setup the top voted trend area
      // they will each be treated exactly the same, so this can be generalized
      _.each(["stat","voted"], function(type,i){
         var text = T.m(this.gt("top_"+type), this.written_data),
            data = _.chain(d['gov_this_year_top_'+type])
                      .map(function(x){
                        return {
                          name : x.desc,
                          value : x.total_net_auth
                        };
                      },this).value(),
            top_writen = _.chain(this.written_data['gov_this_year_top_'+type])
              .map(function(x){
                return [
                  window.depts[x.dept].dept[this.lang],
                  x.desc,
                  x.total_net_auth
                ];
              },this).value();
         chapter.toggle_area(i+1).select(".text .inner").html(text)
         T.prepare_and_build_table({
          table_class : "table-condensed ",
          rowseach : function(d,i){
            if (i % 2 === 1 ){
              d3.select(this).classed("odd",true);
            }
          },
           rows :  top_writen,
           headers : [["","",""]] ,
           row_class : ["left_text",'left_text','right_number'],
           node : chapter.toggle_area(1+i).select(".text .inner").node()
         });
         PACK.simple_circle_chart({
           height : height,
           formater : this.compact,
           data : data,
         })(chapter.toggle_area(1+i).select(".graphic"));

      },this);
      
    }

    p.gov_spend = function(){
      var text = this.gt("gov_this_year_qfr_spend"),
          d = this.data;
      // create the chapter
      var chapter = new STORY.chapter({
        toggles : [{
          toggle_text : T.m(this.app.get_text("this_time_last_year")),
          add_divider: true 
        }],
        target : this.container
      });
      chapter.text_area().html(T.m(text, this.written_data));

      PACK.circle_pie_chart({
        data : [
          {name: 'x', value : d.gov_this_year_qfr_auth},
          {name: 'y', value : d.gov_this_year_qfr_spend}
        ],
        formater : this.compact,
        height : height,
      })(chapter.graph_area());

      PACK.circle_pie_chart({
        data : [
          {name: 'x', value : d.gov_last_year_qfr_auth},
          {name: 'y', value : d.gov_last_year_qfr_spend }
        ],
        formater : this.compact,
        height : height,
      })(chapter.toggle_area());

    }

    p.gov_spend_change = function(){
      var text = this.gt("gov_this_year_qfr_spend_change"),
          d = this.data;

      // create the chapter
      var chapter = new STORY.chapter({
        target : this.container
      });
      chapter.text_area().html(T.m(text, this.written_data));

     D3.arrows({
       data : [
        {value: d.gov_auth_change, name : this.gt("authorities")},
        {value: d.gov_spend_change, name : this.gt("expenditures")},
       ],
       formater : this.percent,
       height : height,
     })(chapter.graph_area());

    }

    p.dept_auth = function(){
      var d = this.data,
          text = this.app.get_text("dept_this_year_auth");

      var chapter = new STORY.chapter({
        toggles :[ {
          toggle_text : this.app.get_text("previous_year_fisc")
        }],
        target : this.container
      });

      PACK.circle_pie_chart({
        height : height*1.5,
        centre : true,
        formater : this.compact,
        data : [
          {name:"x",value: d.gov_this_year_auth},
          {name:"y",value: d.dept_this_year_auth}
        ]
      })(chapter.graph_area());
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {name : 'z',value: d.dept_last_year_3_auth, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: d.dept_last_year_2_auth, bottom_text : T.m('{{last_year_2}}')},
          {name : 'x',value:  d.dept_last_year_auth, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

      chapter.text_area().html(T.m(text, this.written_data));
    };

    p.dept_estimates_split = function(){
      var text = this.app.get_text("dept_estimates_split"),
          compact = this.compact,
          d = this.data,
          cd = this.compact_data,
          wd = this.written_data,
          label_mapping = {},
          labels = [];
      // create the chapter
      var chapter = new STORY.chapter({
        height : height,
        target : this.container
      });
      //add the text 
      chapter.text_area().html(Handlebars.compile(text)(this.written_data));
    
      BAR.bar({
       series :  {'': _.pluck(this.data.dept_estimates_split,1) },
       ticks : _.pluck(this.data.dept_estimates_split,0),
       add_xaxis : true,
       x_axis_line : false,
       add_labels : true,
       html_ticks : true,
       margin : {top: 20, right: 20, left: 20, bottom: 60},
       label_formater : compact
     })(chapter.graph_area());

    };
    p.dept_vote_stat_spend = function(){
      var text = this.gt("dept_vote_stat_spending"),
          d = this.data;
      // create the chapter
      var chapter = new STORY.chapter({
        toggles : [ 
          {toggle_text : this.app.get_text("previous_year_fisc") },
          {toggle_text : "More details on mandatory spending", add_divider : true },
          {toggle_text : "More details on discretionary spending" , add_divider : true }
        ],
        target : this.container
      });
      // setup the main chart
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
            {name: 'x', value:d.dept_this_year_stat_voted.stat, bottom_text : this.gt("stat") },
            {name: 'y', value:d.dept_this_year_stat_voted.voted, bottom_text :this.gt("voted") }
        ]
      })(chapter.graph_area());
      //setup the text area
      chapter.text_area().html(T.m(text, this.written_data));

      // setup the stat/voted trend area
      PACK.simple_circle_chart({
        height : height*1.10,
        formater : this.compact,
        colors : function(x){ return D3.tbs_color(Math.floor(x/3));},
        data : [
          {name : 'z',value: d.dept_last_year_3_stat_voted.stat, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: d.dept_last_year_2_stat_voted.stat, bottom_text : T.m('{{last_year_2}}'), top_text: this.gt("stat")},
          {name : 'x',value: d.dept_last_year_stat_voted.stat, bottom_text : T.m('{{last_year}}')} ,
          {name : 'a',value: d.dept_last_year_3_stat_voted.voted, bottom_text : T.m('{{last_year_3}}')},
          {name : 'b',value: d.dept_last_year_2_stat_voted.voted, bottom_text : T.m('{{last_year_2}}'),top_text: this.gt("voted")},
          {name : 'c',value: d.dept_last_year_stat_voted.voted, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

      // setup the top voted trend area
      // they will each be treated exactly the same, so this can be generalized
      _.each(["stat","voted"], function(type,i){
         var text = T.m(this.gt("top_"+type), this.written_data),
            data = _.chain(d['dept_this_year_top_'+type])
                      .map(function(x){
                        return {
                          name : x.desc,
                          value : x.total_net_auth
                        };
                      },this).value(),
            top_writen = _.chain(this.written_data['dept_this_year_top_'+type])
              .map(function(x){
                return [ x.desc,
                        x.total_net_auth
                ];
              },this).value();
         chapter.toggle_area(i+1).select(".text .inner").html(text)
         T.prepare_and_build_table({
          table_class : "table-condensed ",
          rowseach : function(d,i){
            if (i % 2 === 1 ){
              d3.select(this).classed("odd",true);
            }
          },
           rows :  top_writen,
           headers : [["",""]] ,
           row_class : ['left_text','right_number'],
           node : chapter.toggle_area(1+i).select(".text .inner").node()
         });
         PACK.simple_circle_chart({
           height : height,
           formater : this.compact,
           data : data,
         })(chapter.toggle_area(1+i).select(".graphic"));

      },this);

    };

    p.dept_type_spend = function(){
      var d = this.data,
          q = this.dept_q,
          compact = this.compact,
          wd = this.written_data,
          table_data = _.zip(wd.dept_this_year_type_spend.so,
                             wd.dept_this_year_type_spend.plannedexp).reverse(),
          to_be_packed_data = _.map(d.dept_this_year_type_spend.so,function(so,i){
            return { name : so,value : d.dept_this_year_type_spend.plannedexp[i] };
          }),
          packed_data = PACK.pack_data(to_be_packed_data,this.gt("other"), {
            force_positive : true,
            filter_zeros : true
          }),
          chapter = new STORY.chapter({
           toggles :[ {
             toggle_text :   this.gt("previous_year_fisc"),
             add_divider : true
           }],
           target : this.container
          }),
          graph = PACK.pack({
            height : 2 * height,
            html_tags : true,
            top_font_size : 12,
            data : packed_data,
            zoomable : true
          }),
          text = this.gt("dept_type_spending"),
          on_so_click = function(so){
             // highlight the current link
             list_div.selectAll("li").classed("background-medium",false);
             list_div.selectAll("li").filter(function(d){return d === so;})
               .classed("background-medium",true);
             // remove the previous graph
             graph_div.selectAll("*").remove();
             // look the key back up
             var years = [ T.m("{{last_year_3}}"), T.m("{{last_year_2}}"), T.m("{{last_year}}") ];
             var row = q.table5.get_row({"so": so});
             var data = [
               row["{{last_year_3}}"],
               row["{{last_year_2}}"],
               row["{{last_year}}"]
             ];
             BAR.bar({
               series :  {'': data },
               ticks : years,
               height : 300,
               add_xaxis : true,
               x_axis_line : false,
               add_labels : true,
               label_formater : compact
             })(graph_div);
          },
          standard_objects = q.table5.get_cols(["so"]).so,
          graph_div = chapter.toggle_area().select(".graphic"),
          list_div = chapter.toggle_area()
            .select(".text .inner");

      chapter.text_area().html(T.m(text, this.written_data));
      T.prepare_and_build_table({
          table_class : "table-condensed ",
          rowseach : function(d,i){
            if (i % 2 === 1 ){
              d3.select(this).classed("odd",true);
            }
          },
        rows :  table_data,
        headers : [["","Expenditures"]] ,
        row_class : ['left_text','right_number'],
        node : chapter.text_area().node()
      });

      graph(chapter.graph_area());

      list_div
        .append("ul")
        .attr("class","list-bullet-none")
        .selectAll("li")
        .data(standard_objects)
        .enter()
        .append("li")
        .append("a")
        .attr("class","ui-link")
        .html(function(d){return d;})
        .on("click", function(d){on_so_click(d)});

      on_so_click(standard_objects[0]);
      
    };


    p.dept_spend = function(){
      var chapter = new STORY.chapter({
        toggles :[ {
          toggle_text :   "toggle"
        }],
        target : this.container
      });

    };
    p.dept_spend_change = function(){
      var chapter = new STORY.chapter({
        toggles :[ {
          toggle_text : "toggle"
        }],
        target : this.container
      });

    };

})();


