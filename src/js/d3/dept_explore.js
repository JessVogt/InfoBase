(function() {
    var D3 = ns('D3'),
    PACK = ns('D3.PACK'),
    TABLES = ns('TABLES');

    D3.bubbleDeptList =  function(app,container,method){
      return new _bubbleDeptList(app,container,method);
    }

    _bubbleDeptList = function(app,container,method){
      this.app = app;
      this.container = container;
      this.gt = this.app.get_text;
      this.lang = app.state.get("lang");
      this.setup(method);
    }

    var p = _bubbleDeptList.prototype;

    p.setup = function(method) {
      if ( this.current_method === method){
        return;
      } else {
        $(this.container).children().remove();
        this.current_method = method;
        if (method === 'dept'){
          this.by_min_dept();
        } else if (method === 'v_s'){
          this.by_vote_stat();
        } else if (method === 'type'){
          this.by_type();
        }
      }
    }
  
    p.by_min_dept = function(){
      // this function regroups departments into their respective ministries 
      // 1 - all departments in table8 are obtained
      // 2 - the depratments are mapped into an object with three keys
      //      min, name, value=total_net_auth, _value
      //      becuase value will be changed during the softening, _value is held
      //      for the tooltip
      // 3 - departments with a 0 value are filtered out
      // 4 - departments are grouped by ministry
      // 5 - the ministry groups are mapped into new objects with three keys
      //      name, children=depts and value=sum of total net auth
      //      in addition, the relative value of each department's total not auth
      //      is softened for display purposes'
      var lang = this.lang;
      var table = _.find(TABLES.tables, function(t){ return t.id === 'table8'});
      // group the departments by
      // minisries and then do a reduce sum to extract the fin size
      // of each ministry
      var min_objs =  _.chain(table.depts)
        .keys()
        .map(function(key){
            var dept = window.depts[key];
            var total = table.q(key).sum("total_net_auth");
            return {
              min : dept.min[lang],
              accronym : dept.accronym,
              name : dept.dept[lang],
              _value : total,
              value : Math.abs(total)
            };
        })
        .filter(function(d){
          return d.value != 0;
        })
        .groupBy(function(d){
          return d.min;
        })
        .map(function(depts, min){
          PACK.soften_spread(depts);
          return {
            name : min,
            children : depts,
            value : d3.sum(depts, function(d){ return d.value;}),
            _value : d3.sum(depts, function(d){ return d._value;})
          }
        })
        .value();
        // smooth out differences between smaller and larger ministries
        //PACK.soften_spread(min_objs);
        // nest the data for exploring
        var data = this.nest_data_for_exploring(min_objs,this.gt("goc_total") );
        this.build_graphic(data);
    }


    p.by_vote_stat = function(){
      var lang = this.lang;
      var table = _.find(TABLES.tables, function(t){ return t.id === 'table8'});
      var vote_stat = table.voted_stat("total_net_auth",true);
      var children = _.map(vote_stat, function(depts,key){
          // key == "voted"  or "stat"
          var dept_objs = _.chain(depts)
            .map( function(amount, dept_key){
                // dept_key = "AGR", "FIN", etc...
                var dept = window.depts[dept_key];
                return {
                  min : dept.min[lang],
                  accronym : dept.accronym,
                  name : dept.dept[lang],
                  value : Math.abs(amount),
                  _value : amount
                };
            })
           .filter(function(dept_obj){
             return dept_obj.value !== 0;
           })
           .value();
          var node = this.nest_data_for_exploring(dept_objs, key, [9,12]);
          node.name = this.gt(key);
          return node
       },this);
      var data = {
        name : this.gt("goc_total"),
        value : d3.sum(children, function(d){ return d.value;}),
        _value : d3.sum(children, function(d){ return d._value;}),
        children : children.reverse()
      }
      this.build_graphic(data);
    }

    p.by_type = function(){
      var lang = this.lang;
      // reference to the tables
      var table8 = _.find(TABLES.tables, function(t){ return t.id === 'table8'});
      var table2 = _.find(TABLES.tables, function(t){ return t.id === 'table2'});
      // some additional data prep to merge in the extra authorities which aren't
      // covered in the 
      var qfr_difference = table8.q().qfr_difference();
      var spend_type =  table2.spending_type("plannedexp",true);
      spend_type['crown'] = qfr_difference['crown'];
      _.extend(spend_type['op'], qfr_difference['op']);

      var children = _.map(spend_type, function(depts,key){
          // key == the various spending types
          var dept_objs = _.chain(depts)
            .map( function(amount, dept_key){
                // dept_key = "AGR", "FIN", etc...
                var dept = window.depts[dept_key];
                return {
                  min : dept.min[lang],
                  accronym : dept.accronym,
                  name : dept.dept[lang],
                  value : Math.abs(amount),
                  _value : amount
                };
            })
           .filter(function(dept_obj){
             return dept_obj.value !== 0;
           })
           .value();
          var node = this.nest_data_for_exploring(dept_objs, key, [9,12]);
          node.name = this.gt(key+"_spend_type");
          return node
       },this);
      var data = {
        name : this.gt("goc_total"),
        value : d3.sum(children, function(d){ return d.value;}),
        _value : d3.sum(children, function(d){ return d._value;}),
        children : children.reverse()
      }
      this.build_graphic(data);
    }

    p.nest_data_for_exploring = function(to_be_nested, top_name, rangeRound){
      // pack the data using a specialised scale to create a two level
      // packing
      var rangeRound = rangeRound || [10,12];
      var get_value = function(d){ return d.value;};
      var get__value = function(d){ return d._value;};
      var data = PACK.pack_data(to_be_nested,this.app.get_text("smaller_orgs"),{
        soften : true,
        scale : d3.scale.log()
          .domain(d3.extent(to_be_nested, get_value))
          .rangeRound(rangeRound),
        per_group : function(grp){
          grp._value = d3.sum(grp.children,get__value);
          grp.value = d3.sum(grp.children,get_value);
        }
      });
      data.name = top_name;
      return data
    }

    p.build_graphic = function(data){
       var lang = this.lang,
           app = this.app,
           formater = function(x){ return app.formater("compact",x)},
           container = this.container;

      var chart = PACK.pack({
        height: 680,
        zoomable : true,
        html_tags : true,
        data: data,
        text_func : function(d) {  
          var val = formater(d.value);
          if (d.zoom_r > 60) {
            return d.name + " - "+ val; 
          } else if (d.zoom_r > 40) {
            return _.first(d.name.split(" "),2).join(" ")+ " - "+ val;  
          } else if (d.zoom_r > 35){
            return val;
          } else {
            return "...";
          }
        }
      });
      
      // create the layout for the explorer
      //  <div class='span-1'></div>
      //  <div class='dept-explorer span-6'>
      //     <div class='breadcrumb'/>
      //     <div class='svg-container'/>
      //  </div>
      var target = container.append(
          $('<div>').addClass("dept-explorer span-8").css({margin : "0px"})
            .append(
                $('<div>').addClass("breadcrumb well border-all span-2").css({'margin':'0px', "padding" : "0px"}),
                $('<div>').addClass("svg-container well span-6 border-all ").css({"margin" : "0px", "padding" : "0px"})
            )
          ).find('.svg-container');

      chart.dispatch.on("dataClick.breadcrumb",function(d){

        var pointer=d,parents = [],crumbs,containers, height=50,scale,svg,
             // assuming a container setup of span-8
            span_width = container.width()/4;
        // walk up the parent chain and collect them
        while (typeof pointer.parent != "undefined"){
          parents.push(pointer.parent);
          pointer = pointer.parent;
        }
        parents.unshift(d);
        parents.reverse();

        scale = d3.scale.linear().domain([0,parents[0].r]).range([2,height/2]);

        d3.select(".info_graph_link").remove();

        crumbs = d3.select(".breadcrumb").selectAll("div.crumb")
          .data(parents,function(x){return x.rid;});

        crumbs.exit().remove();

        containers = crumbs
          .enter()
          .append("div")
          .attr("class",'crumb float-left')
          .style({
           "margin-top":"10px",
           "width": "100%"
          });
        containers
          .append("div")
          .on("click",chart.dispatch.dataClick)
          .style( "height",height+10+"px")
          .append("svg")
          .attr("width","100%")
          .append("g")
          //.attr("transform", function(){
          //  return  "translate("+span_width/2-scale(d.r)/2+",0)"
          //})
          .append("circle")
          .attr({ cx : span_width/2, cy : height/2, r : function(d){return scale(d.r)} })

        containers
          .append("div")
          .attr({ "class" : "align-center" }) 
          .html(function(d){return d.name + ' - '+ app.formater("compact",d._value)});

        if (d.accronym){
          d3.select(".breadcrumb")
            .append("div")
            .attr("class","info_graph_link float-left align-center")
            .style({
              "margin-top":"10px",
              "margin-right":"10px",
              "width": "100%"
            })
            .append("a")
            .attr("class","router")
            .attr("href","#infograph-"+d.accronym)
            .html(app.get_text("org_infograph"))
        }

        d3.select(".breadcrumb .clear").remove();
        d3.select(".breadcrumb").append("div").attr("class","clear");

      });

      chart(target);
      // set the breadcrumb trail container height to that of the main container
      setTimeout(function(){
        container.find(".breadcrumb").css("min-height", container.find(".svg-container").height());
      });
    };

})();

