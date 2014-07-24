/*
 *   This is module is structure in the following way:
 *
 */

(function() {
    var D3 = ns('D3'),
        HORIZONTAL = ns("D3.HORIZONTAL"),
        APP = ns("APP"),
        TABLES = ns('TABLES'),
        STORY = ns("D3.STORY");


    APP.add_container_route("analysis-:config","analysis",function(container,config){
      if (config!== 'start') {
       config = $.parseParams(config);
      }
      this.add_crumbs([this.home_crumb,{html: "Horizontal Analysis"}]);
      this.add_title($('<h1>').html("Horizontal Analysis"));
      this.app.analysis =   new horizontal_gov(this.app,d3.select(container),config);
    });


    var Config = HORIZONTAL.Config = function(currently_selected){
      this._config = {};
      this.currently_selected = currently_selected;
      this.dispatch = d3.dispatch("config_changed");
    };

    Config.create_link = function(to_be_selected){
      var temp_config = new Config(to_be_selected);
      return "#analysis-"+temp_config.to_url();
    };

    Config.prototype.del = function(key){
      delete this._config[key];
      delete this.currently_selected[key];
    };

    Config.prototype.set_options = function(key,options,getter) {
      this._config[key] = options;
    };

    Config.prototype.update_selection = function(key,val, updater){
      updater = updater || function(vals,val){ return val; };
      this.currently_selected[key] = updater(this._config[key],val);
    };

    Config.prototype.get_active = function(key,getter){
      // create a standard getter function which will be passed
      // vals => all possible values for the key
      // currently_selected => the current selection, this could be undefined
      getter = getter || function(vals,currently_selected){
        var found;
        if (vals){
          if (_.isArray(currently_selected)){
            found = _.filter(vals, function(val){ return _.contains(currently_selected,val.val);});
          } else if (currently_selected){
            found =  _.find(vals, function(val){return val.val === currently_selected;});
          }
          return found || _.first(vals) ;
        }
      };
      return getter(this._config[key],this.currently_selected[key]);
    };

    Config.prototype.active_index = function(key,getter) {
      if (_.isArray(this._config[key])) {
        return this._config[key].indexOf(this.get_active(key,getter));
      }
    };

    Config.prototype.to_url = function(){
      return $.param(this.currently_selected);
    };

    var horizontal_gov = function(app,container,config){
      container.selectAll("*").remove();
      container.html(Handlebars.compile(d3.select('#horizontal_t').html())({mobile:is_mobile}));
      config = config || {};
      // ensure all functions on this object are always bound to this
      _.bindAll(this, _.functions(this));
      // this will eventually fill up with all the functions
      this.app = app;
      this.no_wrap = ['org',"column_choice"];
      this.gt = app.get_text;
      var lang = this.lang = app.lang;
      this.formater = app.formater;

      this._descriptions = [];

      // create the span-8 contain and then the selections side bar and the
      // main chart area
      this.selections  = container.select(".selections");
      this.chart_area  = container.select(".chart-area");
      this.description_area = container.select(".chart-description");

      STORY.add_toggle_section(this.description_area.select(".title"),
                               this.description_area.select(".content"));

      container.selectAll(".togglee")
        .classed("ui-screen-hidden",true);

      // add the default option sections
      this.add_section("data_type",2);
      this.add_section('pres_level',2);
      this.add_section('period',2);
      this.add_section('display_as',2);
      this.add_section('table',2);

      this.pres_level.attr("tabindex",0);

      this.config = new Config(_.extend({org:['__all__']},config));

      this.orgs = _.chain(window.depts)
        .map(function(d){
          return {acronym : d.accronym, name : d.dept[lang], active : false };
        })
        .sortBy(function(d){ return d.name;})
        .value();
      this.orgs.unshift({acronym :"__all__", name : lang === 'en'? "All" : "Tout"});

      this.config.set_options("org",this.orgs);
      this.start_build();
    };

   var p = horizontal_gov.prototype;

   p.update_description = function(key,template_args){
     var gt = this.gt;
     var index = _.findIndex(this._descriptions, function(x){return x.key === key;});
     if (index !== -1) {
      this._descriptions.splice(index);
    }
     this._descriptions.push({
       key : key,
       args : template_args
     });

     var data = _.chain(this._descriptions)
         .filter(function(d){ return d.args !== null;} )
         .map(function(d){
           d.description = TABLES.m(gt("describe_"+d.key,d.args));
           return d;
         })
         .value();

     var descs = this.description_area.select(".content")
       .selectAll("p.description")
       .data(data);

     descs.exit().remove();
     descs.enter().append("p").attr("class","description");

     descs
       .html(function(d){
           return d.description;
       });
   };

   p.update_url = function(){
     var config = this.config.to_url();
     this.app.router.navigate("analysis-"+config);
   };

   p.wrap_on_click = function(_class){
     var that = this;
     var standard_func_name = "on_"+_class+"_click";

     // check and make sure this function should be wrapped
     if (this.no_wrap.indexOf(_class) === -1) {
       this.no_wrap.push(_class);
       var old_func = this[standard_func_name];
       // because of late declaration, this function won't be bound to horizontal_gov
       // if the this in the funciton === horizontal_gov then it's during the setup
       // phbase
       // otherwise, it's as the result of an event
       this[standard_func_name] = function(){
         // if d is indefined it's because it's from an event being fired from
         // a change event on a select element
         var selected_option,d;
         if ( this !== that){
           var i = this.selectedIndex;
           d = that.config._config[_class][i];
         } else {
           d = that.config.get_active(_class);
         }
         that.config.update_selection(_class,d.val);
         // call the original function
         old_func(d);
       };
     }
   };

   p.add_section = function(_class, span,element){
      this.wrap_on_click(_class);

      element = element || "select";
      this[_class] = this.selections.append("div")
                    .attr("class"," well span-"+span+" border-all "+_class)
                    .style("margin-right","0px")
                    .style("margin-bottom","5px");
      // add the header
      this[_class].append("p").html(this.gt(_class) ).attr("class","nav-header");
      // reset the selection for the list
      this[_class]
        .append(element)
        .attr("class", "list-bullet-none")
        .style({"width" : "95%"});

   };

   p.make_select = function(name,data,options){
     //
     //
     options = options || {};
     data_key = options.data_key || function(d,i){return d.val;};
     html = options.html || _.identity;
     each = options.each || _.identity;
     var current_index = this.config.active_index(name);
     var sel =  this[name]
       .select("select").selectAll("option")
       .data(data,data_key);

     sel.exit().remove();

     sel
       .enter()
       .append("option")
       .html(html)
       .attr("selected",function(d,i){
         if (i === current_index){
           return "selected";
         }
        });

     this[name].select("select").on("change",this["on_"+name+"_click"]);

     return sel;
   };

   p.make_ul = function(name,data,options){
     options = options || {};
     data_key = options.data_key || function(d,i){return i;};
     html = options.html || _.identity;
     each = options.each || _.identity;
     var sel =  this[name]
       .style({"max-height" : "200px", "overflow-y": "auto"})
       .select("ul").selectAll("li")
       .data(data,data_key);

     sel.exit().remove();

     sel
       .enter()
       .append("li")
       .append("a")
       .attr("href","#")
       .html(html)
       .on("click",this["on_"+name+"_click"]);

     return sel;
   };

   p.start_build = function(_class, span){
      var data_types = _.chain(TABLES.tables)
        .map( function(t){
           return t.data_type;
        })
        .uniq(function(data_type){
           return data_type[this.lang];
        },this)
        .map(function(type){
          return {name : type[this.lang], val : type[this.lang], description: type.description[this.lang]};
        },this)
        .value();
      this.config.set_options("data_type",data_types);
      this.make_select("data_type",data_types,{html : function(d){return d.name;}});

      // setup the presentation level choice
      // the data
      var pres_levels = [
        {name : this.gt("government_stats"),
         func: this.fetch_gov_data ,
         val : 'gov'
        },
        {name : this.gt("org"),
         func : this.fetch_dept_data,
         val : 'depts'
        }
      ];
      this.config.set_options("pres_level",pres_levels);
      // create the list
      this.make_select("pres_level",pres_levels,{html : function(d){return d.name;}});

     this.on_data_type_click();
     this.data_type.node().focus();
   };

   p.on_data_type_click = function(){
     // for each of the elements fire off a selection of the first choice

     var data_type = this.config.get_active("data_type");
     this.update_description("data_type", {
       name : data_type.name,
       description : data_type.description
     });

     var period_data  = _.chain(TABLES.tables)
       .filter(function(table){
          return table.data_type[this.lang] === data_type.val;
       },this)
       .map(function(table){
         return table.coverage;
       })
       .uniq(function(coverage){
         return coverage[this.lang];
       },this)
       .map(function(coverage){
          return {
            val : coverage[this.lang],
            name :coverage[this.lang],
            description : coverage.description[this.lang]
          };
       },this)
       .value();

      this.config.set_options("period",period_data);
       // create the list
      this.make_select("period",period_data,{html : function(d){return d.name;}});

      // setup the display as choice
      // the data
      var display_as_data = [ {
        func:this.graph_data ,
        name: this.gt("graphical"),
        data_style : 'map',
        val : 'graph'} ,
        { func:this.table_data ,
          name: this.gt("tabular"),
          data_style : 'entries',
          val : "table"} ];
       this.config.set_options("display_as",display_as_data);
       // create the list
       this.make_select("display_as",display_as_data,{html : function(d){return d.name;}});

     this.on_pres_level_click();
   };

   p.on_pres_level_click = function(d){
     this.update_description("pres_level", {
       name : d.name
     });

     if (d.val === 'gov'){
       // remove the shown groups and organizations section
       if (_.has(this, 'shown')){ this.shown.remove(); }
       if (_.has(this, 'org')){ this.org.remove();}
     } else {
       // add the shown groups and organizations section
     }

     this.on_period_click();

   };

   p.on_period_click = function(){
     var lang = this.lang;
     var period = this.config.get_active("period");
     var data_type = this.config.get_active("data_type");

     this.update_description("period", {
       name : period.name,
       description : period.description
     });


     // setup the tables choice
     // the data
     var tables = _.chain(TABLES.tables)
       .filter(function(table){
           return table.coverage[lang] === period.val && table.data_type[lang] === data_type.val;
       })
       .map(function(table){
          return _.extend({val: table.id},table);
       })
       .value();

     this.config.set_options("table",tables);
     // make the list
     this.make_select("table",tables,{
       html : function(d){return d.name[lang];} ,
       data_key : function(d){return d.id;}
     });

     this.on_display_as_click();
   };

   p.on_display_as_click = function(d){
     this.update_description("display_as", null);

     // always remove the org section
     // it will be recreated later if needed
     if (_.has(this, 'column')){ this.column.remove();}
     if (_.has(this, 'column_choice')){ this.column_choice.remove();}
     if (_.has(this, 'sort_by')){ this.sort_by.remove();}
     if (_.has(this, 'dimension')){ this.dimension.remove();}

     this.add_section("dimension",2);

     if (d.val === 'table') {
       // remove the shown groups and organizations section
       // add the shown groups and organizations section
       this.add_section('column_choice',2,"ul");
       this.add_section('sort_by',2);

     } else {
       // add the shown groups and organizations section
       this.add_section('column',2);
     }

     this.on_table_click();
   };

   p.on_table_click = function(table){
     this.update_description("table", {
       name : table.name[this.lang],
       description: table.description
     });

     var dimensions = _.map(table.dimensions, function(d){
           return {val: d, name : this.gt(d)};
         },this);

     if (table.dimensions.length > 1){
       this.dimension.classed("ui-screen-hidden",false);
       this.config.set_options("dimension",dimensions);
       this.make_select("dimension",dimensions,{
         html: function(d){return d.name;}
       });
     } else {
       this.dimension.classed("ui-screen-hidden",true);
       this.config.set_options("dimension",dimensions);
       this.config.currently_selected.dimension = dimensions[0].val;
     }

     this.on_dimension_click();
   };

   p.on_dimension_click = function(dimension){
     this.update_description("dimension", null);

      var lang = this.lang,
          // retrieve the columns of the current table
          table = this.config.get_active("table"),
          display_as = this.config.get_active("display_as"),
          cols = _.chain(table.flat_headers)
            .filter(function(col){
               return col.fully_qualified_name;
             })
             .map(function(col){
               return _.extend({val: col.fully_qualified_name},col);
             })
             .value();
      if (display_as.val === 'table'){
         this.config.set_options("column_choice",cols);
          if (this.config.currently_selected.column){
              this.config.update_selection("column_choice",[this.config.currently_selected.column]);
          } else if (this.config.currently_selected.column_choice &&
                     _.all(this.config.currently_selected.column_choice,
                           function(x){ return _.contains(_.pluck(cols, "val"),x);})){
              // do nothing
          } else {
              this.config.update_selection("column_choice",[cols[0].val]);
          }
          this.config.del("column");
         this.make_ul("column_choice",cols,{
           html: function(d){return d.fully_qualified_name;},
           data_key : function(d){ return d.wcag;}
         });

         this.on_column_choice_click();
      } else if (display_as.val === 'graph'){
         this.config.set_options("column",cols);
          if (this.config.currently_selected.sort_by){
              this.config.update_selection("column",this.config.currently_selected.sort_by);
          }

         this.make_select("column",cols,{
           html: function(d){return d.fully_qualified_name;},
           data_key : function(d){ return d.wcag;}
         });
         this.config.del("column_choice");
         this.config.del("sort_by");
         this.on_column_click();
      }

   };

   p.on_column_click = function(d){

     this.update_description("column",{
       description : d.description[this.lang],
       name : d.header[this.lang]
     });

     var pres_level = this.config.get_active("pres_level");
     if (this.config.get_active("pres_level").val !== 'gov'){
       this.build_shown_and_orgs();
     } else {
        pres_level.func();
     }
   };

   p.on_column_choice_click = function(d){
     // currently selected column choices are stored as just an
     // array of fully_qualified_names, accoordingly for the descriptions, the names will
     // have to be used to extract the descriptions from the list of
     // columns for the table
     var table = this.config.get_active("table");
     var lang = this.lang;
     var currently_active;
     // if d is undefined, then we have just switched over from the graphical
     // view ohterwise, a column has been either deselected or selected
     if (_.isUndefined(d)){
       if (!this.config.currently_selected.column_choice){
          currently_active  = [this.config.get_active("column_choice").val];
          this.config.update_selection("column_choice",currently_active) ;
       } else{
          currently_active = this.config.currently_selected.column_choice;
       }
     } else {
       currently_active = this.config.currently_selected.column_choice;
       var contains = _.contains(currently_active, d.val);
       // d is currently active
       if ( contains && currently_active.length > 1){
         currently_active = _.filter(currently_active,function(v){
           return v !== d.val;
         });
       // d isn't active
       } else if (!contains){
         currently_active.push(d.val);
       }
       this.config.currently_selected.column_choice = currently_active;
      }

     // use the array of currently active names to pull out the descriptions
     this.update_description("column_choice",
         {cols :  _.map(currently_active, function(col_name){
                var col_def = _.find(table.flat_headers, function(col){
                  return col.fully_qualified_name === col_name;
                });
                return {name : col_def.fully_qualified_name,
                        description : col_def.description[this.lang]
                };
              },this)
         });


     this.config.set_options("sort_by",this.config.get_active("column_choice"));
     this.make_select("sort_by",this.config.get_active("column_choice"),{
       html: function(d){return d.fully_qualified_name;},
       data_key : function(d){ return d.wcag;}
     });

     // highlight the active departments
     this.column_choice.selectAll("li")
       .classed("background-blue",function(d){
         return _.contains(currently_active,d.val);
       })
       .classed("not-selected",function(d){
         return !_.contains(currently_active,d.val);
       });

     this.on_sort_by_click();
   };

   p.on_sort_by_click = function(){
     var pres_level = this.config.get_active("pres_level");
     if (pres_level.val === 'depts'){
       this.build_shown_and_orgs();
     } else {
       pres_level.func();
     }
   };

   p.build_shown_and_orgs  = function(){
     if (_.has(this, 'shown')){ this.shown.remove();}
     if (_.has(this, 'org')){ this.org.remove();}
     this.add_section('shown',2);
     this.add_section('org',2,"ul");

     var col = this.config.get_active("column"),
         sort_by = this.config.get_active("sort_by"),
         active_col = col || sort_by,
         active_col_name = active_col.nick || active_col.wcag,
         table = this.config.get_active("table"),
         dimension = this.config.get_active("dimension"),
         shown =  _.chain(table[dimension.val](active_col_name,true))
                  .keys()
                  .sortBy(table.horizontal_group_sort)
                  .map(function(x){
                    return {val :x};
                  })
                  .value();

     // add the All option
     shown.unshift({val : this.gt("all")});

     this.config.set_options("shown",shown);

     this.make_select("shown",shown, {html: function(d,i){return d.val;}});
     this.make_ul("org",this.orgs,{html: function(d){ return d.name;}});

     this.on_shown_click();
   };

   p.on_shown_click = function(shown){
     this.update_description("shown",null);
     this.on_org_click();
   };

   p.active_depts = function(orgs,val, attr_to_pluck){
     attr_to_pluck  = attr_to_pluck  || "acronym" ;
     return _.chain(this.orgs)
             .filter(function(d){return d.active;})
             .pluck(attr_to_pluck)
             .value();
   };

   p.on_org_click = function(d){
     var pres_level = this.config.get_active("pres_level");

     if (_.isUndefined(d)){
        this.config.get_active("org", function(orgs, currently_selected){
          _.each(orgs, function(org){
            currently_selected = currently_selected || [];
            if (currently_selected.indexOf(org.acronym) !== -1){
              org.active = true;
            } else {
              org.active = false;
            }
          });
        });
     } else {
       d.active = !d.active;
       if (d === this.orgs[0]){
         _.each(this.orgs,function(d){d.active = false;});
         d.active = true;
       } else {
         this.orgs[0].active = false;
       }
     }
     this.config.update_selection("org",null,this.active_depts);

     this.update_description("org",{
       name: this.gt("org"),
       orgs : this.active_depts(null,null,"name"),
       all : this.active_depts()[0] === "__all__"
     });

     // highlight the active departments
     this.org.selectAll("li")
       .classed("background-blue",function(d){ return d.active;})
       .classed("not-selected",function(d){ return !d.active;});
     if (d3.event) {
       d3.event.target.focus();
     }

     pres_level.func();
   };

   p.fetch_gov_data  = function(d){
     var that = this,
         config = this.config,
         col = this.config.get_active("column"),
         cols = this.config.get_active("column_choice"),
         table = this.config.get_active("table"),
         dimension = this.config.get_active("dimension"),
         sort_by = this.config.get_active("sort_by"),
         display_as = this.config.get_active("display_as"),
         col_name, col_names, to_get, data,shown_param;

     if ((col || cols) && display_as){

       if (cols) {
         col_names = _.map(cols, function(col){
           return col.nick || col.wcag;
         });
       } else {
         col_name = col.nick || col.wcag;
       }

       to_get = col_name || col_names;
       data = table[dimension.val](to_get, false,true);

       data = _.chain(data)
        .map(function(val,key){
           return {
             name : key,
             value : val
           };
         })
         .sortBy(function(d){return -d.value;});

       this.data = data.value();

       if (_.isArray(to_get)){
         shown_param = "val";
       } else {
         shown_param = "name";
       }

       this.href = function(d,i){
         // create URL to redirect to the per-org view of this data slice
         d3.select(this).classed("router",true);
         return Config.create_link(_.extend(_.clone(config.currently_selected),{
           "pres_level" : "depts",
           "shown" : d[shown_param]
         }));
       };

       display_as.func();
     }
   };

   p.fetch_dept_data = function(){
     var that = this,
         col = this.config.get_active("column"),
         cols = this.config.get_active("column_choice"),
         table = this.config.get_active("table"),
         sort_by = this.config.get_active("sort_by"),
         dimension = this.config.get_active("dimension"),
         display_as = this.config.get_active("display_as"),
         shown = this.config.get_active("shown"),
         col_name, col_names, to_get, data;

     if ((col || cols) && shown && display_as && this.active_depts().length > 0){

       if (cols) {
         col_names = _.map(cols, function(col){
           return col.nick || col.wcag;
         });
       } else {
         col_name = col.nick || col.wcag;
       }
       to_get = col_name || col_names;

       if (shown.val === this.gt("all")){
         data = table.dept_rollup(to_get,display_as);
       } else {
         data = table[dimension.val](to_get,true,true,display_as.data_style)[shown.val];
       }

       data =  _.chain(data)
         .map(function(val,key){
           return {name : window.depts[key].dept[this.lang],
                   dept : window.depts[key],
                   value : val
             };
         },this)
       .filter(function(d){
         return d.value !== 0;
       })
       .sortBy(function(d){return -d.value;});
       // check for the "All"  department not being active
       if (!this.orgs[0].active){
         var active_depts =  this.active_depts();
         data = data.filter(function(d){
           return _.contains(active_depts,d.dept.accronym);
         });
       }

       this.data = data.value();

       if (_.isArray(to_get)){
         this.href = function(d,i){
           // return href which will direct to the relevant data page
           var dept = window.dept_name_map[d.val];
           return "#t-"+ dept.accronym+"-"+table.id.replace('table',"");
         };

       } else {
         this.href = function(d,i){
           // return href which will direct to the relevant data page
           return "#t-"+d.dept.accronym+"-"+table.id.replace('table',"");
         };
       }
       display_as.func();
     }
   };

   p.table_data = function(){
      delete this.chart;
      this.chart_area.selectAll("*").remove();
      var cols;

      if (this.config.get_active("column")){
        cols = [this.config.get_active("column")];
      } else {
        cols = this.config.get_active("column_choice");
      }

      var types = _.pluck(cols, "type"),
          href = this.href,
          formater = this.formater,
          formaters = _.map(types, function(type){
            return function(d){ return formater(type,d);};
          }),
          pres_level = this.config.get_active("pres_level"),
          left_col_header  = [pres_level.val === 'gov' ? this.gt("exp_category") : this.gt("org")],
          headers = left_col_header.concat(_.pluck(cols, 'fully_qualified_name')),
          rows = _.map(this.data, function(d){
            if (cols.length === 1){
              return [d.name,d.value];
            } else {
              return [d.name].concat(d.value);
            }
          }),
          row_classes = ['left_left'].concat(_.map(cols, function(){return "right_number";}));
          sum = _.map(cols, function(col,i){
             return d3.sum(rows,function(d){return d[i+1];});
          });
      rows.push( ["Total"].concat( sum) );

      var table = TABLES.prepare_and_build_table({
        headers : [headers],
        rows : rows,
        row_class : row_classes,
        table_class : "table-condensed table-blue",
        stripe : true,
        rowseach : function(d,i){
          if (d === _.last(rows)){
            d3.select(this).classed("background-blue",true);
          }
        },
        tdseach : function(d,i){
          if (i === 0 && d.val !== "Total" ){
            d3.select(this).html("")
              .append("a")
              .attr("href",href)
              .attr("class","router")
              .html(d.val);
          } else if (i > 0){
            d3.select(this).html(function(d){ return formaters[i-1](d.val); });
          }
        },
        node : this.chart_area
                    .append("div")
                    .attr("class","table-container sidescroll")
                    .append("div")
                    .style({
                      "width": 300 + cols.length*100+"px",
                      "margin" : "auto"
                    })
                    .node()
      });

     if (this.config.currently_selected.nu){
      delete this.config.currently_selected.nu;
     } else {
      this.update_url();
     }
   };

   p.graph_data = function(){
     //this.chart_area.selectAll("svg").remove();
     var formater = this.formater;
     var type = this.config.get_active("column").type;
     var total = formater("compact1",d3.sum(this.data, function(d){return d.value;}));

     if (!this.chart) {
      this.chart_area.selectAll("*").remove();
      this.chart = D3.BAR.hbar({
        x_scale : d3.scale.pow().exponent(0.5),
        axisFormater : function(d){ return formater("compact",d);}
      })(this.chart_area);
     }
     // create the chart
     this.chart.update({
       data : this.data,
       total : "Total: " + total,
       href : this.href,
       formater : function(x){ return formater(type,x);}
     });
     if (this.config.currently_selected.nu){
      delete this.config.currently_selected.nu;
     } else {
      this.update_url();
     }
   } ;


})();
