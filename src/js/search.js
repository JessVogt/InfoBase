(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');
    var TABLES = ns('TABLES');

    APP.searchOrg = Backbone.View.extend({
      events : {
        "click a.dept_sel_cancel" : "cancel",
        "click .org_list .sort_buttons a" : "sort"
      }
      ,initialize: function(){
        this.template = APP.t('#org_list_t')
        _.bindAll(this,"render","sort","cancel");
        this.app = this.options.app;
        this.container = this.options.container;
        this.state = this.app.state;
        this.lookup = depts;
        this.sort_func = 'min_sort';
      }
      ,add_search_button : function(){
        this.controller_button  = $('<a>')
          .addClass("clickable")
          .attr("href","#search");
        $('.nav_area').children().remove();
        $('.nav_area').append(this.controller_button);
         this.show();
      }
      ,cancel : function(){
        this.controller_button
         .html(this.app.get_text("to_select"))
         .addClass("dept_sel")
         .removeClass("dept_sel_cancel")
        //this.router.back();
      }
      , show : function(){
        this.controller_button =  $('a.dept_sel')
          .html(this.app.get_text("cancel"))
          .removeClass("dept_sel")
          .addClass("dept_sel_cancel");
      }
      ,render : function(){
        var lang = this.state.get('lang');
       
        // render the template and append to the container
        var el = $($.trim(this.template({
          depts : this[this.sort_func]['group_by'](lang,this)
        })));
        this.container.append(el);

        //activate listview
        el.find('ul.orgs').listview({
          autodividers:true,
          filter:true,
          autodividersSelector : this[this.sort_func]['dividers_func'](this),
          filterPlaceholder : this.app.get_text("search")
        });

        // add WCAG required label
        el.find('div.ui-input-search input')
          .attr("id","dept_search_filter")
          .before($('<label>')
                  .attr("for","dept_search_filter")
                  .addClass("wb-invisible")
                  .html(this.app.get_text("search")));

        // add the class
        // to the active button
        el.find('a[sort-func-name="'+this.sort_func+'"]')
          .addClass('button-accent');

        // focus the cursor on the cancel button
        //this.controller_button.focus();
      }
      ,min_sort : {
        group_by : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym != 'ZGOC';
          }),function(dept){
            return   [dept.min[lang],dept.dept[lang]];
          }); 
        }
       , dividers_func : function(app){
         return function(li){ 
            return $(li).attr("min");
          }
       }
      }                       
      ,alpha_sort : {
        group_by : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym != 'ZGOC';
          }),function(dept){
             return   dept.dept[lang];
          });
        }
        ,dividers_func : function(view){
          return function(li){ 
            return $(li).text()[0];
          }
        }
      }                       
      ,fin_size_sort : {
        group_by  : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym != 'ZGOC';
          }),function(dept){
             return  dept.fin_size
          }).reverse();
        }
        ,dividers_func : function(view){
          var app = view.app;
          return function(li){ 
            var fin_size =  parseFloat($(li).attr("fin-size"));
            var sizes = [ 10000000000,
                          7500000000,
                          5000000000,
                          2500000000,
                          1000000000,
                          500000000,
                          100000000,
                          50000000,
                          10000000];
            for (var i=0;i<sizes.length;i++){
              if (fin_size >= sizes[i]){
                return app.get_text("greater_than") +app.formater("big-int",sizes[i]);
              }
            }
            return  app.get_text("less_than") + app.formater("big-int",_.last(sizes));
          }
        }
      }                       
      ,sort : function(event){
        var btn = $(event.target);
        this.sort_func =  btn.attr("sort-func-name");
        this.render();
      }
    });

})();
