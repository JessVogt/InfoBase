(function() {
    var APP = ns('APP');
    var TABLES = ns('TABLES');
    var GRAPHS = ns('GRAPHS');
    var MAPPERS = ns('MAPPERS');
    var LANG = ns('LANG');

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

    var OrgView = Backbone.View.extend({
      template : _.template($('#main_t').html())
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.state.on("change:dept", this.render);

      }
      ,render : function(model, org){
        var lang = this.state.get("lang");
        // render the main template
        this.app.app.html(this.template({
          org: org,   
          lang : lang,
          gt : this.app.get_text
        }));
        // set state for all other depts in the current
        // ministry
        var ministry_depts = APP.find_all_in_ministry(org,lang);
        var other_depts = _.filter(ministry_depts,
         function(dept) {return dept != org
         }); 
        this.state.set("other_depts",other_depts);

        return this;
      }
    });

    /************APP VIEW***********/
    APP.appView = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this);
        this.state = new APP.stateModel({})

        //initialize views
        sub_view_args = {app: this};
        this.switchLangv = new APP.switchLangView(sub_view_args);
        this.modal_view = new APP.modalView(sub_view_args);
        this.dept_info_view  = new APP.deptInfoView(sub_view_args);
        this.acv = new APP.autocompleteView(sub_view_args);
        this.full_dept_list = new APP.fullDeptList(sub_view_args);
        this.other_dept_dropdown = new APP.otherDeptsDropDown(sub_view_args);
        this.org_view = new OrgView(sub_view_args);

        this.setup_useful_this_links();
        // check for a language or set the default of english
        this.state.on("change:lang", this.render);
      }
      ,setup_useful_this_links : function(){
        this.title = $('#title');
        this.dept_sel = $('#dept_sel');
        this.welcome = $('#welcome');
        this.nav_bar_ul = $('#navbar_ul');
        this.app = $('#app');
      }
      ,formater : function(format,val){
        return APP.types_to_format[format](val,this.lang);
      }
      ,get_text : function(txt){
          return LANG.l(txt,this.state.get('lang'));
        }
      ,render: function(model,attr){
        // get faster reference 
        this.lang = attr;
        var gt = this.get_text;
        this.title.html(gt("title"));
        this.welcome.html(gt("welcome"));
        this.dept_sel.html(gt("select"))
        // if a department has already been picked
        // remake all the tables in the new language
        if (!_.isUndefined(this.state.get('dept'))){
          this.org_view.render(this.state,this.state.get('dept'));
         }
      }
    });
})();
