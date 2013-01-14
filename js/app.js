(function() {
    var APP = ns('APP');
    var LANG = ns('LANG');

    APP.dispatcher = _.clone(Backbone.Events)

    APP.types_to_format = {
      "percentage" :  function(val,lang){return $.formatNumber(val,
                                                  {format : "0%" ,locale : lang})},
      "big-int" :  function(val,lang){return $.formatNumber(val,
                                                  {format:"#,##0" , locale: lang})},
      "int" :  function(val,lang){return val},
      "str" : function(val,lang){return val},
      "wide-str" : function(val,lang){return val},
      "date" : function(val,lang){return val}
    }

    APP.find_all_in_ministry = function(dept,lang){
      // find all departments with a ministry name, matching
      // the ministry AND that has data for the requested table
      return _.filter(window.depts,
            function(d){
              return d['min'][lang] == dept['min'][lang];
      });
    }

    /************STATE MODEL********/
    APP.stateModel = Backbone.Model.extend({
      gsp : function(key){
        var promise = this.get(key);
        if (!promise){
          promise = $.Deferred();
          this.set(key, promise);
        }
        return promise;
      }
      ,rp : function(key,options){
        this.set(key, $.Deferred(),options);
      }
      ,sp: function(key,val){
        this.gsp(key).resolve(val);
        this.set("_"+key,val);
      }
    });

    APP.modalView = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];

        this.gt = this.app.get_text;
        this.state = this.app.state;
        this.modal = $("#modal_skeleton");
        this.header = this.modal.find(".modal-header h3");
        this.body = this.modal.find(".modal-body");
        this.footer = this.modal.find(".modal-footer a");
        this.modal.on("hidden",this.reset);
      }
      ,hide : function(){
        this.modal.modal("hide");
      }
      ,reset : function(){
        //clear out the body area
        this.body.find("*").off();
        this.body.children().remove(); 
        this.body.html("");
      }
      ,render : function(ob){
        this.reset();
        this.body.append(ob.body);
        this.header.html(ob.header);
        this.footer.html(ob.footer);
        this.modal.modal({
          keyboard: false
        });
         return this
      }
    });

    APP.autocompleteView = Backbone.View.extend({
      el : ('#type_ahead')
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.gt = this.options['app'].get_text;

        this.lookup = depts;
        this.state.on('change:lang', this.render);// re-render on change in language
        this.state.on('change:dept', this.clear);// re-render on change in language
        this.$el.typeahead({updater: this.updater});
      }
      ,clear : function(){
        var that = this;
        window.setTimeout(function(){
          that.$el.val('');
        },1);
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

    APP.fullDeptList = Backbone.View.extend({
      template : _.template($('#dept_list').html())
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options['app'];
        this.state = this.app.state;
        this.lookup = depts;
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

    APP.deptInfoView = Backbone.View.extend({
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

    APP.switchLangView = Backbone.View.extend({
      el : $("#lang_change")
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];
        this.state = this.app.state;
        this.state.off('change:lang', this.render);// re-render on change in language
        this.state.on('change:lang', this.render);// re-render on change in language
      }
      ,render:function () {			
        this.$el.off();
        this.$el.html(this.app.get_text("lang"));
        this.$el.on("click",this.set_lang);
        return this;
      }
      ,set_lang : function () {
        var new_lang = this.state.get("lang") == "en" ? "fr" : "en";
        this.state.set({lang: new_lang});
      }
    }); 

    APP.otherDeptsDropDown = Backbone.View.extend({
      template : _.template($('#nav_li').html())
      ,initialize: function(){
        _.bindAll(this);
        this.app = this.options["app"];
        this.state = this.app.state;
        this.state.on("change:other_depts",this.render);
      }
      ,render: function(){
        var dept = this.state.get('dept');
        var lang = this.state.get("lang");
        var other_depts = this.state.get("other_depts");
        var other_depts_list = $('#other_depts_list');
        // remove the previous entries
        other_depts_list.find('li a').parent().remove();
        if (other_depts.length > 0){
          _.each(_.sortBy(other_depts,
                function(d){return d.dept[lang]},
                this
                ),
                function(dept){
                    // create the link item with the
                    // department name
                    var nav = $( this.template({
                      text:dept.dept[lang]
                    }));
                    var self = this;
                    // set up the onclick for the link item
                    nav.on("click",
                      function(event){
                        other_depts_list.find("li").off();
                        self.app.state.set('dept',dept);
                    });
                  // append the link to the nav dropdown
                  // item
                  other_depts_list.append(nav);
                },
                this
          );
        }
        else {
          other_depts_list.parent().remove();
        }
      }
    });

})();
