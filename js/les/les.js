(function() {
  $(function() {
    var APP = ns('APP');
    var TABLES = ns('TABLES');
    var GRAPHS = ns('GRAPHS');
    var MAPPERS = ns('MAPPERS');
    var LANG = ns('LANG');

    APP.types_to_format = {
      "percentage" :  function(val,lang){return $.formatNumber(val,
                                                  {format : "0%" ,locale : lang})},
      "float" :  function(val,lang){return $.formatNumber(val,
                                                  {format:"#,##0" , locale: lang})},
      "int" :  function(val,lang){return val},
      "str" : function(val,lang){return val},
      "wide-str" : function(val,lang){return val},
      "date" : function(val,lang){return val}
    }


    APP.find_all_in_ministry = function(dept,lang,table){
      // find all departments with a ministry name, matching
      // the ministry AND that has data for the requested table
      return _.filter(window.depts,
            function(d){
              return d['min'][lang] == dept['min'][lang] && _.has(dept['tables'],table);
            });
    }

    var ministry_total = function(depts,table){
        var lines = _.map(depts,
          function(dept){  //map function
            return dept['tables'][table];
          });
        // flatten all these lists into one big list
        return  _.flatten(_.compact(lines),true);
    }

    /************Auto Complete View********/
    var switchLangView = Backbone.View.extend({
      el : $("#lang_change")
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];
        this.state = this.app.state;
        this.state.off('change:lang', this.render);// re-render on change in language
        this.state.on('change:lang', this.render);// re-render on change in language
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
        this.state.on('change:lang', this.render);// re-render on change in language
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
        this.state.on("change:lang",this.lang_change);
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
        this.$el.find('a').off("click",this.onClick);
        var lang = this.state.get('lang');
        var dept = $(event.target).text();
        dept = _.first(_.filter(_.values(this.lookup),
              function(x){ return x['dept'][lang] == dept}));
        this.state.unset("dept",{silent: true});
        $('body').find(".dept_menu").remove();
        this.state.off("change:lang",this.lang_change);
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

        this.app.modal_view.render({
          body : html,
          header : gt("footnotes"),
          footer : gt("close")
        });
      }
    });

    /************Data View********/
    var dataView = Backbone.View.extend({
      template : _.template($('#dataview_t').html())
      ,nav_li : _.template($('#nav_li').html())
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
    
        //collect ministry data
        var ministry_depts = APP.find_all_in_ministry(this.dept,this.lang,this.key);
        this.other_depts = _.filter(ministry_depts,
         function(dept) {return dept != this.dept},
         this); 
        var raw_min_data = ministry_total(ministry_depts,this.key);
        this.min_data = this.mapper.map(raw_min_data);
        //collect goc data
        var raw_goc_data = window.depts['ZGOC']['tables'][this.key];
        this.goc_data = this.mapper.map(raw_goc_data);
      }
      ,render: function(){
        var self = this;

        $('#app .table_title').html(this.def.title[this.lang]);
        // setup the dropdown menu of other departments
        // sort the departments by name
        this.other_depts_list = $('#other_depts_list');
        // remove the previous entries
        this.other_depts_list.find('li a').parent().remove();
        if (this.other_depts.length > 0){
          _.each(_.sortBy(this.other_depts,
                function(d){return d.dept[this.lang]},
                this
                ),
                function(dept){
                    // create the link item with the
                    // department name
                    var nav = $( this.nav_li({
                      text:dept.dept[this.lang]
                    }));
                    var self = this;
                    // set up the onclick for the link item
                    nav.on("click",
                      function(event){
                        self.app.state.set('dept',dept);
                    });
                  // append the link to the nav dropdown
                  // item
                  this.other_depts_list.append(nav);
                },
                this
          );
        }
        else {
          this.other_depts_list.parent().remove();
        }

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
            "min_tot" : this.app.state.get("min_tot"),
            "goc_tot" : this.app.state.get("goc_tot"),
            "footnotes" : footnotes.length !== 0
          }));

          this.setup_useful_this_links();

          // establish event listeners
          this.about_btn.on("click",this.on_about_click);
          this.min_total_btn.on("click",this,this.on_min_tot_click);
          this.goc_total_btn.on("click",this,this.on_goc_tot_click);

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
            copy_btn : this.copy_btn,
            mapper : this.mapper
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
          btn : this.fn_btn
        });

        // active the tabs and set up functionality to save
        // the currently open tab and also check if one 
        // is already saved and set the current tab to the 
        // one saved in the state
        var tabs_a = this.$el.find('.nav-tabs a')
        tabs_a.off("shown",this.on_tab_show);
        tabs_a.on("shown",this.on_tab_show);

        window.setTimeout(function(){
          var tab_index = self.app.state.get('current_tab');
          var tab = tabs_a[tab_index];
          if (tab) {
            $(tab).tab("show");
          } else {
            self.$el.find('.nav-tabs a:first').tab("show");
          }
        },1);

        return this;
      }
      ,on_tab_show : function(e){
        var tabs_a = this.$el.find('.nav-tabs a');
        this.app.state.set("current_tab",
                            tabs_a.index(e.currentTarget));
      }
      ,setup_useful_this_links : function() {

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
        this.min_total_btn = this.$el.find('button.min_tot');
        this.goc_total_btn = this.$el.find('button.goc_tot');
      }
      ,on_about_click : function (e) {
        var gt = this.app.get_text;
        var help_key = "#" + this.key + "_help_" + this.lang;
        var help_text = $(help_key).html();
        this.app.modal_view.render({
          body : help_text,
          header : gt("about"),
          footer : gt("close")
        });
      }
      ,on_min_tot_click : function (e) {
        var view = e.data;
        view.app.state.set("min_tot",
                        !$(e.target).hasClass("active"));
      }
      ,on_goc_tot_click : function (e) {
        var view = e.data;
        view.app.state.set("goc_tot",
                        !$(e.target).hasClass("active"));
      }
      ,activate : function(){
        // unbind any events listeners which might be here
        this.drop_zone.find('.nav-pills a:last').off("shown");
        this.drop_zone.find('a,button,div').off("click");
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

    var deptInfoView = Backbone.View.extend({
      template : _.template($('#dept_info_t').html())
      ,initialize: function(){
        _.bindAll(this);
        // retrieve passed in data
        this.app = this.options["app"];

        this.gt = this.app.get_text;
        this.state = this.app.state;
        this.state.on("change:dept",this.setup);
      }
      ,render : function(){
        var dept = this.state.get("dept");
        var lang = this.state.get('lang');

        body = $(this.template({
          lang : lang,
          gt : this.gt,
          dept: dept
        }));

        this.search_box = body.find('input.site-search');
        this.search_button = body.find('a.site-search');
        this.search_button.on("click",this.on_search);

        this.app.modal_view.render({
          body: body,
          header : "Info",
          footer : this.gt("close") 
        });

      }
      ,on_search : function(e){
        var dept = this.state.get("dept");
        var site = 'site:'+ dept['website']['en'].split("/")[0].replace("http://","");
        var q = 'q='+encodeURI(this.search_box.val()) + "+"+site;
        window.open("http://www.google.com/search?"+q); 
      }
    });

    var modalView = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];

        this.gt = this.app.get_text;
        this.state = this.app.state;
        this.modal = $("#modal_skeleton");
        this.header = this.modal.find(".modal-header h3");
        this.body = this.modal.find(".modal-body");
        this.footer = this.modal.find(".modal-footer a");
      }
      ,hide : function(){
        this.modal.modal("hide");
      }
      ,render : function(ob){
        //clear out the body area
        this.body.find("*").off();
        this.body.children().remove(); 
        this.body.html("");

        this.body.append(ob.body);
        this.header.html(ob.header);
        this.footer.html(ob.footer);
        this.modal.modal("show");
         return this
      }
    });

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
        this.modal_view = new modalView({app:this});
        this.dept_info_view  = new deptInfoView({app:this});

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
      ,formater : function(format,val){
          return APP.types_to_format[format](val,this.lang);
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
          txt: org['dept'][this.lang],   
          gt : this.get_text
        }));

        this.app.find('.dept_name').on("hover", this, function(e){
          $(e.currentTarget).toggleClass("text-info");
        }).on("click",this.dept_info_view.render);

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

      }
    });
    APP.app = new appView({lookup:depts});
  });
})();
