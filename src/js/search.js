(function() {
    var APP = ns('APP');

    // add the #search route
    APP.add_container_route("search","search",function(container){
      this.add_crumbs([this.home_crumb,{html: this.gt("search")}]);
      this.add_title("search");
      if (!this.app.full_org_list){
        this.app.full_org_list = new searchOrg({ app: this.app, container : $(container)});
        this.app.full_org_list.render();
      }
    });

    var searchOrg = Backbone.View.extend({
      events : {
        "click a.dept_sel_cancel" : "cancel",
        "click .org_list .sort_buttons a" : "sort"
      },
      initialize: function(){
        // Was never called! debugger;
        this.template = APP.t('#org_list_t');
      _.bindAll(this,"render");
        this.app = this.options.app;
        this.container = this.options.container;
        this.state = this.app.state;
        this.lookup = depts;
        this.sort_func = 'min_sort';

        var lang = this.state.get('lang');

        var suggestionsArray = _.map(window.depts,function(obj){
          return obj.dept[lang];
        });

        this.obtainer = function(query,cb){
		        var filteredList = $.grep(suggestionsArray,function(item,index){
			           return item.match(query);
		    });

		      var mapped = $.map(filteredList,function(item){return {value:item}; });
		      cb(mapped);
	      };


      },
      render : function(){
        var lang = this.state.get('lang');

        var temp = structureMinistries(lang);
        // render the template and append to the container
        //old arg: { depts : this[this.sort_func].group_by(lang,this)  }
        var el = $($.trim(this.template(
            temp
          )));
        this.container.append(el);

        $('#auto-complete').typeahead({
      		hint:true,
      		highlight:true,
      		minLength:1
      		},{
      		name:'noname',
      		displayKey:'value',
      		source:this.obtainer
    	});

      },
      min_sort : {
        group_by : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym !== 'ZGOC';
          }),function(dept){
            return   [dept.min[lang],dept.dept[lang]];
          });
        },
        dividers_func : function(app){
         return function(li){
            return $(li).attr("min");
          };
       }
      },
      alpha_sort : {
        group_by : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym !== 'ZGOC';
          }),function(dept){
             return   dept.dept[lang];
          });
        },
        dividers_func : function(view){
          return function(li){
            return $(li).text()[0];
          };
        }
      },
      fin_size_sort : {
        group_by  : function(lang,view){
          return _.sortBy(_.filter(_.values(depts),function(dept){
            return dept.accronym !== 'ZGOC';
          }),function(dept){
             return  dept.fin_size;
          }).reverse();
        },
        dividers_func : function(view){
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
          };
        }
      },
      sort : function(event){
        var btn = $(event.target);
        this.sort_func =  btn.attr("sort-func-name");
        this.render();
      }

    });

    //Returns a nested object identical to window.mins, but has an extra property for the ministry's name in language of choice.
    var structureMinistries = function(language){

      var ret = {};

       _.each(mins,function(obj){
        ret[obj[0].min[language]]={depts:obj};
      });

      return {mins:ret};

    };

})();
