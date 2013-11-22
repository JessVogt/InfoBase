/*
 *   This is module is structure in the following way:
 *   helper functions:
 *      show_all_options
 *      hide_all_otpions
 *      show_all_options2
 *      highlight
 *      _show_all_options
 *      _hide_all_options
 *      _highlight
 *      add_search_box
 *    these helper functions do not need to be part of the _horizontal_gov
 *    object listed below since they don't require any of the internal 
 *    state information'
 *
 *   after the helper functions is the main object _horizontal_gov 
 *   with the following functions.
 *     -- setup and build functions --
 *     `horizontal_gov
 *     dd_section
 *     start_build
 *     make_list
 *     -- handle various selections --
 *     on_pres_level_click
       on_period_click
       on_display_as_click
       on_table_click
       on_column_click
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
    TOOLTIP = D3.TOOLTIP,
    TABLES = ns('TABLES');

   var show_all_options = function(data){ _show_all_options(d3.select(this)); },
       hide_all_options = function(data){ _hide_all_options(d3.select(this)); },
       show_all_options2 = function(data){ _show_all_options(d3.select(this.parentNode.parentNode.parentNode)); },
       highlight = function(data,node){ _highlight(d3.select(node.parentNode)); }, 
       _show_all_options = function(target){
          target.selectAll("li").classed("ui-screen-hidden",false);
          var jq = $(target.node()) ;
          // get the max string
          var max_string = _.max(jq.find("li").map(function(){return $(this).text().length;}));
          // ensure smaller strings don't actually shrink the box'
          max_string = _.max([max_string, 40]);
          jq.width( Math.ceil(max_string / 40)* 280 ) ;
          jq.css("z-index",1000);
       },
       _hide_all_options = function(target){
          target.selectAll("li").classed("ui-screen-hidden",false);
          target.selectAll("li.not-selected").classed("ui-screen-hidden",true);
          var jq = $(target.node()) ;
          jq.width(jq.parent().width());
       } ;
       _highlight = function(target){
          if (d3.event){                
            d3.event.target.focus(); 
          }                             
          $(target.node())                                      
            .addClass("background-medium")               
            .removeClass("not-selected")
            .siblings()
            .removeClass("background-medium")
            .addClass("not-selected");
        },
        add_search_box  = function(node){
          if ($(node).find("input").length > 0){
            return;
          }
          function on_search(event){
              var input = $(event.target);
              var val = input.val();
              var lis = $(node).find("li");
              if ( val.length < 1){
                lis.removeClass("ui-screen-hidden");
                return;
              }
              lis.each(function(){
                if ($(this).text().toLowerCase().search(new RegExp(val)) == -1){
                  $(this).addClass("ui-screen-hidden");
                } else {
                  $(this).removeClass("ui-screen-hidden");
                }
              });
          }
          var input = $('<input>')
            .css("margin-right","10px")
            .on("keyup",on_search);
          $(node).find('.nav-header').after(input);
        };
    D3.horizontal_gov =  function(app){
      return new _horizontal_gov(app);
    };

    _horizontal_gov = function(app){
      // ensure all functions on this object are always bound to this
      _.bindAll(this, _.functions(this));
      app.app.hide();
      this.gt = app.get_text;
      var lang = this.lang = app.state.get("lang");
      this.formater = app.formater;
      // create the span-8 contain and then the selections side bar and the 
      // main chart area
      var area = d3.select("#app")
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

      this.select = d3.dispatch("period", "table", "column", "display_as", "shown", 'org', "pres_level");
      this.add_section('pres_level',2);
      this.add_section('period',2);
      this.add_section('display_as',2);
      this.add_section('table',2);
      this.add_section('column',2);

      this.pres_level.attr("tabindex",0);

      this.orgs = _.chain(window.depts)
        .map(function(d){
          return {acronym : d.accronym, name : d.dept[lang], active : false };
        })
        .sortBy(function(d){ return d.name;})
        .value();
      this.orgs.unshift({acronym :null, name : lang == 'en'? "All" : "Tout",active:true });

      this.start_build();
    };

    var p = _horizontal_gov.prototype;

   p.add_section = function(_class, span){
      //create the div
      //
      var that = this;
      var old_func  =  this["on_"+_class+"_click"];
      this["on_"+_class+"_click"] = function(d){
        var _this = this;
        // this is the startup case, where the clicks are being simulated
        // this will find the relevant node
         if (_this === that){
           _this = _this[_class]
             .selectAll("a").filter(function(x){ return x===d;})
             .node();
         }
         old_func(d,_this);
         that.select[_class](d,_this);
      };
      this[_class] = this.selections.append("div")
                    .attr("class"," well span-"+span+" border-all "+_class)
                    .style("margin-right","0px")
                    .style("margin-bottom","5px")
                    .on("click", show_all_options)
                    .on("mouseleave", hide_all_options)
                    .on("mouseenter", show_all_options);
      // add the header
      this[_class].append("p").html(this.gt(_class) ).attr("class","nav-header");
      // reset the selection for the list
      this[_class]
        .append("ul")
        .attr("class", "list-bullet-none");

      // attach the click handler 
      this.select.on(_class+".highlight",highlight);
   };

   p.make_list = function(name,data,options){
     options = options || {};
     data_key = options.data_key || function(d,i){return i;};
     html = options.html || _.identity;
     each = options.each || _.identity;
     var sel =  this[name]
       .select("ul").selectAll("li")
       .data(data,data_key);

     sel.exit().remove();

     sel
       .enter()
       .append("li")
       .append("a")
       .on("focus", show_all_options2)
       .on("click",this["on_"+name+"_click"])
       .attr("href","#")
       .html(html)
       .each(each);

     return sel;
   };


   p.start_build = function(_class, span){
      // setup the presentation level choice
      // the data
       var pres_levels = this.pres_levels = [
         {name : this.gt("government_stats"), func: _.throttle(this.fetch_gov_data,100) ,val : 'gov'},
         {name : this.gt("org"), func : _.throttle(this.fetch_dept_data,100), val : 'depts'}
       ];
       // create the list
       var group_sel = this.pres_level.select("ul").selectAll("li")
         .data(pres_levels);
       this.make_list("pres_level",pres_levels,{html : function(d){return d.name;}});

      // setup the period choice
      // the data
      var period_data = [ {val: "in_year",name: "In Year"},
                   {val: "historical",name: "Historical"}];
       // create the list
       this.make_list("period",period_data,{html : function(d){return d.name;}});

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
          table : "table"} ]; 
       // create the list
       this.make_list("display_as",display_as_data,{html : function(d){return d.name;}});

       // for each of the elements fire off a selection of the first choice
       // get them highlighted, and hide the other options
      this.on_pres_level_click(pres_levels[0]);
      this.on_display_as_click(display_as_data[0]);
      this.on_period_click(period_data[0]);
      _hide_all_options(this.period);
      _hide_all_options(this.display_as);
      _hide_all_options(this.pres_level);

      this.period.node().focus();

   };

    p.on_pres_level_click = function(d){
      this.select.on("shown.get_data",null);
      this.select.on("column.get_data",null);
      this.select.on("org.get_data",null);
      this.select.on("display_as.get_data",null);

      this.current_pres_level = d;
      if (d.val === 'gov'){
        // remove the shown groups and organizations section
        if (_.has(this, 'shown')){ this.shown.remove();}
        if (_.has(this, 'org')){ this.org.remove();}
      } else {
        // add the shown groups and organizations section
        this.add_section('shown',2);
        this.add_section('org',2);
        this.build_shown_and_orgs();
      }

      this.select.on("shown.get_data",d.func);
      this.select.on("column.get_data",d.func);
      this.select.on("org.get_data",d.func);
      this.select.on("display_as.get_data",d.func);
      if (d3.event){
        d.func();
      }

    };

    p.on_period_click = function(d){
      this.current_period = d;
      delete this.current_table;

      var lang = this.lang;
      // setup the tables choice
      // the data
      var tables = _.filter(TABLES.tables, function(table){
            return table.coverage === d.val;
          });
      // make the list
      this.make_list("table",tables,{
        html : function(d){return d.name[lang];} ,
        data_key : function(d){return d.id;}
      });

      this.on_table_click(tables[0]);
      _hide_all_options(this.table);

    };

    p.on_display_as_click = function(d){
      this.current_display_as = d;
    };

    p.on_table_click = function(table){
       // now a new table has been selected, the shown and column need to be
       // reset
       delete this.current_shown;
       delete this.current_column;
       delete this.current_group;
       // set the current table
       this.current_table = table;

       var lang = this.lang,
           // retrieve the columns of the current table
           cols = _.filter(table.flat_headers, function(col){
             return col.fully_qualified_name;
           });

       this.make_list("column",cols,{
         html: function(d){return d.fully_qualified_name;},
         data_key : function(d){ return d.wcag;}
       });

      this.on_column_click(cols[0]);
      _hide_all_options(this.column);

    };

    p.on_column_click = function(col){
       this.current_column  = col;
       if (this.current_pres_level.val !== 'gov'){
         this.build_shown_and_orgs();
       }
    };

    p.build_shown_and_orgs  = function(){
      var col = this.current_column,
          shown = _.chain(this.current_table.horizontal(col.nick || col.wcag,true))
                   .keys()
                   .sortBy(this.current_table.horizontal_group_sort)
                   .value();
        
      // add the Al option
      shown.unshift( this.gt("all") );
      this.make_list("shown",shown, {data_key: function(d,i){return d;}});
      this.make_list("org",this.orgs,{html: function(d){ return d.name;}});
      add_search_box(this.org.node());
      // override the default highlight behavior
      this.select.on("org.highlight",this.dept_highlight);
      // ensure the search box is cleared when mouse leaves
      this.org.on("mouseleave.clear",function(){ $('input',this).val(""); });
      // add in a search box to make it easier to find a department
      this.on_shown_click(shown[0]);
      _hide_all_options(this.shown);
      var active_dept = this.active_depts()[0] || this.orgs[0];
      active_dept.active = false;
      this.on_org_click(active_dept);
      _hide_all_options(this.org);
    };

    p.dept_highlight = function(d){
      // this function is needed to allow multiple departments to be selected
      // and so that clicking "All" will toggle off all other departments
      // selected
      this.org.selectAll("li")
        .classed("background-medium",function(d){ return d.active;})
        .classed("not-selected",function(d){ return !d.active;});
      if (d3.event.target) {
        d3.event.target.focus(); 
      }
    };

    p.on_shown_click = function(shown){
      this.current_shown = shown;
    };

    p.on_org_click = function(d){
     // this functionality is handled in the dept_highlight function
      d.active = !d.active;
      if (d === this.orgs[0]){
        _.each(this.orgs,function(d){d.active = false;});
        d.active = true;
      } else if (!_.isUndefined(d)){
        var none_active  = _.isUndefined(_.find(this.orgs,function(d){return d.active;}));
        this.orgs[0].active = none_active;
      }
    };

    p.fetch_gov_data  = function(d){

      if (this.current_column ){
        var table = this.current_table,
            col = this.current_column.nick || this.current_column.wcag,
            data = table.horizontal(col, false,true);

        data = _.chain(data)
          .map(function(val,key){
            return {
              name : key,
              value : val
            };
          })
          .sortBy(function(d){return -d.value;});

        this.data = data.value();
        this.current_display_as.func();
      }
    };

    p.fetch_dept_data = function(){

      if (this.current_column && this.current_shown){
        var table = this.current_table,
            col = this.current_column.nick || this.current_column.wcag,
            group = this.current_shown,
            data;

        if (_.isFunction(table.horizontal_data_prep)){
          data = table.horizontal_data_prep(col,group);
        } else {

          if (group === this.gt("all")){
            data = table.dept_rollup(col,this.current_display_as);
          } else {
            data = table.horizontal(col,true,true,this.current_display_as.data_style)[group];
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
        this.current_display_as.func();
      }
    };

    p.active_depts = function(){
      return _.chain(this.orgs)
              .filter(function(d){return d.active;})
              .pluck("acronym")
              .value();         
    };

    p.table_data = function(){
       delete this.chart;
       this.chart_area.selectAll("*").remove();

       var type = this.current_column.type;
       var _formater = this.formater;
       var formater = function(d){ return _formater(type,d)};
       var left_col_header  = this.current_pres_level === 'gov' ? this.gt("exp_category") : this.gt("org");
       var right_col_header = this.gt("amount") + " $(000)";
       var headers = [ [left_col_header, right_col_header , "%"] ];
       var rows = _.map(this.data, function(d){
         return [d.name,d.value];
       });
       var sum = d3.sum(rows,function(d){return d[1];});
       var extent = d3.extent(rows,function(d){return d[1];});
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
    };

    p.graph_data = function(){
      //this.chart_area.selectAll("svg").remove();
      var formater = this.formater;
      var type = this.current_column.type;
      if (!this.chart) {
        this.chart_area.selectAll("*").remove();
        this.chart = D3.BAR.hbar({ 
        x_scale : d3.scale.pow().exponent(0.5),
        axisFormater : function(d){ return formater("compact",d);},
        width : 860 
      })(this.chart_area);
      }
      // create the chart
      this.chart.update({
        data : this.data,
        formater : function(x){ return formater(type,x);}
      });

    } ;
      

})();
