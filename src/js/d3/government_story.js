(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var STORY = ns('D3.STORY');
    var PACK = ns('D3.PACK');
    var BAR = ns('D3.BAR');

    var height = 250;



    center_text = function(container){
      _.delay(function(){
         container.find(".text").each(function(){
           var that = $(this);
           var my_height = that.height();
           var sibling_height = that.siblings(".graphic").height();
           var height = Math.max(my_height, sibling_height);
           that.height(height);
           that.find(".inner")
           .css({
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
      this.compact = function(x){return app.formater("compact",x);};
      this.percent = function(x){return app.formater("percent",x);};
      this.writen = function(x){return app.formater("compact_writen",x);};

      // quick access to all tables
      this.t = _.chain(T.tables)
        .map(function(x){ return [x.id, x];})
        .object()
        .value();

      this.gov_spend();
      this.gov_type_spend();
      this.vote_stat_spend();
      center_text(container);
    };

    var p = _gov_story.prototype;

    p.gov_spend = function(){
      var this_year_table = this.t.table1.GOC[0];
      var last_year_table = this.t.table4.GOC[0];
      var text = this.gt("this_year_gov_spending");
      var amount =  this_year_table.thisyearauthorities;
      var last_year_amount = last_year_table['{{last_year}}auth'];
      var last_year_2_amount =  last_year_table['{{last_year_2}}auth'];
      var last_year_3_amount = last_year_table['{{last_year_3}}auth'];

      this.calculated_values.this_year_total = amount;
      
      var chapter = new STORY.chapter({
        add_toggle_section: true, 
        toggle_text : this.app.get_text("previous_year_fisc"),
        target : this.container
      });

      PACK.simple_circle_chart({
        height : height*1.5,
        formater : this.compact,
        data : [
          {value: amount}
        ]
      })(chapter.graph_area());
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {name : 'z',value: last_year_3_amount, bottom_text : T.m('{{last_year_3}}')},
          {name : 'y',value: last_year_2_amount, bottom_text : T.m('{{last_year_2}}')},
          {name : 'x',value: last_year_amount, bottom_text : T.m('{{last_year}}')}
        ]
      })(chapter.toggle_area());

      chapter.text_area().html(T.m(text, {total:this.writen(amount)}));

    };

    p.gov_type_spend = function(){
      // get the data
      var this_year_table = this.t.table2;
      var last_year_table = this.t.table5;
      var text = this.gt("gov_type_spending");
      var this_year_amounts = this_year_table.spending_type("plannedexp",false);
      // hold on to these values
      _.extend(this.calculated_values, this_year_amounts);
      // format the amounts
      var formated_amounts = _.chain(this.calculated_values)
        .map(function(val, key){
          return [key, this.writen(val)]
        },this)
        .object()
        .value();
      var data = {
        name : '',
        children : _.chain(this_year_amounts)
          .map(function(value,key){
             return {
               children : null,
               name : this.gt(key+"_spend_type") + " (" + this.compact(value)+")",
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

      //add the text 
      chapter.text_area().html(Handlebars.compile(text)(formated_amounts));
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

      //create the graph

    }

    p.vote_stat_spend = function(){
      // get the data
      var this_year_table = this.t.table1;
      var last_year_table = this.t.table4;
      var text = this.gt("gov_vote_stat_spending");
      var this_year_amounts = this_year_table.voted_stat("thisyearauthorities",false);
      // hold on to these values
      _.extend(this.calculated_values, this_year_amounts);
      // format the amounts
      var formated_amounts = _.chain(this.calculated_values)
        .map(function(val, key){
          return [key, this.writen(val)]
        },this)
        .object()
        .value();
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

    p.auth_split = function(){
      // get the data
      var this_year_table = this.t.table1;
      var last_year_table = this.t.table4;
      var text = this.gt("gov_vote_stat_spending");
      var this_year_amounts = this_year_table.voted_stat("thisyearauthorities",false);
      // hold on to these values
      _.extend(this.calculated_values, this_year_amounts);
      // format the amounts
      var formated_amounts = _.chain(this.calculated_values)
        .map(function(val, key){
          return [key, this.writen(val)]
        },this)
        .object()
        .value();
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


