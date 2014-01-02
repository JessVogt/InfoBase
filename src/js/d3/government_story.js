(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var STORY = ns('D3.STORY');
    var PACK = ns('D3.PACK');
    var BAR = ns('D3.BAR');

    var height = 250;

    center_text = function(container){
      // this function will vertically center all the inner text
      _.delay(function(){
         container.find(".text").each(function(){
           var that = $(this);
           var my_height = that.height();
           var sibling_height = that.siblings(".graphic").height();
           var height = Math.max(my_height, sibling_height);
           if (height === 0 ) { return ;}
           that.height(height);
           that.find(".inner")
           .css({
             "position" : "absolute",
             "top" : (height - that.find(".inner").height())/2
           });
         });
      });
    };

    STORY.gov_story =  function(container,app){
      return new _gov_story(container,app);
    };

    _gov_story = function(container,app){
      this.container = d3.select(container[0]);
      this.app = app;
      this.gt = app.get_text;
      this.calculated_values = {};
      this.lang = app.lang;
      // set the formaters
      this.percent = function(x){return app.formater("percentage",x);},
      this.compact = function(x){return app.formater("compact",x);},

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
      //this.gov_spend();
      this.gov_type_spend();
      //this.vote_stat_spend();
      center_text(container);
    };

    var p = _gov_story.prototype;



    p.register_for_open  = function(chapter){
      chapter.dispatch.on("toggle",function(state){
         if (state === 'open'){
            center_text(chapter.toggle_area());
         }
      });
    }

    p.data_prep = function(){
      var t = this.t,
          q = this.q,
          app = this.app,
          compact = function(x){return app.formater("compact",x);},
          written = function(x){return app.formater("compact_writen",x);};
      this.data =  {
        this_year_gov_auth :  q.table1.sum("thisyearauthorities"),
        last_year_gov_auth :  q.table4.sum('{{last_year}}auth'),
        last_year_2_gov_auth : q.table4.sum('{{last_year_2}}auth'),
        last_year_3_gov_auth : q.table4.sum('{{last_year_3}}auth'),

        this_year_gov_type_spend :  t.table2.spending_type("plannedexp",false), 
        last_year_gov_type_spend :   t.table5.spending_type("{{last_year}}",false), 
        last_year_2_gov_type_spend : t.table5.spending_type("{{last_year_2}}",false), 
        last_year_3_gov_type_spend : t.table5.spending_type("{{last_year_3}}",false), 

        this_year_gov_stat_voted :  t.table1.voted_stat("thisyearauthorities",false), 
        last_year_gov_stat_voted : t.table4.voted_stat('{{last_year}}auth',false), 
        last_year_2_gov_stat_voted :  t.table4.voted_stat('{{last_year_2}}auth',false), 
        last_year_3_gov_stat_voted : t.table4.voted_stat('{{last_year_2}}auth',false), 

        this_year_gov_estimates_split : q.table8.estimates_split(false,false),

        auth_change: q.table1.auth_change(false),
        spend_change : q.table1.exp_change(false),

        this_year_spend_auth : [ q.table1.sum("thisyearauthorities"),
                                 q.table1.sum("thisyearexpenditures")],
        last_year_spend_auth : [ q.table1.sum("lastyearauthorities"),
                                 q.table1.sum("lastyearexpenditures")],

      };
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
      this.written_data.auth_change[2] = this.compact_data.auth_change[2] = this.percent(this.data.auth_change[2]);
      this.written_data.spend_change[2] = this.compact_data.spend_change[2] = this.percent(this.data.spend_change[2]);
    }

    p.gov_spend = function(){
      var d = this.data,
          text = this.app.get_text("this_year_gov_spending");

      
      var chapter = new STORY.chapter({
        add_toggle_section: true, 
        toggle_text : this.app.get_text("previous_year_fisc"),
        target : this.container
      });

      PACK.simple_circle_chart({
        height : height*1.5,
        formater : this.compact,
        data : [
          {value: d.this_year_gov_auth}
        ]
      })(chapter.graph_area());
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {name : 'z',value: d.last_year_gov_auth, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: d.last_year_2_gov_auth, bottom_text : T.m('{{last_year_2}}')},
          {name : 'x',value:  d.last_year_3_gov_auth, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

      chapter.text_area().html(T.m(text, this.written_data));

    };

    p.gov_type_spend = function(){
      var text = this.app.get_text("gov_type_spending"),
          d = this.data,
          cd = this.compact_data,
          wd = this.written_data,
          label_mapping = {},
          labels = [];
      // add in the labels to the data
      var data = {
        name : '',
        children : _.chain(this.data.this_year_gov_type_spend)
          .map(function(value,key){
            var label =  this.gt(key+"_spend_type");
            label_mapping[label]= key;
            labels.push(label);
             return {
               children : null,
               name :  label + " (" + this.compact(value)+")",
               value : value
             };
          },this)
          .value()
      };

      // create the chapter
      var chapter = new STORY.chapter({
        add_toggle_section: true, 
        toggle_text : this.app.get_text("previous_year_fisc"),
        target : this.container,
        add_section_to_toggle : true
      });
      this.register_for_open(chapter);

      //add the text 
      chapter.text_area().html(Handlebars.compile(text)(this.compact_data));

      // create the pack chart for this year and add to the graph area
      var pack_chart = PACK.pack({
        width : height*1.5,
        formater : this.compact,
        top_font_size : 14,
        data : data,
        html_tags : true,
        cycle_colours : true
      });
      pack_chart(chapter.graph_area());

      //create the year options list
      var list_div = chapter.toggle_area().select(".text .inner");
      var graph_div = chapter.toggle_area().select(".graphic");

      // add in the list of items
        list_div
          .append("ul")
          .attr("class","list-bullet-none")
          .selectAll("li")
          .data(labels)
          .enter()
          .append("li")
          .append("a")
          .html(function(d){return d;})
          .on("click", function(d){on_label_click(d)});

      //create the graph
      var on_label_click = function(label){
        // look the key back up
        var key = label_mapping[label];
        var data = [
           T.m("{{last_year_3}}"),d.last_year_3_gov_type_spend[key],
           T.m("{{last_year_2}}"),d.last_year_2_gov_type_spend[key],
           T.m("{{last_year}}"),d.last_year_gov_type_spend[key]
        ];
        
      };

      // select the first item in the list
      on_label_click(labels[0]);
    }

    p.vote_stat_spend = function(){
      // create the chapter
      var chapter = new STORY.chapter({
        toggle_text : this.app.get_text("previous_year_fisc"),
        target : this.container,
        add_toggle_section: true, 
        add_section_to_toggle : true
      });
      var data = _.chain(this_year_amounts)
          .map(function(value,key){
             return {
               name : this.gt(key),
               bottom_text : this.gt(key),
               value : value
             };
          },this)
          .value();
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : data
      })(chapter.graph_area());
    }


})();


