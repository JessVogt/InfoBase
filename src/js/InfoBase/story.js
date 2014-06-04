(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var HORIZONTAL = ns("D3.HORIZONTAL");
    var STORY = ns('D3.STORY');
    var PACK = ns('D3.PACK');
    var BAR = ns('D3.BAR');

    APP.add_container_route("infograph","infographic",function(container){
      this.add_crumbs([this.home_crumb,{html: "Infographic"}]);
      
      this.add_title($('<h1>').html("Infographic"));
      if (!this.app.explore){
       this.app.explore =  new STORYBOARD(container, this.app);
      }
    });

    APP.add_container_route("infograph-:org","infographic_org",function(container, org){
      org = window.depts[org];
      if (org){
        this.app.state.set("dept",org);
      }
      var title =  org.dept[this.app.lang] + " Infographic";
      this.add_crumbs([this.home_crumb,{html: title}]);
      this.add_title($('<h1>').html(title));
      container.children().remove();
      STORYBOARD(container, this.app, org.accronym);
    });

    var height = 250;

    var name_to_class = function(name){
      if (_.isArray(name)){
        return _.map(name, name_to_class).join(" ");
      }
      return name.replace(/[\s| |']/g,"").toLowerCase();
    };

    var table_query_link = function(table, func, args){
      return {
        link : HORIZONTAL.create_analytics_link(table, args[0]),
        data : table.q[func].apply(this,args)
      };
    };

    var STORYBOARD = function(container,app,dept){
      this.dept = dept;
      this.container = d3.select(container);
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
      this.bigintreal = function(x){return app.formater("big-int-real",x);};


      this.data_prep(dept);
      this.auth();
      this.vote_stat_spend();
      this.type_spend();
      this.estimates_split();

      this.qfr_spend();
      this.qfr_spend_change();

      this.by_province();
      this.by_employee_type();
      this.by_age_band();
      
      // psas DOM object instead of wrapped
      STORY.center_text(container);
      this.container.selectAll(".toggle").classed("ui-screen-hidden",true);
    };

    var p = STORYBOARD.prototype;

    p.make_graph_context = function(extra){
      return _.extend({
        dept : this.dept,
        gt : this.app.get_text,
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

    p.auth = function(){
      var chapter = new STORY.chapter({
        toggles :[{
          toggle_text : this.app.get_text("previous_year_fisc"),
          add_divider : true,
          sources : [this.create_link("table4",["{{last_year}}auth","{{last_year_2}}auth","{{last_year_3}}auth"])],
        }],
        target : this.container,
        sources : [this.create_link("table8","total_net_auth")],
        title : this.app.get_text("financial_data")

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
        target : this.container,
        title : "Approvals by Estimates"
      });

      this.t.table8.graph("estimates_split",this.make_graph_context({
        height : height*1.5,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area(),
      })).render();

    };

    p.vote_stat_spend = function(){
      // create the chapter
      var chapter = new STORY.chapter({
        toggles : [ 
          {toggle_text : this.app.get_text("previous_year_fisc"), add_divider: true},
          {toggle_text : "More details on statutory spending", add_divider : true },
          {toggle_text : "More details on voted spending" , add_divider : true }
        ],
        target : this.container,
        title : this.app.get_text("vote_stat_split")
      });

      this.t.table8.graph("stat_voted_split",this.make_graph_context({
        height : 1.5*height,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

      this.t.table4.graph("vote_stat_split",this.make_graph_context({
        height : height*1.10,
        graph_area : chapter.toggle_area().select(".graphic"),
        text_area : chapter.toggle_area().select(".text")
      })).render();

      this.t.table8.graph("planned_stat",this.make_graph_context({
        height : 1.6*height,
        graph_area : chapter.toggle_area(1).select(".graphic"),
        text_area : chapter.toggle_area(1).select(".text"),
        to_show : 10,
      })).render();

      this.t.table8.graph("planned_voted",this.make_graph_context({
        height : 1.6*height,
        graph_area : chapter.toggle_area(2).select(".graphic"),
        text_area : chapter.toggle_area(2).select(".text"),
        to_show : 10,
      })).render();

      // setup the top voted trend area
      // they will each be treated exactly the same, so this can be generalized
      _.each(["stat","voted"], function(type,i){
         var data,written_data,shown,total,rest_total,headers;
         if (this.data.dept){
         //chapter.toggle_area(i+1).select(".text .inner").html(text);
           data = this.data["dept_this_year_"+type];
           written_data = this.written_data["dept_this_year_"+type];
           shown = _.map(written_data,function(row){
             var dept_name = row.dept ? T.org_name(row.dept,this.app.lang) : '';
             return [dept_name,row.desc,row.total_net_auth];
           },this);

           total = [ "Total",
                     this.written(d3.sum(data, function(d){
                        return d.total_net_auth;
                     }))
           ];
           shown.push(total);
           headers = [["Item", this.gt("planned_spending")]];

         } else {
         //chapter.toggle_area(i+1).select(".text .inner").html(text);
           data = this.data["gov_this_year_"+type];
           written_data = this.written_data["gov_this_year_"+type];
           shown = _.map(written_data,function(row){
             var dept_name = row.dept ? T.org_name(row.dept,this.app.lang) : '';
             return [dept_name,row.desc,row.total_net_auth];
           },this);

           total = [ "Total",
                     '',
                     this.written(d3.sum(data, function(d){
                       return d.total_net_auth;
                     }))
           ];
           shown.push(total);
           headers = [[this.gt("org"), "Item", this.gt("planned_spending")]];

         }
         T.prepare_and_build_table({
          table_class : "table-condensed ",
          stripe : true,
          rowseach : function(d,i){
            if (d === total){
              d3.select(this).classed("background-medium",true);
            }
          },
          table_css : { "font-size" : "10px" },
          rows :  shown,
          headers : headers,
          row_class : ["left_text",'left_text','right_number'],
          node : chapter.toggle_area(1+i).select(".text .inner").node()
         });
      },this);
    };

    p.type_spend = function(){
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
             target : this.container,
             title : this.app.get_text("fin_spending_type")
          }),
          headers = [['','($ B)']],
          formater = this.compact,
          pack_chart = PACK.pack({
            width : height*1.7,
            formater : formater,
            invisible_grand_parent : false,
            top_font_size : 14,
            data : packing_data,
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
        //.style("color","inherit")
        .html(function(d){return d;})
        .on("click", function(d){on_label_click(d);});

      // select the first item in the list
      on_label_click(d3.keys(label_mapping)[0]);
    };


    p.qfr_spend = function(){
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

    p.qfr_spend_change = function(){
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

    p.by_province = function(){
      var chapter = new STORY.chapter({
        span : "span-8",
        target : this.container,
        title : this.t.table10.name[this.lang]
      });

      this.t.table10.graph("prov_split",this.make_graph_context({
        graph_area : chapter.graph_area(),
        bigintreal : this.bigintreal,
        text_area : chapter.text_area()
      })).render();

    };

    p.by_employee_type = function(){
      var chapter = new STORY.chapter({
        span : "span-4",
        target : this.container,
        title : this.t.table9.name[this.lang]
      });

      this.t.table9.graph("employee_type",this.make_graph_context({
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

    };

    p.by_age_band = function() {
      var chapter = new STORY.chapter({
        span : "span-4",
        target : this.container,
        title : this.t.table11.name[this.lang]
      });

      this.t.table11.graph("employee_age",this.make_graph_context({
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

    };

})();


