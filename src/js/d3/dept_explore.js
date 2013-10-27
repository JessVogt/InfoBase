(function() {
    var D3 = ns('D3'),
    TOOLTIP = D3.TOOLTIP,
    PACK = ns('D3.PACK'),
    TABLES = ns('TABLES');

    D3.bubbleDeptList =  function(app){
      return new _bubbleDeptList(app);
    }

    _bubbleDeptList = function(app){
       var lang = app.state.get("lang"),

      // use crossfilter to group the departments by
      // minisries and then do a reduce sum to extract the fin size
      // of each ministry
        min_sizes = depts_cf
        .min
        .group()
        .reduceSum(function(x){return Math.abs(x.fin_size)}),
      // extract the ministries ordered by fin_size and drop the first
      // since it's the GoC
         ministries = _.tail(min_sizes.top(Infinity));
      _.each(ministries,function(min){
        min.name = min.key
        min.fin_size = min.value;
        min.children = depts_cf.min.filter(min.key).top(Infinity);
        _.each(min.children, function(dept){
           dept.value = Math.abs(dept.fin_size);
           dept.name = dept.dept[lang];
        });
        PACK.soften_spread(min.children);
      });
      // pack the data using a specialised scale to create a two level
      // packing
      var data = PACK.pack_data(ministries,app.get_text("smaller_orgs"),{
        soften : false,
        scale : d3.scale.log()
          .domain([_.last(ministries).value,ministries[0].value])
          .rangeRound([10,11])
      });
      data.name = app.get_text("goc_total");
      data.fin_size = depts.ZGOC.fin_size;

      var chart = PACK.pack({
        width: 880, 
        height: 880,
        data: data
      });

      var width = app.app.width();
      var xoffset =(this.width - this.raidus)/2;
      app.app.hide();
      
      // create the layout for the explorer
      //  <div class='span-1'></div>
      //  <div class='dept-explorer span-6'>
      //     <div class='breadcrumb'/>
      //     <div class='svg-container'/>
      //  </div>
      var target = $('#app').append(
          $('<div>').addClass("span-1"),
          $('<div>').addClass("dept-explorer span-6")
            .append(
                $('<div>').addClass("breadcrumb well border-all span-6").css({'margin-bottom':'20px'}),
                $('<div>').addClass("svg-container well border-all")
            )
          ).find('.svg-container');

      chart.dispatch.on("dataMouseEnter",function(d){
        var depth = chart.options().depth, rows,headers,footer,rowseach,
            tdseach,headers_class,current_d = chart.options().node,
            fmt =function(x){return app.formater('big-int',x)};
        // if mousing over the top level circle, exit immediately
        // if mousing over nodes which aren't the direct parent or 
        // children of the current node, exit immediatley
        if (d.depth === 0){return;}
        if (!_.contains([current_d, current_d.parent].concat(current_d.children),d)){
          return;
        }
        // if the node has a "dept"  attribute, then it's a department
        // otherwise it's a ministry or collection of smaller ministries
        if (d.dept){
          // extract some relevant fields to show in the tooltip for tihs
          // department
          rows =[ 
             [app.get_text("legal_name"),d.legal_name[lang]],
             [app.get_text("type"),d.type[lang]],
             [app.get_text("mandate"),_.map(d.mandate,function(x){
               return x[lang];
             }).join(" ")],
          ];
          // finish with the site of spending
          footer =  [app.get_text('financial_size'),fmt(d.fin_size)];
          headers = ['Information','Value'];
          headers_class =  ['left_text',''];
          tdseach = function(d,i){
            if (i === 3){
              d3.select(this).select("td:last").style("width","200px");
            }
          }
        } else {
          // collect all the children by name and financial size
          rows = _.map(d.children,function(c){
            return [c.name, fmt(c.fin_size)];
          });
          //  add a total line
          footer = [d.name,fmt(d.fin_size)];
          headers = [app.get_text('financial_size'),'($000)'];
          headers_class =  ['left_text','right_number'];
        }
        // this function will be called per row creation
        rowseach = function(d,i){
          if (d===footer){
            d3.select(this).attr("class","info-row");
          }
        };
        // remake the headers to be [[]]
        headers = [headers];
        // push the footer onto the rows
        rows.push(footer);

        TABLES.prepare_data({
          rows : rows,
          headers : headers,
          headers_class : headers_class,
          dup_header_options : true
        });
        var tooltip = new TOOLTIP.basetooltip({
          left : d.absolute_zoom_pos.x + d.zoom_r + 10,
          top : d.absolute_zoom_pos.y - d.zoom_r - 10,
          body_func : function(node){
            return TABLES.d3_build_table({
                    table_class : 'table-condensed',
                    table_css : {'width':"700px"},
                    node: node[0],
                    rows : rows,
                    headers:headers,
                    rowseach : rowseach,
                    tdseach : tdseach
                  });
          }
        })
        tooltip.render(d3.event);

        var onleave = function(d){
        // immediately unregister the onleave event
          chart.dispatch.on("dataMouseLeave.tooltip",null);
          if (d.depth === 0){return;}
          tooltip.un_render()
        }
        // listen to the mouseLeave eevent
        chart.dispatch.on("dataMouseLeave.tooltip",onleave);
      });

      chart.dispatch.on("dataClick.breadcrumb",function(d){

        var pointer=d,parents = [],crumbs,containers, height=50,scale,svg;
        // walk up the parent chain and collect them
        while (typeof pointer.parent != "undefined"){
          parents.push(pointer.parent);
          pointer = pointer.parent;
        }
        parents.unshift(d);
        parents.reverse();

        scale = d3.scale.linear().domain([0,parents[0].r]).range([2,height/2]);

        crumbs = d3.select(".breadcrumb").selectAll("div.crumb")
          .data(parents,function(x){return x.name+x.dept;});
        crumbs.exit().remove();
        containers = crumbs
          .enter()
          .append("div")
          .attr("class",'crumb float-left')
          .style({
           "margin-top":"10px",
           "margin-right":"10px",
           "width": "150px"
          })
        containers
          .append("div")
          .on("click",chart.dispatch.dataClick)
          .style( "height",height+10+"px")
          .append("svg")
          .attr("width","100%")
          .append("circle")
          .attr({ cx : 75, cy : 25, r : function(d){return scale(d.r)} })
          .append("text")

        containers
          .append("div")
          .attr({ "class" : "align-center" }) 
          .html(function(d){return d.name + ' - '+ app.formater("compact",d.fin_size)});

        d3.select(".breadcrumb .clear").remove();
        d3.select(".breadcrumb").append("div").attr("class","clear");
      });

      chart(target);
    };

      //,show_dept : function(){
      //  //remove circles and text
      //  // and center the current department in question
      //  d3.selectAll("div.svg_label").remove();
      //  var departments = this.vis.selectAll(".node")
      //      .data([this.node],function(d){ return d.name+d.depth})
      //  departments.exit().remove();
      //  departments
      //    .transition()
      //    .duration(1000)
      //    .attr({
      //     "transform" : "translate(600,400)"
      //    }).selectAll("circle")
      //    .attr({
      //      "cx" : 0
      //      ,"cy" : 0
      //      ,"r" : 100
      //    })

      //  // quick scale to evenly map the angle around 
      //  // the circle
      //  var scale = d3.scale.linear()
      //    .domain([0,TABLES.tables.length])
      //    .range([0,2*Math.PI]);

      //  var tables = TABLES.tables.map(function(m,i){
      //    return {model: m
      //            ,xy : D3.rotate_2d_point(300,0,scale(i))
      //            ,name : m.get('name')['en']
      //            ,coverage : m.get("coverage")
      //    }
      //  });

      //  var nodes = this.vis
      //    .append("g")
      //    .attr({
      //      "class" : "node",
      //      "transform" : "translate(600,400)"
      //    })
      //    .selectAll(".node")
      //    .data(tables)
      //    .enter()
      //    .append("g")
      //    .attr({
      //      "class" : "node"
      //    });

      //  nodes
      //    .append("circle")
      //    .attr({ "cx" : 0, "cy" :0, "r" : 1 })
      //    .transition()
      //    .duration(500)
      //    .delay(1000)
      //    .attr({
      //      "transform" : function(d,i){
      //        return "translate("+d.xy[0] +","+ d.xy[1]+")";
      //      }
      //      ,"r" : 100
      //      ,"class" : "widget"
      //    })

      //  nodes
      //    .append("text")
      //    .transition()
      //    .duration()
      //    .delay(1700)
      //    .attr({
      //      "dy" : ".31em"
      //      ,"text-anchor" : "middle"
      //      ,"transform" : function(d,i){
      //        return "translate("+d.xy[0] +","+ (d.xy[1]-110)+")";
      //      }
      //    })
      //    .text(function(d){ return d.name})
      //  nodes
      //    .append("text")
      //    .transition()
      //    .duration()
      //    .delay(1700)
      //    .attr({
      //      "dy" : ".31em"
      //      ,"text-anchor" : "middle"
      //      ,"transform" : function(d,i){
      //        return "translate("+d.xy[0] +","+ (d.xy[1]+110)+")";
      //      }
      //    })
      //    .text(function(d){ return d.coverage})


      //  //APP.app.state.set('dept',depts[data.accronym]);
      //  //this.hide();
      //  //this.app.app.show();
      //}
      //,on_circle_click : function(data){
      //   var node = this.node = data;
      //   this.k = this.radius / node.r / 2;
      //   this.x_scale.domain([node.x - node.r, node.x + node.r]);
      //   this.y_scale.domain([node.y - node.r, node.y + node.r]);
      //   // if the current node has any children
      //   if (node.children){
      //    this.re_draw();
      //   }
      //   else {
      //     this.show_dept();
      //   }
      //}
      //,start_hover : function(data){
      //  console.log("hover");
      //  if (this.tooltip){
      //    this.tooltip.remove();
      //  }
      //  if (data.depth > this.node.depth){
      //    this.tooltip = new APP.bubleDeptListTip({
      //      data:data
      //    });  
      //    this.tooltip.render();
      //  }
      //}
      //,stop_hover : function(){
      //  if (this.tooltip){
      //    this.tooltip.remove();
      //  }
      //}
      //,hide : function(){
      //  $('#gov_bubble').children().remove();
      //  $('.svg_label').remove();
      //}
})();

