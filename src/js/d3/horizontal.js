(function() {
    var D3 = ns('D3'),
    TOOLTIP = D3.TOOLTIP,
    TABLES = ns('TABLES');


    D3.horizontal_gov =  function(app){
      return new _horizontal_gov(app);
    };

    _horizontal_gov = function(app){
      app.app.hide();
      this.gt = app.get_text;
      this.lang = app.state.get("lang");
      this.formater = app.formater;
      // create the span-8 contain and then the selections side bar and the 
      // main chart area
      var area = d3.select("#app")
            .append("div")
            .attr("class","span-8 horizontal_gov")
            .style("margin-left","0px"),
          selections  = area
            .append("div")
            .attr("class","span-2 well selections border-all margin-none")
            .style("margin-left","10px");
      this.chart_area  = area
            .append("div")
            .attr("class","span-6 chart border-all margin-none")
            .style("margin-left","10px");

      // setup each of the four sections for the time period covers, the relevant tale names
      // then the columns of a particular table and then the groups
      this.dispatcher = d3.dispatch("period_click","table_click","column_click","shown_click");
      _.each(['period', 'table', 'column', 'shown'],function(x){
          this[x] = selections.append("div")
                        .attr("class","margin-none border-bottom"+x)
                        .append("ul")
                         .attr("class", "list-bullet-none");
          this[x].append("p").html(  app.get_text(x) ).attr("class","nav-header");
          this.dispatcher.on(x+"_click",_.bind(this["on_"+x+"_click"],this));
          this.dispatcher.on(x+"_click.highlight",_.bind(this.highlight,this));
      },this);

      this.dispatcher.on("shown_click.get_data",_.bind(this.fetch_data,this));

      var data = [ {val: "in_year",name: "In Year"},
                   {val: "historical",name: "Historical"}];
      this.period
        .selectAll("li").data(data)
          .enter()
          .append("li")
          .append("a")
          .attr("href","#")
          .html(function(d){return d.name;})
          .on("click",this.dispatcher.period_click);

      this.dispatcher.period_click(data[0],this.period);
    };

    _horizontal_gov.prototype.highlight = function(data,select){
      var target ;
      if (d3.event){ 
        target = d3.event.target;
      } else {
         target = select
          .selectAll("a")
          .filter(function(d){ return d === data;})
          .node();
      }
      $(target)
        .parent()
        .addClass("background-medium")
        .siblings()
        .removeClass("background-medium");
    };

    _horizontal_gov.prototype.on_period_click = function(d){
      delete this.current_table;

      var lang = this.lang;
      var tables = _.filter(TABLES.tables, function(table){
            return table.coverage === d.val;
          });

      var sel = this.table.selectAll("li")
        .data(tables,function(d){return d.id;});
      sel
        .enter()
        .append("li")
        .append("a")
        .attr("href","#")
        .html(function(d){return d.name[lang];})
        .on("click",this.dispatcher.table_click);
      sel
        .exit()
        .remove();

      _.delay(this.dispatcher.table_click,0,tables[0],this.table);

    };

    _horizontal_gov.prototype.on_table_click = function(table){
      // now a new table has been selected, the shown and column need to be
      // reset
      delete this.current_shown;
      delete this.current_column;
      // set the current table
      this.current_table = table;

      var lang = this.lang,
          // retrieve the columns of the current table
          cols = _.filter(table.flat_headers, function(col){
            return col.fully_qualified_name;
          });
         
      var col_sel = this.column.selectAll("li")
        .data(cols,function(d){return d.wcag});
      col_sel
        .enter()
        .append("li")
        .append("a")
        .attr("href","#")
        .html(function(d){return d.fully_qualified_name;})
        .on("click",this.dispatcher.column_click);
      col_sel
        .exit()
        .remove();

      _.delay(this.dispatcher.column_click,0,cols[0],this.column);
    };

    _horizontal_gov.prototype.on_column_click = function(col){
      var col = this.current_column  = col;
      var shown = _.chain(this.current_table.horizontal(col.nick || col.wcag,true))
                   .keys()
                  // filter out any null values
                  .compact()
                  .value();

      // add the Al option
      shown.unshift( this.gt("all") );

      shown_sel = this.shown.selectAll("li")
        .data(shown,_.identity);

      shown_sel
        .exit()
        .remove();

      shown_sel
        .enter()
        .append("li")
        .append("a")
        .attr("href","#")
        .html(_.identity)
        .on("click",this.dispatcher.shown_click);

      _.delay(this.dispatcher.shown_click,0,this.current_shown || shown[0],this.shown);
    };

    _horizontal_gov.prototype.on_shown_click = function(shown){
      this.current_shown = shown;
    };

    _horizontal_gov.prototype.fetch_data = function(){
      if (this.current_column && this.current_shown){
        var table = this.current_table,
            col = this.current_column.nick || this.current_column.wcag,
            group = this.current_shown,
            data;

        if (_.isFunction(table.horizontal_data_prep)){
          data = table.horizontal_data_prep(col,group);
        } else {

          if (group === this.gt("all")){
            data = table.dept_rollup(col);
          } else {
            data = table.horizontal(col,true)[group];
          }

          data =  _.chain(data)
            .map(function(val,key){
              return {name : window.depts[key].dept[this.lang],
                      dept : window.depts[key],
                      value : val
                }
            },this)
          .sortBy(function(d){return -d.value;})
          .value();

        }
       
        this.graph_data(data);
      }
    };

    _horizontal_gov.prototype.graph_data = function(data){
      //this.chart_area.selectAll("svg").remove();
      var formater = this.formater;
      var type = this.current_column.type;
      if (!this.chart) {
        this.chart = D3.BAR.hbar({ 
        x_scale : d3.scale.pow().exponent(0.5),
        axisFormater : function(d){ return formater("compact",d)},
        width : 860 
      })(this.chart_area);
      }
      // create the chart
      this.chart.update({
        data : data,
        formater : function(x){ return formater(type,x);}
      });

    }
      


})();
