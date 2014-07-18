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
            templates: {
              suggestion:Handlebars.compile('<a class="typeahead" href="{{href}}"><p>{{label}}</p></a>')
            }
        }).on('typeahead:selected',function( event, datum ) {
          app.router.navigate(datum.href,{trigger:true});
        });

    };

    //sets up the departments for alphabetical separators
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

    /*phantom-only*/ 
    window.index_page = {
      scrape : function(lang){

        var clone = $('html').clone();

        var links = clone.find(".org_select");
          links.each(function() {
            //For each link, find the department matching the text (in english or french)
            var acronym = _.find(window.depts, function(d) {return d.dept.en == this.innerHTML || d.dept.fr == this.innerHTML;}, this).accronym;
            var address =  "nojs"+acronym;
            this.href = address + "-" + lang + ".html";
          });


        clone.find('script').remove();
        clone.find('noscript').remove();
        clone.find('base').remove();
        clone.find('.twitter-typeahead').remove();
        clone.find("a.dept_sel").attr("href", "nojsindex-" + lang + ".html");
        clone.find("#gcwu-gcnb-lang a").attr("href", "nojslanding-" + (lang == "eng" ? "fra" : "eng") + ".html");
        clone.find("a.dept_sel:first").remove();

        clone.find(".ui-li.ui-li-divider").remove();
        clone.find("a.dept_sel_cancel").remove();
        clone.find("ul.list-view").removeClass("list-view");
        clone.find("li.ui-li").removeClass("ui-li ui-li-divider ui-bar-b ui-first-child");
        clone.find("div.ui-btn-text").removeClass("ui-btn-text");
        clone.find("div.ui-li").removeClass("ui-btn-inner ui-li");
        clone.find("li.ui-btn").removeClass("ui-btn ui-btn-icon-right ui-li-has-arrow ui-btn-up-c");
        clone.find("span").removeClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
        clone.find(".button").remove();
        clone.find("div .ui-input-search").remove();

        var body = clone[0].outerHTML;

        return body.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gm, "");
        


    }
  };

/*phantom-only*/

})();
