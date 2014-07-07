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
      
      initialize: function(){
        this.template = APP.t('#org_list_t');
        _.bindAll(this,"render");
        this.app = this.options.app;
        this.container = this.options.container;
        this.state = this.app.state;

        var lang = this.state.get('lang');


        //Get rid of ZGOC and the blank department
        //proper_depts = _.reject(window.depts,function(item){ return !item.accronym || item.accronym == 'ZGOC';});
        proper_depts = _.omit(window.depts,'','ZGOC');

        this.simple_depts = _.map( proper_depts ,function(obj,key){
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

         el.find('input.typeahead')
          .attr("id","dept_search_filter")
          .before($('<label>')
                .attr("for","dept_search_filter")
                .addClass("wb-invisible")
                .html(this.app.get_text("search")));


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



      }
    });
      

    //Returns a nested object identical to window.mins, but has an extra property for the ministry's name in language of choice.
    var structureMinistries = function(language){

      var ret = {};
      //Get rid of ZGOC
      clean_mins = _.omit(window.mins, 'Government of Canada');
       _.each(clean_mins,function(obj){
        ret[obj[0].min[language]]={depts:obj};
      });

      return {mins:ret};

    };

})();
