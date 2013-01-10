(function() {
    var APP = ns('APP');
    var TABLES = ns('TABLES');
    var GRAPHS = ns('GRAPHS');
    var MAPPERS = ns('MAPPERS');
    var LANG = ns('LANG');

    var ministry_total = function(depts,table){
        var lines = _.map(depts,
          function(dept){  //map function
            return dept['tables'][table];
          });
        // flatten all these lists into one big list
        return  _.flatten(_.compact(lines),true);
    }

    /************Data View********/
    APP.DetailsView = Backbone.View.extend({
      template : _.template($('#dataview_t').html())
      ,initialize: function(){
        _.bindAll(this);
        // retrieve passed in data
        this.app = this.options["app"];
        this.def = this.options["def"];

        this.drop_zone = this.app.$el.find('.table_content');
        this.mapper = this.def.mapper.en;
        this.key = this.def["id"];
        this.gt = this.app.get_text;
        this.state = this.app.state;
        this.dept = this.state.get("dept");
        this.lang = this.state.get("lang");
        this.data = this.dept['mapped_data'][this.key][this.lang];
        var other_orgs = this.state.get("other_orgs");
        // set some useful state based on these inputs
        var ministry_depts = other_orgs.concat([this.dept]);
        //collect ministry data
        var raw_min_data = ministry_total(ministry_depts,this.key);
        this.min_data = this.mapper.map(raw_min_data);
        //collect goc data
        //var raw_goc_data = window.depts['ZGOC']['tables'][this.key];
        //this.goc_data = this.mapper.map(raw_goc_data);
      }

      ,render: function(){
        this.drop_zone.children().remove();
        

        //this.app.$el.find('.table_title').html(this.def.title[this.lang]);
        // setup the dropdown menu of other departments
        // sort the departments by name

        // add the footnotes
        footnotes = [];
        //var footnotes = [];
        //if (_.has(window.footnotes,this.key)){
        //  footnotes = footnotes.concat(window.footnotes[this.key]);  
        //}
        //if (_.has(this.dept.footnotes, this.key)){
        //  footnotes = footnotes.concat(this.dept.footnotes[this.key]);  
        //}

        //if (this.data && this.data.length > 0){
          this.$el = $(this.template({
            "gt" : this.app.get_text,
            "key" : this.key,
            "min_tot" : this.app.state.get("min_tot"),
            "goc_tot" : this.app.state.get("goc_tot"),
            "footnotes" : footnotes.length !== 0
          }));

          this.setup_useful_this_links();

          // establish event listeners
          this.about_btn.on("click", this.on_about_click);
          this.min_total_btn.on( "click",this.on_min_tot_click); 
          this.goc_total_btn.on( "click",this.on_goc_tot_click); 
          this.back_btn.on("click",this.tear_down);

          // create the table view
          this.table_view = new this.def['table_view']({
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
          //if (_.has(GRAPHS.views,this.key)){
          //  // check if department is TBS and then remove the
          //  // central votes
          //  this.graph_view = new GRAPHS.views[this.key]({
          //    key : this.key,
          //    data : this.data,
          //    app : this.app,
          //    def : this.def,
          //    dept : this.dept,
          //    footnotes : []
          //  });
          //  this.graph_payload.append(this.graph_view.render().$el);
          //  this.$el.find('.nav-tabs a:last')
          //    .on("shown", this.graph_view.graph);

          //}
          //else {
          //  this.$el.find('.nav-tabs li:last').remove();
          //  this.$el.find('.graph_content').remove();
          //}
        //}

        //this.fnv = new footnoteView({
        //  app : this.app,
        //  footnotes : footnotes,
        //  btn : this.fn_btn
        //});
        //
        this.drop_zone.append(this.$el);

        return this;
      }
      ,tear_down : function(e){
         $('.panels').show(400);
         this.remove();
      }
      ,setup_useful_this_links : function() {

        this.table_payload = this.$el.find('.table_payload');
        this.graph_payload = this.$el.find('.graph_payload');

        this.back_btn = this.$el.find('button.back');
        this.about_btn = this.$el.find('button.about');
        this.details_btn = this.$el.find('button.details');
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
        //this.drop_zone.find('.nav-pills a:last').off("shown");
        //this.drop_zone.find('a,button,div').off("click");
        //this.drop_zone.find('div').off("jqplotDataClick");

        
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

        return this;
      }
    });

    /************APP VIEW***********/
    APP.appView = Backbone.View.extend({
      el : $('#app')
      ,initialize: function(){
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
        APP.dispatcher.trigger("app_ready",this);
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

  APP.dispatcher.on("app_ready", function(app){
    app.state.on("change:dept", function(state,org){
      // set state for all other depts in the current
      // ministry
      var lang = app.state.get("lang");
      var ministry_depts = APP.find_all_in_ministry(org,lang);
      var other_depts = _.filter(ministry_depts,
       function(dept) {return dept != org
       }); 
      state.set("other_orgs",other_depts);
    });
  });


})();
