(function() {
    var D3 = ns('D3');
    var TABLES = ns('TABLES');
    var APP = ns('APP');

    D3.orange_purple_color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", 
          "#7b6888", "#6b486b", "#a05d56", "#d0743c", 
          "#ff8c00"]);

    D3.tbs_color = d3.scale.ordinal()
      .range(['#4d4d4d',
      '#2b6c7b', '#a3d6e3', '#3e97ab', '#cfc7a9',
      '#919191', '#e0e0e0', '#c3e4ec', '#595959' ]);

    D3.rotate_2d_point = function(x,y,theta){
      return [
         x*Math.cos(theta) - y*Math.sin(theta),
         x*Math.sin(theta) + y*Math.cos(theta)
        ];
    }

    D3.get_offset = function(elem){
       return $(elem.node()).offset();
    }

    D3.tooltip = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this,"render","un_render");
        this.body = $(this.options.body);
        this.tipper = $(this.options.tipper);
        this.tipper.on("mouseover",this.render)
      }
      ,render : function(event){
        var top = (event.pageY-10)+"px";
        var left =  (event.pageX-10)+"px";
        this.$el = $('<div>')
          .appendTo('body')
          .css({
            'z-index' : 100,
            'class' : 'tooltip',
            'position' : 'absolute',
            'background' : '#FFF',
            'border' : '1px solid grey',
            'overflow' : 'auto',
            'top' : top,
            'left' :  left
          })
          .append(this.body)
          .on("mouseout",this.un_render);
        return this;
      }
      ,un_render : function(event){
        this.body.remove();
        this.$el.remove();
        this.$el = null;
      }
      ,remove : function(){
        this.tipper.off("mouseover");
      }
    });


    D3.extend_base = function(chart){
      return function(options){
        options = options || {};
        options.height = options.height || 400;
        options.width = options.width || 800;
        options.is_mini = options.width < 200;
        options.hover_legend = options.hover_legend || true;

        function my(selection){
          selection.each(function(i){
            var svg = d3.select(this)
                .append("svg")
             chart.call(options,svg,i);
          });
          return my;
        }

        my.dispatch = options.dispatch = d3.dispatch('dataHover',"dataClick");

        my.options =  function(){
          return options;
        };

        my.series = function(value) {
          if (!arguments.length) return series;
          options.series = value;
          return my;
        };

        my.is_mini = function(value) {
          if (!arguments.length) return is_mini;
          options.is_mini = value;
          return my;
        };

        my.width = function(value) {
          if (!arguments.length) return width;
          options.width = value;
          return my;
        };

        my.height = function(value) {
          if (!arguments.length) return height;
          options.height = value;
          return my;
        };

        return my;
      }
    };

    D3.pack_data = function(data, level_name,accessor,levels){
      accessor = accessor || function(d){return d.value;};
      levels = levels || 2;
      var extent = d3.extent(_.map(data,accessor));
      var scale = d3.scale.log().domain(extent).rangeRound([0,levels]);
      var groups = d3.nest()
        .key(function(d){ return scale(accessor(d));})
        .sortKeys(d3.descending)
        .entries(data);
      var rtn = {name: '',children:groups[0].values};
      var pointer = rtn.children;
      for (var _i=1;_i<groups.length; ++_i){
        pointer.push({
          name : level_name,
          children : groups[_i].values
        });
        pointer = _.last(pointer).children;
      }
      return rtn;
    };

    D3.soften_spread = function(data,p,attr){
      p = p || 0.1;
      attr = attr || 'value';
      var accessor = function(d){return d[attr]};
      var max = d3.max(data,accessor);
      var map = d3.scale.linear().domain([0,max]).range([p*max,max]);
      _.each(data, function(d){
        d[attr] = map(d[attr]);
      });
      return data
    }

    var quantize_minstries = function(depts){
      var min_size = _.chain(depts)
        // group by the ministry value 
        // {min_name: [depts] ....
        .groupBy(function(x){ return x.min})
        // transform the departments into a sum of their expenditures
        // {min_name : ### ....
        .map(function(depts,key){ 
           return [key,
                   _.reduce(depts,function(x,y){ 
                       return x+y.value; 
                      },0)
                  ];
         })
         // result is now [[min_name],[min_size]]...
         .value();
      // interrupt the chaining to extract the max min size to create 
      // the log scale
      var max_min_size =  _.max(min_size, function(x){ return x[1]})[1];
      var scale = d3.scale.log()
                     .domain([1,max_min_size])
                     .rangeRound([1,5]);
      return  _.chain(min_size)
        // tnrasform to {scaled_size : [[min_name,fin_size],...
        .groupBy(function(min_size){
          return scale(min_size[1]);
         })
         // transform to [scaled_size ,[min_name1, min_name2]...
        .map(function(val,key){
          return [key, _.map(val,function(x){ return x[0]})];
         })
        // turn into object
        // {scaled_size : [min_name1, min_name2]...
        .object()
        .value();
    }

    var construct_packing_hierarchy = function(lang){
      var scale = d3.scale.linear()
        .domain([0,30000000])
        .range([2500000, 30000000]);
      var no_gov = _.chain(depts)
        .map(function(d){
          var fin_size = Math.abs(d.fin_size);
          if (fin_size < 30000000){
            fin_size =  scale(fin_size);
          }
          return {name: d.dept[lang],
                  accronym : d.accronym,
                  value : fin_size,
                  fin_size : d.fin_size,
                  min : d.min[lang]};
        })
        .filter(function(d){
           return d.accronym != 'ZGOC';})
        .value();
      var ministries = _.groupBy(no_gov,"min");
      var min_levels =  quantize_minstries(no_gov);
      //
      min_levels = _.object(_.map(min_levels, function(min_names,level){
         return [level,_.map(min_names,function(x){ 
           var departments =  ministries[x];
           _.each(departments,function(x){ x.level = parseInt(level) - 1});
           return {name : x,  children : departments}
         })];
      }));
      //
      var levels = _.sortBy(_.map(_.keys(min_levels),function(x){return parseInt(x)}));
      //
      var struct = {
        name : "smaller"
        ,level : _.first(levels)
        ,children :  min_levels[_.first(levels)]
      }
      //
      _.each(_.tail(levels),function(level){
        struct = {name : "smaller"
                  ,children : [struct].concat(min_levels[level]) };
      });
      struct.name = "";
      return struct;
    }


    D3.bubleDeptListTip = Backbone.View.extend({
      initialize: function(){
        _.bindAll(this,"render");
        this.data = this.options.data;
      },
      render : function(){
        this.$el = $('<div>')
          .appendTo('body')
          .css({
            'z-index' : 100,
            'width' : '200px',
            'position' : 'absolute',
            'background' : '#FFF',
            'border' : '1px solid grey',
            'top' : this.data.absolute_zoom_pos.y + 20,
            'left' :  this.data.absolute_zoom_pos.x + 20 ,
          })
          .html(this.data.name+ " " + this.data.fin_size);
        return this;
      }
    });

    D3.bubleDeptList = Backbone.View.extend({
      el : 'body'
      ,radius : 800
      ,height : 800
      ,x_scale : d3.scale.linear()
      ,y_scale : d3.scale.linear()
      ,events : {
       "click a.gov_uni" : "render"
      }
      ,initialize: function(){
        _.bindAll(this,"render","re_draw","on_circle_click",
          "start_hover","stop_hover","apply_scales");
        this.x_scale.range([0,this.radius]);
        this.y_scale.range([0,this.radius]);
        this.pack=  d3.layout.pack()
                      .size([this.radius,this.radius])
                      //.sort(null)
        this.pack.margin = 10;
        this.app = this.options['app'];

      }
      ,render :function() {
        if (this.node){
          $('#gov_bubble').show();
          this.re_draw();
          return;
        }
        var width = $('#app').width();

        var lang = this.app.state.get("lang");
        //strip out unneeded data and correct negative numbers
        var root =  construct_packing_hierarchy(lang);
        // set the current level 
        this.nodes = this.pack.nodes(root);
        this.app.app.hide();
        this.vis = d3.select('#app')
            .append('svg')
            .attr("id","gov_bubble")
            .attr({width : width,height:this.height})
            .append('g')

        this.on_circle_click(this.nodes[0]);
      }
      ,zoom_position: function(x,y){
        return {x: this.x_scale(x),y:this.y_scale(y)};
      }
      ,absolute_zoom_position : function(x,y){
        var offset =$('#gov_bubble').offset();
        var pos = this.zoom_position(x,y);
        return {x:pos.x+offset.left,y:pos.y+offset.top};
      }
      ,apply_scales : function(node){
        node.zoom_pos = this.zoom_position(node.x,node.y);
        node.absolute_zoom_pos = this.absolute_zoom_position(node.x,node.y);
        node.zoom_r = this.k * node.r;
      }
      ,re_draw : function(){
        _.each(this.nodes,this.apply_scales);
        var node = this.node;
        var depth = node.depth;

        // filter to the ondes which are being drawn
        // i.e. the current depth plus 2 down
        var nodes = _.filter(this.nodes,function(d){
          return d.depth <= depth +2 ;
        });
        // join the filtered data to the circles
        var circle = this.vis.selectAll(".node")
            .data(nodes,function(d){ return d.name+d.depth});


        // filter to the ondes which are being drawn
        // i.e. only those who are children of the current node
        var nodes_with_text =  _.filter(this.nodes,function(d){
          return _.indexOf(node.children,d) != -1;
        });           

        // join the filtered data to any divs with labels
        var text = d3.selectAll("div.svg_label")
              .data(nodes_with_text,function(d){ return d.name+d.depth})

        circle
          .enter().append("g")
          .attr("class","node")
          .append("circle")
          .on("click", this.on_circle_click)
          .on("mouseover", this.start_hover)
          .on("mouseout", this.stop_hover)

        circle.selectAll("circle")
          .transition()
          .attr({
            "class" : function(d) { 
               if (d.depth == 0) {
                 return  "grand-parent"; 
               } else if (d.depth <=  depth+1 ) {
                 return "parent" ;
               } else if (d.depth == depth +2){
                 return  "child"; 
               }
            }
            ,"cx": function(d) { return d.zoom_pos.x; }
            ,"cy": function(d) { return d.zoom_pos.y; }
            ,"r" : function(d) { return  d.zoom_r; }
          })

        circle.exit().remove();

        text
          .enter()
            .append("div")
            .attr("class","svg_label")
            .on("mouseover", this.start_hover)
            .on("mouseout", this.stop_hover)

        text
         .style({
           top : function(d){ return d.absolute_zoom_pos.y - d.zoom_r + 20 + "px"}
           ,left: function(d){ return d.absolute_zoom_pos.x - d.zoom_r/2 + "px"}
           ,position: "absolute"
           ,"color" : "steelblue"
           ,'font-size': "6px"
           ,"text-align" : "centre"
           ,width: function(d){return d.zoom_r - 10 +'px'}
         })
         .text(function(d) { 
           if (d.zoom_r > 30){
            return d.name; 
           }
         })

        text.exit().remove();

      }
      ,show_dept : function(){
        //remove circles and text
        // and center the current department in question
        d3.selectAll("div.svg_label").remove();
        var departments = this.vis.selectAll(".node")
            .data([this.node],function(d){ return d.name+d.depth})
        departments.exit().remove();
        departments
          .transition()
          .duration(1000)
          .attr({
           "transform" : "translate(600,400)"
          }).selectAll("circle")
          .attr({
            "cx" : 0
            ,"cy" : 0
            ,"r" : 100
          })

        // quick scale to evenly map the angle around 
        // the circle
        var scale = d3.scale.linear()
          .domain([0,TABLES.tables.length])
          .range([0,2*Math.PI]);

        var tables = TABLES.tables.map(function(m,i){
          return {model: m
                  ,xy : D3.rotate_2d_point(300,0,scale(i))
                  ,name : m.get('name')['en']
                  ,coverage : m.get("coverage")
          }
        });

        var nodes = this.vis
          .append("g")
          .attr({
            "class" : "node",
            "transform" : "translate(600,400)"
          })
          .selectAll(".node")
          .data(tables)
          .enter()
          .append("g")
          .attr({
            "class" : "node"
          });

        nodes
          .append("circle")
          .attr({ "cx" : 0, "cy" :0, "r" : 1 })
          .transition()
          .duration(500)
          .delay(1000)
          .attr({
            "transform" : function(d,i){
              return "translate("+d.xy[0] +","+ d.xy[1]+")";
            }
            ,"r" : 100
            ,"class" : "widget"
          })

        nodes
          .append("text")
          .transition()
          .duration()
          .delay(1700)
          .attr({
            "dy" : ".31em"
            ,"text-anchor" : "middle"
            ,"transform" : function(d,i){
              return "translate("+d.xy[0] +","+ (d.xy[1]-110)+")";
            }
          })
          .text(function(d){ return d.name})
        nodes
          .append("text")
          .transition()
          .duration()
          .delay(1700)
          .attr({
            "dy" : ".31em"
            ,"text-anchor" : "middle"
            ,"transform" : function(d,i){
              return "translate("+d.xy[0] +","+ (d.xy[1]+110)+")";
            }
          })
          .text(function(d){ return d.coverage})


        //APP.app.state.set('dept',depts[data.accronym]);
        //this.hide();
        //this.app.app.show();
      }
      ,on_circle_click : function(data){
         var node = this.node = data;
         this.k = this.radius / node.r / 2;
         this.x_scale.domain([node.x - node.r, node.x + node.r]);
         this.y_scale.domain([node.y - node.r, node.y + node.r]);
         // if the current node has any children
         if (node.children){
          this.re_draw();
         }
         else {
           this.show_dept();
         }
      }
      ,start_hover : function(data){
        console.log("hover");
        if (this.tooltip){
          this.tooltip.remove();
        }
        if (data.depth > this.node.depth){
          this.tooltip = new APP.bubleDeptListTip({
            data:data
          });  
          this.tooltip.render();
        }
      }
      ,stop_hover : function(){
        if (this.tooltip){
          this.tooltip.remove();
        }
      }
      ,hide : function(){
        $('#gov_bubble').children().remove();
        $('.svg_label').remove();
      }
    });
})();
