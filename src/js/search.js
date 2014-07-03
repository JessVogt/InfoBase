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
        this.template = APP.t('#org_list_t');
      _.bindAll(this,"render");
        this.app = this.options.app;
        this.container = this.options.container;
        this.state = this.app.state;
        this.lookup = depts;
        this.sort_func = 'min_sort';

        var lang = this.state.get('lang');

        this.simple_depts = _.map(window.depts,function(obj,key){
          return {dept_name:obj.dept[lang],accr:obj.accronym};
        });

        this.nested_depts = structureMinistries(lang);

        this.obtainer = function(query,cb){
		        var filteredList = $.grep(suggestionsArray,function(item,index){
             return item.match(new RegExp(query, 'gi'));
		    });

		      var mapped = $.map(filteredList,function(item){return {value:item}; });
		      cb(mapped);
	      };


      },
      render : function(){
        self = this;


        // render the template and append to the container
        //old arg: { depts : this[this.sort_func].group_by(lang,this)  }
        var el = $($.trim(this.template(
            this.nested_depts
          )));
        this.container.append(el);
/*
        $('.typeahead').typeahead({
          hint:false,
      		highlight:true,
      		minLength:1
      		},{
      		name:'noname',
      		displayKey:'value',
      		source:this.obtainer
    	});
*/

        $('.typeahead').typeahead({
          hint:true,
          highlight:true,
          minLength:3
          },{
           source: function(query, process) {

             //RegExp for filtering
              var re = new RegExp(query, 'gi');

             //Filter the list
              var filtered_depts = $.grep(self.simple_depts,function(item){
                return (item.dept_name+item.accr).match(re);
              });


              process(filtered_depts);
            },
            /*
            highlighter: function(item){
              return "<div class='typeahead_wrapper'> <div class='typeahead_labels'> <div class='typeahead_primary'>" + item.dept[lang] + "</div> <div class='typeahead_secondary'>" + item.accronym + "</div> </div> </div>";
              //return "<a href='#d-"+item.accronym+"'>"+item.dept[lang]+"("+item.accronym+")</a>";
            },
            */
          templates: {
            suggestion:Handlebars.compile('<a id="typeahead" href="#d-{{accr}}"><p>{{dept_name}} ({{accr}})</p></a>')
          }
        }).on('typeahead:selected',function( event, datum ) {
          window.location.href ="#d-"+datum.accr;
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
