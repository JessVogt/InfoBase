(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var HORIZONTAL = ns("D3.HORIZONTAL");
    var STORY = ns('D3.STORY');
    var PACK = ns('D3.PACK');
    var BAR = ns('D3.BAR');
    var INFO = ns("INFO");

    var height = 250;


    var name_to_class = function(name){
      return name.replace(/[\s| |']/g,"").toLowerCase();
    };

    var table_query_link = function(table, func, args){
      return {
        link : HORIZONTAL.create_analytics_link(table, args[0]),
        data : table.q[func].apply(this,args)
      };
    };

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
      this.t = _.chain(T.tables)
        .map(function(x){ return [x.id, x];})
        .object()
        .value();
      this.create_link = function(table,cols){
        return HORIZONTAL.create_analytics_link(this.t[table],cols,app.lang);
      };
      // set the formaters
      this.percent = function(x){return app.formater("percentage",x);};
      this.compact = function(x){return app.formater("compact1",x);};
      this.compact0 = function(x){return app.formater("compact0",x);};
      this.written = function(x){return app.formater("compact_written",x);};

      this.data_prep(dept);
      if (_.isUndefined(dept)){
        this.knowledge_graph();
        //this.gov_auth();
        //this.estimates_split();
        //this.vote_stat_spend();

        //this.gov_type_spend();
        //this.gov_spend();
        //this.gov_spend_change();
      } else {
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

    p.make_graph_context = function(extra){
      return _.extend({
        data : this.data,
        written_data : this.written_data,
        compact_data : this.compact_data,
        compact : this.compact,
        percent : this.percent,
        compact1 : this.compact,
        written : this.written
      },extra);
    };

    p.data_prep = function(dept){
       this.data = T.Info({dept:dept});
       this.written_data = T.format_info(this.written, this.data);
       this.compact_data = T.format_info(this.compact, this.data);
    };


    p.knowledge_graph = function(){

      var chapter = new STORY.chapter({
        span : "span-8",
        target : this.container,
        sources : []
      });

      var graph = INFO.info_graph(chapter.graph_area(),this.app);
      graph.dispatch.on("dataClick",function(node,nodes){
        var node_plus_parents = INFO.get_node_parents(node);
        var tags = _.map(node_plus_parents, function(n){
          return  name_to_class(n.name_en);
        });
        console.log(tags);
      });

    };

    p.gov_auth = function(){

      var chapter = new STORY.chapter({
        toggles :[ {
          toggle_text : this.app.get_text("previous_year_fisc"),
          add_divider : true,
          sources : [this.create_link("table4",["{{last_year}}auth","{{last_year_2}}auth","{{last_year_3}}auth"])]
        }],
        target : this.container,
        sources : [this.create_link("table8","total_net_auth")]
      });

      this.t.table8.graph("this_year_auth",this.make_graph_context({
        height : height*1.5,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

      this.t.table4.graph("historical_auth",this.make_graph_context({
        height : height,
        graph_area : chapter.toggle_area().select(".graphic"),
        text_area : chapter.toggle_area().select(".text")
      })).render();

    };

    p.estimates_split = function(){
      var chapter = new STORY.chapter({
        height : height,
        target : this.container
      });

      this.t.table8.graph("estimates_split",this.make_graph_context({
        height : height*1.5,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

    };

    p.vote_stat_spend = function(){
      var d = this.data;
      // create the chapter
      var chapter = new STORY.chapter({
        toggles : [ 
          {toggle_text : this.app.get_text("previous_year_fisc")},
          {toggle_text : "More details on mandatory spending", add_divider : true },
          {toggle_text : "More details on discretionary spending" , add_divider : true }
        ],
        target : this.container
      });

      this.t.table8.graph("stat_voted_split",this.make_graph_context({
        height : height,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

      this.t.table4.graph("vote_stat_split",this.make_graph_context({
        height : height*1.10,
        graph_area : chapter.toggle_area().select(".graphic"),
        text_area : chapter.toggle_area().select(".text")
      })).render();


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
            top_written = _.chain(this.written_data['gov_this_year_top_'+type])
              .map(function(x){
                return [
                  window.depts[x.dept].dept[this.lang],
                  x.desc,
                  x.total_net_auth
                ];
              },this).value();
         chapter.toggle_area(i+1).select(".text .inner").html(text);
         T.prepare_and_build_table({
          table_class : "table-condensed ",
          rowseach : function(d,i){
            if (i % 2 === 1 ){
              d3.select(this).classed("odd",true);
            }
          },
           rows :  top_written,
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
      
    };

    p.gov_type_spend = function(){
      var text = this.gt("gov_type_spending"),
          d = this.data,
          wd = this.written_data,
          cd = this.compact_data,
          compact = this.compact,

          internal_services_text = this.gt("internal_service_spend"),
          internal_services_data = _.zip( d.last_years, wd.gov_is  ),
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
          table_data = _.chain(data)
              .sortBy(function(label_value){
                return -label_value[1];
              })
             .map(function(label_value){
                label_value[1] = this.compact(label_value[1]).replace("B","");
                return label_value;
              },this)
             .value(),
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
          formater = this.compact,
          pack_chart = PACK.pack({
            width : height*1.7,
            formater : formater,
            top_font_size : 14,
            data : packing_data,
            html_tags : true,
            cycle_colours : true,
            text_func : function(d){
              var val = formater(d.value);
              if (d.zoom_r > 60) {
                return d.name ; 
              } else if (d.zoom_r > 40) {
                return _.first(d.name.split(" "),2).join(" ")+ " - "+ val;  
              } else  {
                return val;
              }
            }
          }),
          //create the graph
          on_label_click = function(label){
            // highlight the current link
            list_div.selectAll("li").classed("background-medium",false);
            list_div.selectAll("li")
              .filter(function(d){return d === label;})
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
        rows : table_data,
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
        .attr("class","margin-bottom-small")
        .append("a")
        .attr("class","ui-link")
        .style("color","inherit")
        .html(function(d){return d;})
        .on("click", function(d){on_label_click(d);});

      // select the first item in the list
      on_label_click(d3.keys(label_mapping)[0]);
    };


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
      })(chapter.toggle_area().select(".graphic"));

    };

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

    };

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
      var text = this.gt("dept_this_year_vote_stat_split"),
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
      })(chapter.toggle_area().select(".graphic"));

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
            top_written = _.chain(this.written_data['dept_this_year_top_'+type])
              .map(function(x){
                return [ x.desc,
                        x.total_net_auth
                ];
              },this).value();
         chapter.toggle_area(i+1).select(".text .inner").html(text);
         T.prepare_and_build_table({
          table_class : "table-condensed ",
          rowseach : function(d,i){
            if (i % 2 === 1 ){
              d3.select(this).classed("odd",true);
            }
          },
           rows :  top_written,
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
          q = this.t.table5.q(d.dept),
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
            formater : compact,
            html_tags : true,
            top_font_size : 12,
            data : packed_data,
            zoomable : true,
            text_func : function(d){
              var val = compact(d.value);
              if (d.zoom_r > 60) {
                return d.name ; 
              } else if (d.zoom_r > 40) {
                return _.first(d.name.split(" "),2).join(" ")+ " - "+ val;  
              } else  {
                return val;
              }
            }

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
             var row = q.get_row({"so": so});
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
          standard_objects = q.get_cols(["so"]).so,
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
        .on("click", function(d){on_so_click(d);});

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


