/*
 *   This is module is structure in the following way:
 *
 *   the main object _horizontal_gov 
 *   with the following functions.
 *     -- setup and build functions --
 *     `horizontal_gov
 *     dd_section
 *     start_build
 *     make_select
 *     -- handle various selections --
 *     on_pres_level_click
       on_period_click
       on_display_as_click
       on_table_click
       on_column_cdlick
       -- the functions are only needed for the org view ---
       build_shown_and_orgs
       dept_highlight
       on_shown_click
       on_org_click
       -- depending on the presentation level, one of these functions will be
          called --
       fetch_gov_data
       fetch_dept_data
       -- depending on the choice for graphical or tabular data, one of these
          functions will be called --
       table_data
       graph_data
 */

(function() {
    var D3 = ns('D3'),
    HORIZONTAL = ns("D3.HORIZONTAL"),
    TABLES = ns('TABLES');
    
    var Config = HORIZONTAL.Config = function(currently_selected){
      this._config = {};
      this.currently_selected = currently_selected;
    }

    Config.create_link = function(to_be_selected){
      var temp_config = new Config(to_be_selected);
      return "#analysis-"+temp_config.to_url();
    }

    Config.prototype.set_options = function(key,options,getter) {
      this._config[key] = options;
    }

    Config.prototype.update_selection = function(key,val, updater){
      updater = updater || function(vals,val){ return val; }
      this.currently_selected[key] = updater(this._config[key],val);
    }

    Config.prototype.get_active = function(key,getter){
      getter = getter || function(vals,currently_selected){
        if (vals){
          if (currently_selected){
            var found =  _.find(vals, function(val){return val.val === currently_selected});
          }
          return found || _.first(vals) ;
        }
      }
      return getter(this._config[key],this.currently_selected[key]);
    }

    Config.prototype.active_index = function(key,getter) {
      if (_.isArray(this._config[key])) {
        return this._config[key].indexOf(this.get_active(key,getter));
      }
    }

    Config.prototype.to_url = function(){
      return $.param(this.currently_selected);
    }

    HORIZONTAL.horizontal_gov =  function(app,container,config){
      return new _horizontal_gov(app,container,config);
    };

    var _horizontal_gov = function(app,container,config){
      container.children().remove();
      config = config || {};
      // ensure all functions on this object are always bound to this
      _.bindAll(this, _.functions(this));
      // this will eventually fill up with all the functions
      this.app = app;
      this.no_wrap = ['org',"column_choice"];
      this.gt = app.get_text;
      var lang = this.lang = app.state.get("lang");
      this.formater = app.formater;
      // create the span-8 contain and then the selections side bar and the 
      // main chart area
      var area = d3.select(container[0])
            .append("div")
            .attr("class","span-8 horizontal_gov")
            .style("min-height","800px")
            .style("margin-left","0px");
      this.selections  = area
            .append("div")
            .attr("class","span-2 selections border-all margin-none")
            .style("margin-left","10px");
      this.chart_area  = area
            .append("div")
            .attr("class","span-6 chart border-all margin-none")
            .style("margin-left","10px");

      // setup each of the four sections for the time period covers, the relevant tale names
      // then the columns of a particular table and then the groups
      var events = ["data_type","period", "table", "column", "column_choice","display_as", "shown", 'org', "pres_level","sort_by"];
      this.select = d3.dispatch.apply(this,events);
      // listen to all events to update the config object 

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
      this.orgs.unshift({acronym :"__all__", name : lang == 'en'? "All" : "Tout"});
      
      this.config.set_options("org",this.orgs);
      this.start_build();
    };

    var p = _horizontal_gov.prototype;

   p.update_url = function(){
     var config = this.config.to_url();
     this.app.router.navigate("analysis-"+config);
   }

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
         var selected_option
         if ( this !== that){
           var i = this.selectedIndex;
           var d = that.config._config[_class][i];
         } else {
          var d = that.config.get_active(_class);
         }
         that.config.update_selection(_class,d.val);
         // call the original function
         old_func(d);
         // 
         that.select[_class](d);
       };
     }
   }

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

     this[name].select("select").on("change",this["on_"+name+"_click"])
     
     return sel;
   };

   p.make_ul = function(name,data,options){
     options = options || {};
     data_key = options.data_key || function(d,i){return i;};
     html = options.html || _.identity;
     each = options.each || _.identity;
     var sel =  this[name]
       .style({"height" : "200px", "overflow-y": "auto"})
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
   }

   p.start_build = function(_class, span){
      var data_types = _.chain(TABLES.tables)
        .map( function(t){
           return t.data_type;
        })
        .uniq()
        .map(function(type){
          return {name : this.gt(type), val : type};
        },this)
        .value();
      this.config.set_options("data_type",data_types);
      this.make_select("data_type",data_types,{html : function(d){return d.name;}});

      // setup the presentation level choice
      // the data
      var pres_levels = [
        {name : this.gt("government_stats"), func: this.fetch_gov_data ,val : 'gov'},
        {name : this.gt("org"), func : this.fetch_dept_data, val : 'depts'}
      ];
      this.config.set_options("pres_level",pres_levels);
      // create the list
      this.make_select("pres_level",pres_levels,{html : function(d){return d.name;}});

      // setup the period choice
      // the data
      var period_data = [ {val: "in_year",name: "In Year"},
                   {val: "historical",name: "Historical"}];
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


     this.on_data_type_click();
     this.data_type.node().focus();
   };

   p.on_data_type_click = function(){
     // for each of the elements fire off a selection of the first choice
     this.on_pres_level_click();
   }

   p.on_pres_level_click = function(d){

     if (d.val === 'gov'){
       // remove the shown groups and organizations section
       if (_.has(this, 'shown')){ this.shown.remove();}
       if (_.has(this, 'org')){ this.org.remove();}
     } else {
       // add the shown groups and organizations section
       this.add_section('shown',2);
       this.add_section('org',2,"ul");
     }
     // these on bindings will over-write what was there previously
     this.select.on("shown.get_data",d.func);
     this.select.on("column.get_data",d.func);
     this.select.on("org.get_data",d.func);
     this.select.on("display_as.get_data",d.func);

     this.on_period_click();

   };

   p.on_period_click = function(period){

     var lang = this.lang;
     // setup the tables choice
     // the data
     var tables = _.chain(TABLES.tables)
       .filter(function(table){
           return table.coverage === period.val;
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
     // always remove the org section
     // it will be recreated later if needed
     if (_.has(this, 'org')){ this.org.remove();}
     if (d.val === 'table') {
       // remove the shown groups and organizations section
       if (_.has(this, 'column')){ this.column.remove();}
       if (_.has(this, 'shown')){ this.shown.remove();}
       // add the shown groups and organizations section
       this.add_section('column_choice',2,"ul");
       this.add_section('sort_by',2);
     } else {
       if (_.has(this, 'column_choice')){ this.column_choice.remove();}
       if (_.has(this, 'sort_by')){ this.sort_by.remove();}
       // add the shown groups and organizations section
       this.add_section('column',2);
     }

     this.on_table_click();
   };

   p.on_table_click = function(table){

      var lang = this.lang,
          // retrieve the columns of the current table
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
         cols.unshift({val :"__all__", fully_qualified_name : lang == 'en'? "All" : "Tout"});
         this.config.set_options("column_choice",cols);
         this.make_ul("column_choice",cols,{
           html: function(d){return d.fully_qualified_name;},
           data_key : function(d){ return d.wcag;}
         });

         this.config.set_options("sort_by",_.tail(cols));
         this.make_select("sort_by",cols,{
           html: function(d){return d.fully_qualified_name;},
           data_key : function(d){ return d.wcag;}
         });

         this.on_column_choice_click();
      } else if (display_as.val === 'graph'){
         this.config.set_options("column",cols);
         this.make_select("column",cols,{
           html: function(d){return d.fully_qualified_name;},
           data_key : function(d){ return d.wcag;}
         });

         this.on_column_click();
      }
   };

   p.on_column_click = function(){
     if (this.config.get_active("pres_level").val !== 'gov'){
       this.build_shown_and_orgs();
     }
   };

   p.on_column_choice_click = function(d){
     if (_.isUndefined(d)){
       debugger
     };
     if (this.config.get_active("pres_level").val !== 'gov'){
       this.build_shown_and_orgs();
     }
   };

   p.build_shown_and_orgs  = function(){
     var col = this.config.get_active("column"),
         table = col.table,
         shown = _.chain(table.horizontal(col.nick || col.wcag,true))
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
     this.on_org_click();
   };

   p.on_shown_click = function(shown){ };

   p.on_sort_by_click = function(){


   }

   p.active_depts = function(){
     return _.chain(this.orgs)
             .filter(function(d){return d.active;})
             .pluck("acronym")
             .value();         
   };


   p.on_org_click = function(d){
     if (_.isUndefined(d)){
        this.config.get_active("org", function(orgs, currently_selected){
          _.each(orgs, function(org){
            currently_selected = currently_selected || [];
            if (currently_selected.indexOf(org.acronym) !== -1){
              org.active = true;
            } else {
              org.active = false;
            }
          })
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

     // highlight the active departments
     this.org.selectAll("li")
       .classed("background-medium",function(d){ return d.active;})
       .classed("not-selected",function(d){ return !d.active;});
     if (d3.event) {
       d3.event.target.focus(); 
     }
     this.select["org"](d,null);
   };

   p.fetch_gov_data  = function(d){
     var that = this,
         config = this.config,
         col = this.config.get_active("column"),
         display_as = this.config.get_active("display_as");

     setTimeout(function(){
       that.rendered = false;
     })

     if (col && display_as && !this.rendered){
       this.rendered = true;
       var col_name = col.nick || col.wcag,
           data = col.table.horizontal(col_name, false,true);

       data = _.chain(data)
         .map(function(val,key){
           return {
             name : key,
             value : val
           };
         })
         .sortBy(function(d){return -d.value;});

       this.data = data.value();

       this.href = function(d,i){
         // create URL to redirect to the per-org view of this data slice
         d3.select(this).classed("router",true);
         return Config.create_link(_.extend(_.clone(config.currently_selected),{
           "pres_level" : "depts",
           "shown" : d.name
         }));
       }
       display_as.func();
     }
   };

   p.fetch_dept_data = function(){
     var that = this,
         col = this.config.get_active("column"),
         display_as = this.config.get_active("display_as"),
         shown = this.config.get_active("shown");

     setTimeout(function(){
       that.rendered = false;
     })

     if (col && shown && display_as && this.active_depts().length > 0 && !this.rendered){
       this.rendered = true;
       var table = col.table,
           col_name = col.nick || col.wcag,
           data;

       if (_.isFunction(table.horizontal_data_prep)){
         data = table.horizontal_data_prep(col_name,shown.val);
       } else {

         if (shown.val === this.gt("all")){
           data = table.dept_rollup(col_name,display_as);
         } else {
           data = table.horizontal(col_name,true,true,display_as.data_style)[shown.val];
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
       }
      
       this.data = data.value();
       this.href = function(d,i){
         // return href which will direct to the relevant data page
         return "#t-"+d.dept.accronym+"-"+table.id.replace('table',"");
       }
       display_as.func();
     }
   };

   p.table_data = function(){
      delete this.chart;
      this.chart_area.selectAll("*").remove();

      var type = this.config.get_active("column").type;
          _formater = this.formater,
          formater = function(d){ return _formater(type,d)},
          pres_level = this.config.get_active("pres_level"),
          left_col_header  = pres_level.val === 'gov' ? this.gt("exp_category") : this.gt("org"),
          right_col_header = this.gt("amount") + " $(000)",
          headers = [ [left_col_header, right_col_header , "%"] ],
          rows = _.map(this.data, function(d){
            return [d.name,d.value];
          }),
          sum = d3.sum(rows,function(d){return d[1];}),
          extent = d3.extent(rows,function(d){return d[1];});
      rows.push( ["Total", sum] );
      if (sum!==0){
       rows = _.map(rows, function(row){
         var val = row[1];
         if (val >= 0  || extent[1] < 0 ){
           return row.concat([val / sum]);
         } 
         return row.concat([0]);
       });
      }
      TABLES.prepare_data({
        headers : headers,
        rows : rows,
        row_class : ["left_text","right_number","right_number"]
      });
      TABLES.d3_build_table({
        headers : headers,
        rows : rows,
        //data_key_func : 
        rowseach : function(d){
          if (d === _.last(rows)){
            d3.select(this).classed("background-medium",true);
          }
        },
        tdseach : function(d,i){
          if (i===1){
            d3.select(this).html(function(d){ return formater(d.val); });
          }
          else if (i===2){
            d3.select(this).html(function(d){ return _formater("percentage",d.val); });
          }
        },
        node : this.chart_area.node()
      });
     this.update_url();
   };

   p.graph_data = function(){
     //this.chart_area.selectAll("svg").remove();
     var formater = this.formater;
     var type = this.config.get_active("column").type;
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
       href : this.href,
       formater : function(x){ return formater(type,x);}
     });
     this.update_url();
   } ;
      

})();
