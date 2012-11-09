(function() {
  $(function() {
    var APP = ns('APP');
    var TABLES = ns('TABLES');
    var GRAPHS = ns('GRAPHS');
    var MAPPERS = ns('MAPPERS');
    var LANG = ns('LANG');

    var ministry_total = function(ministry,lang,table){
      // find all departments with a ministry name, matching
      // the ministry AND that has data for the requested table
        var min = _.filter(window.depts,
            function(dept){
              return dept['min'][lang] == ministry && _.has(dept['tables'],table);
            });
        // extract all the table lines from these departments
        var lines = _.map(min,
          function(dept){  //map function
            return dept['tables'][table];
          });
        // flatten all these lists into one big list
        return  _.flatten(lines,true);
    }

    /************Auto Complete View********/
    var switchLangView = Backbone.View.extend({
      el : $("#lang_change")
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];
        this.state = this.app.state;
        this.state.bind('change:lang', this.render);// re-render on change in language
      }
    ,render:function () {			
      this.$el.html(this.app.get_text("lang"));
      return this;
    }
    }); 

    /************AUTOCOMPLETE VIEW***********/
    var autocompleteView = Backbone.View.extend({
      el : ('#type_ahead')
      ,initialize: function(){
        _.bindAll(this);
        this.state = this.options['state'];
        this.gt = this.options['app'].get_text;
        this.lookup = this.options['lookup'];
        this.state.bind('change:lang', this.render);// re-render on change in language
        //this.state.bind('change:lookup', this.render);// re-render on change in org_type change
        this.$el.typeahead({updater: this.updater});
      }
      ,render:function () {
         var lang = this.state.get('lang');
         var text = this.gt("search");
         // filter the departments to remove the GoC
         // data
         var values = _.filter(_.values(this.lookup),
           function(val){
             return val.accronym != 'ZGOC';
           });
         // look departments up by name
         var source = _.map(values, 
           function(x) {
             return  x['dept'][lang];
           });
         // look departments up by name
         source = source.concat( _.pluck(_.values(this.lookup), 'accronym'));
         this.$el.prop('placeholder',text);
         // use this method to reset the source
         this.$el.data('typeahead')['source'] = source;
         return this;
      }
      ,updater:function(val){
        var lang = this.state.get('lang');
        var dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == val}));
        // now search by accronym
        if (_.isUndefined(dept)){
            dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['accronym'] == val}));
        }
        this.state.set('dept',dept);
        return val;
      }
    });

    var fullDeptList = Backbone.View.extend({
      template : _.template($('#dept_list').html())
      ,initialize: function(){
        _.bindAll(this);
        this.state = this.options['state'];
        this.lookup = this.options['lookup'];
        this.app = $('#app');
        this.nav_bar_ul = $('#navbar_ul');
        $('#dept_sel').on("click",this.render);
        //ensure that if the language changes, this list
        //will redraw automatically
        this.state.bind("change:lang",this.lang_change);
      }
      ,lang_change : function(model,attr){
        if ($('body').find(".dept_menu").length >= 1) {
          this.render()
        }
      }
      ,render : function(){
        $('body').find(".dept_menu").remove();
        var lang = this.state.get('lang');
        var mins = _.groupBy(depts, function(x){return x['min'][lang]});
        // remove the empty GoC ministry
        if (lang == 'fr'){
          delete mins["Gouvernement du Canada"];
        }else {
          delete mins["Government of Canada"];
        }

        mins =  _.map(_.keys(mins).sort(),
          function(min){
             return _.sortBy(mins[min],
               function(dept){
                 return dept['dept'][lang]
               })
          });

        var cols = this.ministry_to_cols(mins);
        this.$el = $(this.template({cols: cols, lang:lang}));
        this.$el.find('a').on("click",this.onClick);
        $('body').append(this.$el);
        
      }
      // recursive function to assign the column layout
      // of the departments presented by ministry
      // assumes mins is in format of [ [dept1,dept2],[dept1,dept2,dept3],...
      ,ministry_to_cols : function(mins,cols){
        cols = cols || [[]];
        if (mins.length == 0){
          return cols;
        }
        if (_.last(cols).length == 0){
          _.last(cols).push(_.head(mins));
          return this.ministry_to_cols(_.tail(mins),cols);
        }
        else {
          if (_.flatten(_.last(cols),true).length + _.head(mins).length <= 28){
            _.last(cols).push(_.head(mins));
            return this.ministry_to_cols(_.tail(mins),cols);
          }
          else{
            return this.ministry_to_cols(mins,cols.concat([[]]));
          }
        }
      }
      ,onClick : function(event){
        var lang = this.state.get('lang');
        var dept = $(event.target).text();
        dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == dept}));
        this.state.unset("dept",{silent: true});
        $('body').find(".dept_menu").remove();
        this.state.set('dept',dept);
      }

    });

    APP.printView = Backbone.View.extend({
      template : _.template($('#print_view_t').html())
      ,initialize : function(){
        _.bindAll(this);
        this.state = this.options['state'];
        this.lang = this.state.get('lang');
        this.table = $(this.options['table']);
        this.table.attr('id','');
        this.render();
      }
      ,render : function(){
        var gt = APP.app.get_text;
        this.$el = $(this.template({
          close_text : gt('close'),
          print_text : gt('print'),
          help_text : gt('print_help')
        }));
        this.$el.
          find('.table_area')
          .append(this.table);
        this.$el
          .find('.print_view_close')
          .click(this.close);
        this.$el.
          find('.print_view_print')
          .click(this.print);

        APP.app.hide();

        $('body').append(this.$el);
        return this;
      }
      ,close : function(event){
        this.$el.remove();
        APP.app.show();
      }
      ,print : function(){
        this.$el
          .find('button')
          .hide();
        window.print();
        this.$el
          .find('button')
          .show();
        return false;
      }
    });

    var footnoteView = Backbone.View.extend({
      template : _.template($('#footnotes_t').html())
      ,initialize: function(){
        _.bindAll(this);
        // retrieve passed in data
        this.app = this.options["app"];
        this.footnotes = this.options['footnotes'];
        this.button = this.options['btn'];
        this.modal = this.options['modal']; 
        this.modal_header = this.options['modal_header'];
        this.modal_body = this.options['modal_body'];
        this.modal_footer = this.options['modal_footer'];
        // set some useful state based on these inputs
        this.lang = this.app.lang;
        this.button.on("click",this.render);
      }
      ,render : function () {
        var gt = this.app.get_text;
        var html = $(this.template({
          fns : this.footnotes,
          lang  : this.lang
        }));

        this.modal_header
          .html(gt("footnotes"));
        this.modal_body
          .html(html);
        this.modal_footer
          .html(gt("close"));
        this.modal.modal();
      }
    });

    /************Data View********/
    var dataView = Backbone.View.extend({
      template : _.template($('#dataview_t').html())
      ,initialize: function(){
        _.bindAll(this);
        // retrieve passed in data
        this.app = this.options["app"];
        this.key = this.options["key"];
        this.dept = this.options["dept"];
        this.drop_zone = this.options["drop_zone"];
        // set some useful state based on these inputs
        this.lang = this.app.lang;
        this.gt = this.app.get_text;
        this.def = les_tables[this.key];
        this.mapper = new MAPPERS.mapper(this.lang,this.def,this.key);
        this.raw_data = this.dept["tables"][this.key]
        this.data = this.mapper.map(this.raw_data);
        var raw_min_data = ministry_total(this.dept.min[this.lang],this.lang,this.key);
        this.min_data = this.mapper.map(raw_min_data);
        var raw_goc_data = window.depts['ZGOC']['tables'][this.key];
        this.goc_data = this.mapper.map(raw_goc_data);
      }
      ,render: function(){

        $('#app h4.title').html(this.def.title[this.lang]);

        // add the footnotes
        var footnotes = [];
        if (_.has(window.footnotes,this.key)){
          footnotes = footnotes.concat(window.footnotes[this.key]);  
        }
        if (_.has(this.dept.footnotes, this.key)){
          footnotes = footnotes.concat(this.dept.footnotes[this.key]);  
        }

        if (this.data && this.data.length > 0){
          this.$el = $(this.template({
            "gt" : this.app.get_text,
            "key" : this.key,
            "footnotes" : footnotes.length !== 0
          }));
          this.$el.find('.nav-tabs a:first').tab("show");

          this.setup_useful_this_links();

          this.about_btn.click(this.on_about_click);


          // create the table view
          this.table_view = new TABLES.views[this.key]({
            key : this.key,
            rows : this.data,
            min_data : this.min_data,
            goc_data : this.goc_data,
            app : this.app,
            def : this.def,
            print_btn : this.print_btn,
            details_btn : this.details_btn,
            copy_btn : this.copy_btn
          });
          this.table_payload.append(this.table_view.render().$el);
        

          // create the graph
          if (_.has(GRAPHS.views,this.key)){
            // check if department is TBS and then remove the
            // central votes
            this.graph_view = new GRAPHS.views[this.key]({
              key : this.key,
              data : this.data,
              app : this.app,
              def : this.def,
              dept : this.dept,
              footnotes : []
            });
            this.graph_payload.append(this.graph_view.render().$el);
            this.$el.find('.nav-tabs a:last')
              .on("shown", this.graph_view.graph);
          }
          else {
            this.$el.find('.nav-tabs li:last').remove();
            this.$el.find('.graph_content').remove();
          }
        }

        this.fnv = new footnoteView({
          app : this.app,
          footnotes : footnotes,
          btn : this.fn_btn,
          modal : this.modal,
          modal_body : this.modal_body,
          modal_footer : this.modal_footer,
          modal_header : this.modal_header
        });

        // activate the popovers
        $("button[rel=popover]",this.$el).popover({trigger: 'hover'});

        return this;
      }
      ,setup_useful_this_links : function() {
        this.modal = $("#modal_skeleton");
        this.modal_header = this.modal.find(".modal-header h3");
        this.modal_body = this.modal.find(".modal-body p");
        this.modal_footer = this.modal.find(".modal-footer a");

        this.tabs = this.$el.find('.tab-content');
        this.table_payload = this.tabs.find('.table_payload');
        this.graph_payload = this.tabs.find('.graph_payload');
        this.table_area = this.tabs.find('.table_content');
        this.graph_area = this.tabs.find('.graph_content');

        this.about_btn = this.$el.find('button.about');
        this.details_btn = this.$el.find('button.details');
        this.copy_btn = this.$el.find('button.copy');
        this.print_btn = this.$el.find('button.print');
        this.fn_btn = this.$el.find('button.fn');
      }
      ,on_about_click : function () {
        var gt = this.app.get_text;
        var help_key = "#" + this.key + "_help_" + this.lang;
        var help_text = $(help_key).html();
        this.modal_header
          .html(gt("about"));
        this.modal_body
          .html(help_text);
        this.modal_footer
          .html(gt("close"));
        this.modal.modal();
      }
      ,activate : function(){
        // unbind any events listeners which might be here
        this.drop_zone.find('.nav-pills a:last').off("shown");
        this.drop_zone.find('a').off("click");
        this.drop_zone.find('div').off("jqplotDataClick");

        this.drop_zone.children().remove();
        this.render();
        this.drop_zone.append(this.$el);
      }
    });

    /************Menu View********/
    var menuView = Backbone.View.extend({
      template : _.template($('#nav_li').html())
      ,initialize: function(){
        _.bindAll(this);
        // retrieve passed in data
        this.app = this.options["app"];
        this.key = this.options["key"];
        this.dept = this.options["dept"];
        this.drop_zone = this.options["drop_zone"];
        // set some useful state based on these inputs
        this.state = this.app.state;
        this.lang = this.state.get('lang');
        this.def = les_tables[this.key];
      }
      ,render: function(){
        this.$el =  $(this.template({
          key: this.key,
          text: this.def["name"][this.lang]
        })).on('click','a',this.on_click);
        return this;
      }
      , setup_dataView : function(){
        if (_.isUndefined(this.table_view)){
          this.data_view = new dataView(this.options);
          //this.data_view.render();
        }
      }
      ,on_click: function(){
        //$.cookie("table",this.key,{path:"les", expires: Infinity});
        this.state.set('table',this.key);
        this.setup_dataView();
        this.data_view.activate();
      }
    })


    /************STATE MODEL********/
    var stateModel = Backbone.Model.extend({});

    /************APP VIEW***********/
    var appView = Backbone.View.extend({
       el:$('body')
      ,template : _.template($('#main_t').html())
      ,menu_t : _.template($('#table_menu_t').html())
      ,initialize: function(){
        _.bindAll(this);
        this.lookup = this.options['lookup'];
        this.state = new stateModel({})
        //initialize views
        this.switchLangv = new switchLangView({app: this});
        this.switchLangv.$el.bind('click', this.set_lang) //lang chg => chg state: lang variable
        this.acv = new autocompleteView({
          app: this,
          state: this.state,
          lookup: this.lookup
        });
        this.full_dept_list = new fullDeptList({
          state: this.state,
          lookup: this.lookup
        });

        this.setup_useful_this_links();

        // check for a language or set the default of english
        this.state.bind("change:lang", this.lang_change);
        this.set_lang();

        // check for a saved department 
        this.state.bind("change:dept", this.dept_change);
      }
      ,setup_useful_this_links : function(){
        this.title = $('#title');
        this.dept_sel = $('#dept_sel');
        this.welcome = $('#welcome');
        this.nav_bar_ul = $('#navbar_ul');
        this.app = $('#app');
      }
      ,get_text : function(txt){
          return LANG.l(txt,this.state.get('lang'));
        }
      ,hide : function(){
        $('#app,.navbar').hide();
      }
      ,show : function(){
        $('#app,.navbar').show();
      }
      ,set_lang: function(){
        this.lang = this.state.get("lang") == "en" ? "fr" : "en";
        this.state.set({lang: this.lang});
      }
      ,lang_change: function(model,attr){
        // get faster reference 
        var gt = this.get_text;
        this.title.html(gt("title"));
        this.welcome.html(gt("welcome"));
        this.dept_sel.html(gt("select"))

        // if a department has already been picked
        // remake all the tables in the new language
        if (!_.isUndefined(this.state.get('dept'))){
          this.dept_change(this.state,this.state.get('dept'));
         }
      }
      ,loading_on : function(){
        this.app.html($('#loading_t').html());
      }
      ,loading_off : function(){
        this.app.html("");
      }
      ,dept_change : function(model,org){
        // check and see if the departmental drop down
        // is active
        this.app.html(this.template({
          txt: org['dept'][this.lang]   
        }));

        var main = this.app.find('.main');
        // remove any previous table menu
        this.nav_bar_ul.find('li#table_dropdown').remove();
        //add new, empty table list
        var new_table_menu = $(this.menu_t({
          get_text : this.get_text
        }));
        this.nav_bar_ul.append(new_table_menu);
        var menu_append_el = new_table_menu.find('.dropdown-menu');
        var keys = _.keys(org['tables']).sort() // _.uniq + .concat(_.keys(org['footnotes'])));
        _.each(keys,
               function(key){
                  // add sidebar nav
                  var mv = new menuView({
                        app : this,
                        key : key,
                        dept : org,
                        drop_zone : main
                  });
                  //mv.setup_dataView();
                  menu_append_el
                    .append(mv.render().$el);
               },this);
         new_table_menu.find('.dropdown-toggle').dropdown();
         //activate the first table
         var curent_table = this.state.get('table');
         // keys is already sorted
         var table_index = _.indexOf(keys,curent_table);
         table_index = table_index === -1 ? 1 : table_index+1;
         menu_append_el.find('li:nth-child('+table_index+') a').trigger("click");
         main.find('.nav-pills a:last').tab("show");
      }
    });
    APP.app = new appView({lookup:depts});
  });
})();
