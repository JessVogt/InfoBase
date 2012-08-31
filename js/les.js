(function() {
  $(function() {
    var APP,TABLES;
    APP = ns('APP');
    TABLES = ns('TABLES');
    LANG = ns('LANG');

    /************Auto Complete View********/
    switchLangView = Backbone.View.extend({
      template: _.template($("#lang_change_btn").html())
      ,initialize: function(){
        _.bindAll(this);
        this.state = this.options['state'];
        this.state.bind('change:lang', this.render);// re-render on change in language
        this.$el = $(this.template()).appendTo($('#navbar'));
      }
    ,render:function () {			
      if (this.state.get('lang') == 'en') { 
        this.$el.html('Français'); //change html of button element
      }
      else {
        this.$el.html('English');
      }
    return this;
    }
    }); 

    /************AUTOCOMPLETE VIEW***********/
    autocompleteView = Backbone.View.extend({
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
    })

    /************STATE MODEL********/
    stateModel = Backbone.Model.extend({});

    /************APP VIEW***********/
    appView = Backbone.View.extend({
      el:$('body')
      
      ,modal : $('.modal')

      ,template : _.template($('#main').html())

      ,nav_li_t : _.template($('#nav_li').html())

      ,table_item_t : _.template($('#table_item').html())

      ,initialize: function(){
        _.bindAll(this);
        //initialize models
        this.lookup = this.options['lookup'];
        this.state = new stateModel({})
        //initialize views
        this.switchLangv = new switchLangView({state: this.state});
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
    ,lang_change: function(model,attr){
      var gt = this.get_text;
      this.title.html(gt("title"));
      this.welcome.html(gt("welcome"));
      if (this.state.get('dept')){
        this.dept_change(this.state,this.state.get('dept'));
       }
    }
    ,set_lang: function(event){
      var lang = this.state.get('lang');
      this.state.set({lang: lang == 'en' ? 'fr' : 'en'});
    }
    ,dept_change : function(model,org){
      var lang = this.state.get('lang');

      this.app
        .html(this.template({
          txt: org['dept'][lang]   
        }));

      var nav_list = this.app.find('.nav-list');
      var main = this.app.find('.span9');

      _.each(_.keys(org['tables']).sort(),
             function(key){
                var def = les_tables[key];
                // add sidebar nav
                var new_el = $(this.nav_li_t({
                  href:key,
                  text:def['name'][lang],
                  tooltip:def['title'][lang]
                }));
                $('#sidebar').append(new_el);
                // add table
                new_el = $(this.table_item_t({
                  title:def['title'][lang],
                  href:key
                }));
                var new_table = this.add_table(key,def,org)
                $('.well', new_el).append(new_table);
                main.append(new_el);
             },this);
      $('#sidebar').affix({offset: -200});
      $('body').scrollspy('refresh');
    }
    ,add_table: function(key,table_def,org){
      var rows = org['tables'][key];
      var view = new TABLES.views[key]({
        rows:rows,
        key:key,
        state : this.state
      });
      return view.render().$el;
    }
    });
    APP.app = new appView({lookup:depts}); //INITIALIZE APP!
    APP.app.state.set({lang: 'en'});	
  });
})();
