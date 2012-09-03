(function() {
  $(function() {
    var APP = ns('APP');
    var TABLES = ns('TABLES');
    var LANG = ns('LANG');

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
      ,text : {
        en: 'Department Search',
        fr: 'Chereche ministére'}
    ,initialize: function(){
      _.bindAll(this);
      this.state = this.options['state'];
      this.lookup = this.options['lookup'];
      this.state.bind('change:lang', this.render);// re-render on change in language
      this.state.bind('change:lookup', this.render);// re-render on change in org_type change
      this.$el.typeahead({updater: this.updater});
    }
    ,render:function () {
      var lang = this.state.get('lang');
      var text = this.text[lang];
      var source = _.map(_.values(this.lookup), 
        function(x) {
          return  x['dept'][lang];
        });
      this.$el.prop('placeholder',text);
      this.$el.data('typeahead')['source'] = source;

      return this;
    }
    ,updater:function(val){
      var lang = this.state.get('lang');
      dept = _.first(_.filter(_.values(this.lookup),
            function(x){ return x['dept'][lang] == val}));
      this.state.set('dept',dept);
      return val;
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
        this.def = les_tables[this.key];
        this.data = this.dept["tables"][this.key];
      }
      ,render: function(){

        this.$el = $(this.template({
          "gt" : this.app.get_text,
          "key" : this.key,
          "title" : this.def['title'][this.lang]
        }));
        this.$el.find('.nav-pills a:first').tab("show");

        this.setup_useful_this_links();
        this.about_btn.click(this.on_about_click);
        this.table_view = new TABLES.views[this.key]({
          key : this.key,
          rows : this.data,
          app : this.app,
          def : this.def,
          print_btn : this.print_btn,
          details_btn : this.details_btn,
          copy_btn : this.copy_btn,
          fs_btn : this.fs_btn
        });
        this.table_payload.append(this.table_view.render().$el);

        return this;
      }
      ,setup_useful_this_links : function() {
        this.modal = $("#modal_skeleton");
        this.modal_header = this.modal.find(".modal-header h3");
        this.modal_body = this.modal.find(".modal-body p");
        this.modal_footer = this.modal.find(".modal-footer a");

        this.table_payload = this.$el.find('.table_payload');
        this.graph_payload = this.$el.find('.graph_payload');

        this.about_btn = this.$el.find('button.about');
        this.details_btn = this.$el.find('button.details');
        this.fs_btn = this.$el.find('button.full_screen');
        this.copy_btn = this.$el.find('button.copy');
        this.print_btn = this.$el.find('button.print');
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
        this.drop_zone.children().detach();
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
      ,on_click: function(){
        var self = this;
        window.setTimeout(function(){
          self._on_click()},100);
      }
      , setup_dataView : function(){
        if (_.isUndefined(this.table_view)){
          this.data_view = new dataView(this.options);
          this.data_view.render();
        }
      }
      ,_on_click: function(){
        this.setup_dataView();
        this.data_view.activate();
      }
    })
    /************STATE MODEL********/
    var stateModel = Backbone.Model.extend({});

    /************APP VIEW***********/
    var appView = Backbone.View.extend({
       el:$('body')
      ,modal : $('.modal')
      ,template : _.template($('#main_t').html())
      ,menu_t : _.template($('#table_menu_t').html())
      ,initialize: function(){
        _.bindAll(this);
        this.lookup = this.options['lookup'];
        this.state = new stateModel({})
        //initialize views
        this.switchLangv = new switchLangView({app: this});
        this.switchLangv.$el.bind('click', this.set_lang) //lang chg => chg state: lang variable
        //// this.DMenu = new deptView({state: this.state});
        this.acv = new autocompleteView({
          state: this.state,
          lookup: this.lookup
        });
        this.state.bind("change:lang", this.lang_change);
        this.state.bind("change:dept", this.dept_change);

        this.setup_useful_this_links();
    }
    ,setup_useful_this_links : function(){
      this.title = $('#title');
      this.welcome = $('#welcome');
      this.nav_bar_ul = $('#navbar_ul');
      this.app = $('#app');

      this.modal = $("#loading_modal");
      this.modal_body = this.modal.find(".modal-body p");
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
    ,lang_change: function(model,attr){
      var gt = this.get_text;
      this.title.html(gt("title"));
      this.welcome.html(gt("welcome"));
      // if a department has already been picked
      // remake all the tables in the new language
      if (this.state.get('dept')){
        this.dept_change(this.state,this.state.get('dept'));
       }
    }
    ,set_lang: function(){
      this.lang = this.state.get("lang") == "en" ? "fr" : "en";
      this.state.set({lang: this.lang});
    }
    ,dept_change : function(model,org){
      var self = this;
      window.setTimeout(function(){
        self._dept_change(model,org)},1);
    }
    ,loading_on : function(){
      this.app.html($('#loading_t').html());
    }
    ,loading_off : function(){
      this.app.html("");
    }
    ,_dept_change : function(model,org){

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

      var loading = $('<p>Loading...</p>');
      main.append(loading);

      _.each(_.keys(org['tables']).sort(),
             function(key){
                // add sidebar nav
                var mv = new menuView({
                      app : this,
                      key : key,
                      dept : org,
                      drop_zone : main
                });
                mv.setup_dataView();
                menu_append_el
                  .append(mv.render().$el);
             },this);
      loading.remove();
       new_table_menu.find('.dropdown-toggle').dropdown();
       //activate the first table
       menu_append_el.find('li:first a').trigger("click");
    }
    });
    APP.app = new appView({lookup:depts});
    APP.app.set_lang();	
  });
})();
