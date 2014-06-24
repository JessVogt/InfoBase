(function(root) {

    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var HORIZONTAL = ns("D3.HORIZONTAL");
    var STORY = ns('D3.STORY');
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
              d3.select(this).classed("background-medium total-row",true);
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
          });

      this.t.table2.graph("goc_type_spend",this.make_graph_context({
        height : 1.5*height,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

      this.t.table5.graph("gov_type_spend",this.make_graph_context({
        height : 1.5*height,
        graph_area : chapter.toggle_area().select(".graphic"),
        text_area : chapter.toggle_area().select(".text .inner")
      })).render();

      this.t.table5.graph("gov_personnel_spend",this.make_graph_context({
        height : 1.5*height,
        graph_area : chapter.toggle_area(1).select(".graphic"),
        text_area : chapter.toggle_area(1).select(".text .inner")
      })).render();

      this.t.table6.graph("gov_internal_services",this.make_graph_context({
        height : 1.5*height,
        graph_area : chapter.toggle_area(2).select(".graphic"),
        text_area : chapter.toggle_area(2).select(".text .inner")
      })).render();

    };


    p.qfr_spend = function(){
      // create the chapter
      var chapter = new STORY.chapter({
        target : this.container
      });

      this.t.table1.graph("qfr_spend_comparison",this.make_graph_context({
        height : height,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();


    };

    p.qfr_spend_change = function(){
      // create the chapter
      var chapter = new STORY.chapter({
        target : this.container
      });

      this.t.table1.graph("qfr_percentage_change",this.make_graph_context({
        height : height,
        graph_area : chapter.graph_area(),
        text_area : chapter.text_area()
      })).render();

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


