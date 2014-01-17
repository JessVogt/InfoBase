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
      if (!is_mobile){
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
      }
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
      this.gov_auth();
      this.estimates_split();
      this.vote_stat_spend();

      this.gov_type_spend();
      this.gov_spend();
      this.gov_spend_change();
      //this.top_3_stat_spend();
      //this.top_3_vote_spend();
      //this.so_spend();

      center_text(container);
    };

    var p = _gov_story.prototype;

    p.register_for_open  = function(chapter){
      chapter.dispatch.on("toggle",function(state){
         if (state === 'open'){
            center_text($(chapter.toggle_area().node()));
         }
      });
    }

    p.data_prep = function(){
      var t = this.t,
          q = this.q,
          app = this.app,
          compact = this.compact,
          written = function(x){return app.formater("compact_writen",x);},
          qfr_difference = q.table8.qfr_difference();
          
      this.data =  {
        this_year_auth : q.table8.sum("total_net_auth"),
        
        last_year_gov_auth :  q.table4.sum('{{last_year}}auth'),
        last_year_2_gov_auth : q.table4.sum('{{last_year_2}}auth'),
        last_year_3_gov_auth : q.table4.sum('{{last_year_3}}auth'),

        this_year_gov_stat_voted :  t.table8.voted_stat("total_net_auth",false), 
        last_year_gov_stat_voted : t.table4.voted_stat('{{last_year}}auth',false), 
        last_year_2_gov_stat_voted :  t.table4.voted_stat('{{last_year_2}}auth',false), 
        last_year_3_gov_stat_voted : t.table4.voted_stat('{{last_year_2}}auth',false), 


        this_year_gov_type_spend :  t.table2.spending_type("plannedexp",false), 
        last_year_gov_type_spend :   t.table5.spending_type("{{last_year}}",false), 
        last_year_2_gov_type_spend : t.table5.spending_type("{{last_year_2}}",false), 
        last_year_3_gov_type_spend : t.table5.spending_type("{{last_year_3}}",false), 

        estimates_split : q.table8.estimates_split({filter_zeros : true, as_tuple : true}),

        auth_change: q.table1.auth_change(false)[2],
        spend_change : q.table1.exp_change(false)[2],

        this_year_qfr_auth :  q.table1.sum("thisyearauthorities"),
        this_year_qfr_spend :  q.table1.sum("thisyearexpenditures"),
        last_year_qfr_auth :  q.table1.sum("lastyearauthorities"),
        last_year_qfr_spend : q.table1.sum("lastyearexpenditures")

      };
      this.data.this_year_gov_type_spend['crown'] = qfr_difference['crown'];
      this.data.this_year_gov_type_spend['op'] += qfr_difference['op'];

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
      this.written_data.auth_change = this.compact_data.auth_change = this.percent(this.data.auth_change);
      this.written_data.spend_change = this.compact_data.spend_change = this.percent(this.data.spend_change);
      _.each(this.data.estimates_split,function(name_val,i){
        this.written_data.estimates_split[i][0] = this.compact_data.estimates_split[i][0] = name_val[0];
      },this);
    }

    p.gov_auth = function(){
      var d = this.data,
          text = this.app.get_text("this_year_auth");

      var chapter = new STORY.chapter({
        add_toggle_section: true, 
        toggles :[ {
          toggle_text : this.app.get_text("previous_year_fisc")
        }],
        target : this.container
      });

      PACK.simple_circle_chart({
        height : height*1.5,
        formater : this.compact,
        data : [
          {value: d.this_year_auth}
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
       series :  {'': _.pluck(this.data.estimates_split,1) },
       ticks : _.pluck(this.data.estimates_split,0),
       add_xaxis : true,
       x_axis_line : false,
       add_labels : true,
       html_ticks : true,
       margin : {top: 20, right: 20, left: 20, bottom: 60},
       label_formater : compact
     })(chapter.graph_area());

    };

    p.gov_type_spend = function(){
      var text = this.app.get_text("gov_type_spending"),
          compact = this.compact,
          d = this.data,
          cd = this.compact_data,
          wd = this.written_data,
          label_mapping = {},
          // add in the labels to the data
          data = _.chain(this.data.this_year_gov_type_spend)
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
             }],
             target : this.container
          }),
          headers = [['','($ B)']];
      this.register_for_open(chapter);

      //add the text 
      chapter.text_area().html(Handlebars.compile(text)(this.written_data));
      // add the table
      T.prepare_data({
        rows : data,
        headers : headers,
        row_class : ['left_text','right_number']
      });
      T.d3_build_table({
        node : chapter.text_area().node(),
        headers : headers,
        rows : data
      });

      // create the pack chart for this year and add to the graph area
      var pack_chart = PACK.pack({
        width : height*1.7,
        formater : this.compact,
        top_font_size : 14,
        data : packing_data,
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
          .data(d3.keys(label_mapping))
          .enter()
          .append("li")
          .append("a")
          .html(function(d){return d;})
          .on("click", function(d){on_label_click(d)});

      //create the graph
      var on_label_click = function(label){
          graph_div.selectAll("*").remove();
          // look the key back up
          var key = label_mapping[label];
          var years = [ T.m("{{last_year_3}}"), T.m("{{last_year_2}}"), T.m("{{last_year}}") ];
          var data = [
            d.last_year_3_gov_type_spend[key],
            d.last_year_2_gov_type_spend[key],
            d.last_year_gov_type_spend[key]
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
      };

      // select the first item in the list
      on_label_click(d3.keys(label_mapping)[0]);
    }

    p.vote_stat_spend = function(){
      var text = this.gt("gov_vote_stat_spending"),
          d = this.data;
      // create the chapter
      var chapter = new STORY.chapter({
        toggles : [ {toggle_text : this.app.get_text("previous_year_fisc") } ] ,
        target : this.container
      });
      // setup the main chart
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
            {name: 'x', value:d.this_year_gov_stat_voted.stat, bottom_text : this.gt("stat") },
            {name: 'y', value:d.this_year_gov_stat_voted.voted, bottom_text :this.gt("voted") }
        ]
      })(chapter.graph_area());
      //setup the text area
      chapter.text_area().html(T.m(text, this.written_data));

      // setup the toggle area
      PACK.simple_circle_chart({
        height : height*1.10,
        formater : this.compact,
        colors : function(x){ return D3.tbs_color(Math.floor(x/3));},
        data : [
          {name : 'z',value: d.last_year_3_gov_stat_voted.stat, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: d.last_year_2_gov_stat_voted.stat, bottom_text : T.m('{{last_year_2}}'), top_text: this.gt("stat")},
          {name : 'x',value:  d.last_year_gov_stat_voted.stat, bottom_text : T.m('{{last_year}}')} ,
          {name : 'a',value: d.last_year_3_gov_stat_voted.voted, bottom_text : T.m('{{last_year_3}}')},
          {name : 'b',value: d.last_year_2_gov_stat_voted.voted, bottom_text : T.m('{{last_year_2}}'),top_text: this.gt("voted")},
          {name : 'c',value:  d.last_year_gov_stat_voted.voted, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

    }

    p.gov_spend = function(){
      var text = this.gt("this_year_qfr_spend"),
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
          {name: 'x', value : d.this_year_qfr_auth},
          {name: 'y', value : d.this_year_qfr_spend}
        ],
        formater : this.compact,
        height : height,
      })(chapter.graph_area());

      PACK.circle_pie_chart({
        data : [
          {name: 'x', value : d.last_year_qfr_auth},
          {name: 'y', value : d.last_year_qfr_spend }
        ],
        formater : this.compact,
        height : height,
      })(chapter.toggle_area());



    }

    p.gov_spend_change = function(){
      var text = this.gt("this_year_qfr_spend_change"),
          d = this.data;

      // create the chapter
      var chapter = new STORY.chapter({
        target : this.container
      });
      chapter.text_area().html(T.m(text, this.written_data));

     D3.arrows({
       data : [
        {value: d.auth_change, name : this.gt("authorities")},
        {value: d.spend_change, name : this.gt("expenditures")},
       ],
       formater : this.percent,
       height : height,
     })(chapter.graph_area());

    }

    p.top_3_stat_spend = function(){

    };
    p.top_3_vote_spend = function(){

    };
    p.so_spend = function(){

    };

})();


