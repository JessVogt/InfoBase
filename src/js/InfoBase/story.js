(function(root) {

    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var HORIZONTAL = ns("D3.HORIZONTAL");
    var PANEL = ns('D3.PANEL');
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
      $(container).children().remove();

      APP.OrgHeader(this.app,org,true,container);

      d3.select(container).select(".alternative-view ul li a")
        .attr("href","#d-"+org.accronym)
        .html(this.app.get_text("widget_view"));

      new STORYBOARD(container, this.app, org.accronym);
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

      this.container = d3.select(container);
      this.dept = dept;
      this.app = app;
      this.gt = app.get_text;
      this.calculated_values = {};
      this.lang = app.lang;
      this.t = _.chain(T.tables)
        .map(function(x){ return [x.id, x];})
        .object()
        .value();

      this.data_prep(dept);
      _.each(["intro", "financial_data","vote_stat_spend","type_spend","estimates_split",
              "qfr_spend", "qfr_spend_change", "people_data","by_province","by_employee_type",
              "by_age_band"],function(func_name){
        this[func_name](new PANEL.panel_collection({
          target : this.container,
          center_text : true,
          auto_hide:true
        }));
      },this);

      // add in return to top arrows
      this.container.selectAll(".title-right")
        .filter(function(d,i){ return i >1;})
        .append("a")
        .attr("href","#story_top")
        .attr("class","scroll")
        .html(app.get_text("top"));
    };

    var p = STORYBOARD.prototype;

    p.make_graph_context = function(extra){
      return _.extend({
        dept : this.dept,
        lang : this.app.lang,
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
       this.written_data = T.format_info(this.app.compact_written, this.data);
       this.compact_data = T.format_info(this.app.compact, this.data);
    };

    p.intro = function(collection){
      var panel = collection.add_panel({
        off : ["graph", "source"],
        id: "story_top"
      });
      panel.areas().title.html("Introduction");
      panel.areas().text.html(this.gt("infograph_introduction"));
    };

    p.financial_data = function(collection){
      this.t.table8.graph("this_year_auth",this.make_graph_context({
        height : height*1.5,
        panel : collection.add_panel({ id : "__financial__"}),

      }));
      this.t.table4.graph("historical_auth_exp",this.make_graph_context({
        height : height,
        panel : collection.add_panel()
      }));
    };

    p.vote_stat_spend = function(collection){

      this.t.table8.graph("voted_stat_split",this.make_graph_context({
        height : 1.5*height,
        panel : collection.add_panel({id : "__voted_stat__"}),
      }));

      this.t.table4.graph("vote_stat_split",this.make_graph_context({
        height : height*1.10,
        panel : collection.add_panel()
      }));

      this.t.table8.graph("planned_stat",this.make_graph_context({
        height : 1.6*height,
        to_show : 10,
        panel : collection.add_panel()
      }));

      this.t.table8.graph("planned_voted",this.make_graph_context({
        height : 1.6*height,
        to_show : 10,
        panel :  collection.add_panel()
      }));

    };

    p.type_spend = function(collection){
      // in year standard objects/spending type
      // historical standard objects/spending type
      // g_and_c history
      // for GoC a personnel graph which will be removed for a 
      // department 
      // a program activity graph
      var  program_graph;

      this.t.table2.graph("type_spend",this.make_graph_context({
        height : 1.5*height,
        panel: collection.add_panel({id : "__spending_areas__" })
      }));

      this.t.table5.graph("type_spend",this.make_graph_context({
        height : 1.5*height,
        panel: collection.add_panel()
      }));

      this.t.table7.graph("g_and_c_history",this.make_graph_context({
        height : 1.5*height,
        panel: collection.add_panel()
      }));

      this.t.table5.graph("gov_personnel_spend",this.make_graph_context({
        height : 1.5*height,
        panel: collection.add_panel()
      }));

      program_graph  = this.dept ? "program_spending" :  "gov_internal_services";
      this.t.table6.graph(program_graph,this.make_graph_context({
        height : 1.5*height,
        panel: collection.add_panel()
      }));
    };

    p.estimates_split = function(collection){
      this.t.table8.graph("estimates_split",this.make_graph_context({
        height : height*1.5,
        panel : collection.add_panel({id : "__estimates_split__" }),
      }));
    };

    p.qfr_spend = function(collection){
      this.t.table1.graph("qfr_spend_comparison",this.make_graph_context({
        height : height,
        panel : collection.add_panel()
      }));
    };

    p.qfr_spend_change = function(collection){
      this.t.table1.graph("qfr_percentage_change",this.make_graph_context({
        height : height,
        panel : collection.add_panel()
      }));
    };

    p.people_data = function(collection){
      this.t.table9.graph("total_employment",this.make_graph_context({
        height : height,
        panel : collection.add_panel({ id : "__people__"  })
      }));
    };

    p.by_province = function(collection){
      this.t.table10.graph("prov_split",this.make_graph_context({
        bigintreal : this.bigintreal,
        panel : collection.add_panel({ span : "span-8",})
      }));
    };

    p.by_employee_type = function(collection){
      this.t.table9.graph("employee_type",this.make_graph_context({
          panel : collection.add_panel()
      }));
    };

    p.by_age_band = function(collection) {
      this.t.table11.graph("employee_age",this.make_graph_context({
        panel : collection.add_panel()
      }));
    };

})();


