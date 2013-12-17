(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var D3 = ns('D3');
    var STORY = ns('D3.STORY');
    var PACK = ns('D3.PACK');
    var BAR = ns('D3.BAR');
    var PACK = ns('D3.PACK');

    var height = 250;

    STORY.gov_story =  function(container,app){
      return new _gov_story(container,app);
    };

    _gov_story = function(container,app){
      this.container = d3.select(container[0]);
      this.app = app;
      this.gt = app.get_text;
      this.lang = app.lang;
      // set the formaters
      this.compact = function(x){return app.formater("compact",x);};
      this.percent = function(x){return app.formater("percent",x);};
      this.writen = function(x){return app.formater("compact_writen",x);};

      // quick access to all tables
      this.t = _.chain(T.tables)
        .map(function(x){ return [x.id, x]})
        .object()
        .value();

      this.gov_spend();
      this.gov_type_spend();
    };

    var p = _gov_story.prototype;

    p.gov_spend = function(){
      var this_year_table = this.t['table1'].GOC[0];
      var last_year_table = this.t['table4'].GOC[0];
      var text = this.gt("this_year_gov_spending");
      var amount =  this_year_table.thisyearauthorities;
      var last_year_amount = last_year_table['{{last_year}}auth'];
      var last_year_2_amount =  last_year_table['{{last_year_2}}auth'];
      var last_year_3_amount = last_year_table['{{last_year_3}}auth'];
      
      var chapter = new STORY.chapter(this.app, {
        history: true, 
        target : this.container
      });

      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {value: amount}
        ]
      })(chapter.graph_area());
      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {name : 'x',value: last_year_amount, bottom_text : T.m('{{last_year}}')},
          {name : 'y',value: last_year_2_amount, bottom_text : T.m('{{last_year_2}}')},
          {name : 'z',value: last_year_3_amount, bottom_text : T.m('{{last_year_3}}')}
        ]
      })(chapter.history_area());

      chapter.text_area().html(T.m(text, {total:this.writen(amount)}));

    };

    p.gov_type_spend = function(){
      var this_year_table = this.t['table2'];
      var last_year_table = this.t['table5'];
      var text = this.gt("gov_type_spending");
      var chapter = new STORY.chapter(this.app, {
        history: true, 
        target : this.container
      });
      var this_year_amounts = this_year_table.spending_type("plannedexp",false);
      var data = {
        name : '',
        children : _.chain(this_year_amounts)
          .map(function(value,key){
            console.log(key)
             return {
               children : null,
               name : this.gt(key),
               value : value
             };
          },this)
          .value()
      };
      debugger

      PACK.simple_circle_chart({
        height : height,
        formater : this.compact,
        data : [
          {value: amount}
        ]
      })(chapter.graph_area());

    }

})();


