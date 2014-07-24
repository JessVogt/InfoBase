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
      this.dept = dept;
      this.container = d3.select(container);
      this.app = app;
      this.gt = app.get_text;
      this.calculated_values = {};
      this.lang = app.lang;
      this.t = _.chain(T.tables)
        .map(function(x){ return [x.id, x];})
        .object()
        .value();

      this.data_prep(dept);

      this.intro();
      this.auth();
      this.vote_stat_spend();
      this.type_spend();
      this.estimates_split();

      this.qfr_spend();
      this.qfr_spend_change();

      this.people_data();
      this.by_province();
      this.by_employee_type();
      this.by_age_band();

      // psas DOM object instead of wrapped
      STORY.center_text(container);
      // hide all the containers which are meant to be toggled
      this.container.selectAll(".togglee").classed("ui-screen-hidden",true);
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

    p.intro = function(){
      var chapter = new STORY.chapter({
        off : ["graph", "source"],
        target : this.container,
        id: "story_top"
      });
      chapter.areas().title.html("Introduction");
      chapter.areas().text.html(this.gt("infograph_introduction"));
    
    };

    p.auth = function(){
      var chapter = new STORY.chapter({
        toggles :[{ key : "historical_auth_exp" }],
        target : this.container,
        id : "__financial__"
      });
      this.t.table8.graph("this_year_auth",this.make_graph_context({
        height : height*1.5,
        chapter : chapter,
      }));
      this.t.table4.graph("historical_auth_exp",this.make_graph_context({
        height : height,
        chapter : chapter.child("historical_auth_exp")
      }));
    };

    p.vote_stat_spend = function(){
      var chapter = new STORY.chapter({
        toggles : [{ key: "vote_stat_split" },
                   { key : "planned_stat" },
                   { key : "planned_voted" }
        ],
        target : this.container,
        id : "__voted_stat__"
      });

      this.t.table8.graph("voted_stat_split",this.make_graph_context({
        height : 1.5*height,
        chapter : chapter
      }));

      this.t.table4.graph("vote_stat_split",this.make_graph_context({
        height : height*1.10,
        chapter : chapter.child("vote_stat_split")
      }));

      this.t.table8.graph("planned_stat",this.make_graph_context({
        height : 1.6*height,
        to_show : 10,
        chapter : chapter.child("planned_stat")
      }));

      this.t.table8.graph("planned_voted",this.make_graph_context({
        height : 1.6*height,
        to_show : 10,
        chapter : chapter.child("planned_voted")
      }));

    };

    p.type_spend = function(){
      // in year standard objects/spending type
      // historical standard objects/spending type
      // g_and_c history
      // for GoC a personnel graph which will be removed for a 
      // department 
      // a program activity graph

      var chapter = new STORY.chapter({
         toggles :[{ key : "type_spend" },
                   { key : "g_and_c_type"},
                   { key : "so_personnel"},
                   { key : "pa_type"}],
         target : this.container,
          id : "__spending_areas__"
      });

      this.t.table2.graph("type_spend",this.make_graph_context({
        height : 1.5*height,
        chapter: chapter
      }));

      this.t.table5.graph("type_spend",this.make_graph_context({
        height : 1.5*height,
        chapter: chapter.child("type_spend")
      }));

      this.t.table7.graph("g_and_c_history",this.make_graph_context({
        height : 1.5*height,
        chapter: chapter.child("g_and_c_type")
      }));

      this.t.table5.graph("gov_personnel_spend",this.make_graph_context({
        height : 1.5*height,
        chapter: chapter.child("so_personnel")
      }));

      if (this.dept) {
        this.t.table6.graph("program_spending",this.make_graph_context({
          height : 1.5*height,
          chapter: chapter.child("pa_type")
        }));
      }else {
        this.t.table6.graph("gov_internal_services",this.make_graph_context({
          height : 1.5*height,
          chapter: chapter.child("pa_type")
        }));
      }
    };

    p.estimates_split = function(){
      this.t.table8.graph("estimates_split",this.make_graph_context({
        height : height*1.5,
        chapter : new STORY.chapter({ target : this.container,id : "__estimates_split__" }),
      }));
    };

    p.qfr_spend = function(){
      this.t.table1.graph("qfr_spend_comparison",this.make_graph_context({
        height : height,
        chapter : new STORY.chapter({
                    target : this.container
                  })
      }));
    };

    p.qfr_spend_change = function(){
      this.t.table1.graph("qfr_percentage_change",this.make_graph_context({
        height : height,
        chapter : new STORY.chapter({
        target : this.container
      })
      }));
    };

    p.people_data = function(){
      this.t.table9.graph("total_employment",this.make_graph_context({
        height : height,
        chapter : new STORY.chapter({ target : this.container,id : "__people__" })
      }));
    };

    p.by_province = function(){
      this.t.table10.graph("prov_split",this.make_graph_context({
        bigintreal : this.bigintreal,
        chapter : new STORY.chapter({
                    span : "span-8",
                    target : this.container,
                    title : this.t.table10.name[this.lang]
                  })
      }));
    };

    p.by_employee_type = function(){
      this.t.table9.graph("employee_type",this.make_graph_context({
          chapter : new STORY.chapter({
                        span : "span-4",
                        target : this.container,
                        title : this.t.table9.name[this.lang]
                      })
      }));
    };

    p.by_age_band = function() {
      this.t.table11.graph("employee_age",this.make_graph_context({
        chapter : new STORY.chapter({
                    span : "span-4",
                    target : this.container,
                    title : this.t.table11.name[this.lang]
                  })
      }));
    };

})();


