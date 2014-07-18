(function() {
    var APP = ns('APP');

    // add the #search route
    APP.add_container_route("search","search",function(container){
      this.add_crumbs([this.home_crumb,{html: this.gt("search")}]);
      this.add_title("search");
      if (!this.app.full_org_list){
        this.app.full_org_list = new searchOrg( this.app, $(container));
      }
    });

    var searchOrg = function(app, container){
      
        var template = APP.t('#org_list_t');
        var lang = app.lang;

        var nested_depts = structureDepartments(lang);
        var flattened_depts = _.flatten(_.pluck(nested_depts,1));
        // render the template and append to the container
        //old arg: { depts : this[this.sort_func].group_by(lang,this)  }
        var el = $($.trim(template( {depts : nested_depts})));
        container.append(el);

        el.find('input.typeahead')
         .attr("id","dept_search_filter")
         .before($('<label>')
               .attr("for","dept_search_filter")
               .addClass("wb-invisible")
               .html(app.get_text("search")));

        $('.typeahead').typeahead({
          hint:true,
          highlight:true,
          minLength:3
          },{
           source: function(query, process) {

             //RegExp for filtering
              var re = new RegExp(query, 'gi');

             //Filter the list
              var filtered_depts = _.filter(flattened_depts,function(dept){
                return dept.label.match(re);
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
            suggestion:Handlebars.compile('<a class="typeahead" href="{{href}}"><p>{{label}}</p></a>')
          }
        }).on('typeahead:selected',function( event, datum ) {
          app.router.navigate(datum.href,{trigger:true});
        });

    };

    //Returns a nested object identical to window.mins, but has an extra property for the ministry's name in language of choice.
    var structureDepartments = function(lang){
      return  _.chain(_.values(window.depts))
                    .filter(function(dept){
                       return dept.accronym !== 'ZGOC' && dept.accronym !== "";
                    })
                    .map(function(dept){
                      return {
                        label : dept.dept[lang],
                        href : "#d-"+dept.accronym
                      };
                    })
                    .groupBy(function(dept){
                       return dept.label[0];
                    })
                    .map(function(depts, letter){
                      return [letter, _.sortBy(depts,function(dept){
                        return dept.label;
                      })];
                    })
                    .sortBy(function(collection){
                      return collection[0];
                    })
                    .value();
    };
})();
