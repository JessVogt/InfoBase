(function() {
    var D3 = ns('D3');
    var TABLES = ns('TABLES');

    var seriesColors = ["#98abc5", "#8a89a6", 
          "#7b6888", "#6b486b", "#a05d56", "#d0743c", 
          "#ff8c00"];
    var seriesColors = ['#4d4d4d',
      '#2b6c7b', '#a3d6e3', '#3e97ab', '#cfc7a9',
      '#919191', '#e0e0e0', '#c3e4ec', '#595959' ];

    var color = d3.scale.ordinal()
      .range(seriesColors);

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
        options.is_mini = options.height < 200;

        function my(selection){
          selection.each(function(i){
             chart.call(options,d3.select(this),i);
          });
          return my;
        }

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

    D3.bar = D3.extend_base(function(selection,index){
      /* data in the format of 
       *  { "series 1" : [y1,y2,y3],
       *     "series 2" : [y1,y2,y3]}
       */
      var margin = this.margin || {top: 20, 
                                    right: 20, 
                                    bottom: 30, 
                                    left: 40};
      var height = this.height;
      var y_axis = this.y_axis || '';
      var legend = this.legend;
      var y_range_top = this.is_mini ? 0 : legend.length * 20 + 20;
      var series = d3.keys(this.series);
      var values = d3.values(this.series);
      var data = _.map(this.series,function(data,series_name){
        return {series_name : series_name,
                data :  _.map(data, function(d,i){
                  return {name : legend[i],
                          val : d};
                })};
      });
      /*  x0 scale sets out the chunks of space for each 
       *  of the series
       *  x1 uses the chunks of space from x0 to then create 
       *  sub-spaces for each of the labels
       *  y maps the domain of the input data onto the available 
       *  height
       *  max->merge will merge all the arrays into a single
       *  and fine the max value 
       */  
      var x0 = d3.scale.ordinal()
        .domain(series)
        .rangeRoundBands([0, this.width], .1);
      var x1 = d3.scale.ordinal()
        .domain(legend)
        .rangeRoundBands([0,x0.rangeBand()]);
      var y = d3.scale.linear()
              .range([this.height, y_range_top])
              .domain(d3.extent(d3.merge(values)));
      /*
       * Create the main graph area and add the bars
      * set up the axes  
      */
      var svg = selection.append("svg")
                .attr({
                  width : this.width + margin.left + margin.right,
                  height : this.height + margin.top + margin.bottom})
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      var xAxis = d3.svg.axis()
          .scale(x0)
          .orient("bottom");
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("right")
          .ticks(6)
          .tickSize(this.width)
          .tickFormat(d3.format(this.yAxisTickFormat || ".2s"));

      if (!this.is_mini){
        make_legend(svg,this.width);
      } else {

        yAxis.tickSize(1);
        xAxis.tickSize(1);
        yAxis.tickValues(y.domain());

        var legend_height = legend.length * 20; 
        var canvas = d3.selectAll("svg.legend")
          .data([1])
          .enter()
          .append("svg")
          .attr({
            class : "legend",
            width  : '200px',
            height : legend_height + 'px'
        });
        make_legend(canvas, 200);
        new D3.tooltip({
          body: canvas.node(), 
          tipper : svg.node(),
          height : legend_height
        });
      }

      svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + y(0) + ")")
            .call(xAxis);

      svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .call( function (g) {
              g.selectAll("text")
                  .attr("x", 4)
                  .attr("dy", -4);
            })
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(y_axis);

      var groups = svg.selectAll(".group")
            .data(data)
          .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d.series_name) + ",0)"; });

      groups.selectAll("rect")
          .data(function(d) { return d.data; })
        .enter().append("rect")
          .attr( "width", x1.rangeBand())
          .attr( "x", function(d) { return x1(d.name); })
          .attr("y", function(d) {  
            if (d.val > 0){
              return y(d.val); 
            } else {
              return y(0);
            }
          })
          .attr("height", function(d) { 
             if (d.val >= 0){
               return y(0) - y(d.val);
             } else {
               return y(d.val) - y(0);
             }
           })
          .style("fill", function(d) { return color(d.name); });

      function make_legend(sel,width){

        var el = sel.selectAll(".legend")
              .data(legend)
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        el.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        el.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

        return el;
      }

      if (!this.is_mini){

      } else {
        svg.selectAll("g.axis path").remove();
        svg.selectAll("g.x").attr("transform" , "translate(0,"+height+")");
      }
    });

    D3.pack = D3.extend_base(function(selection,index){


    });

    D3.pie =  D3.extend_base(function(selection,index){


    });


    D3.BaseGraphView = Backbone.View.extend({
      initialize: function () {
        _.bindAll.apply(this,[this].concat(_.functions(this)));
        this.key = this.options["key"];
        this.app = this.options["app"];
        this.def = this.options["def"];

        this.state = this.app.state;
        this.dept = this.state.get('dept');
        this.lang = this.state.get("lang");
        this.raw_data = this.dept.tables[this.key];
        this.mapped_objs = this.dept.mapped_objs[this.key][this.lang];
        this.data = this.options['data'];

        this.gt = this.app.get_text;

        this.lang = this.app.state.get('lang');
        this.name = this.def['name'][this.lang];
        this.prep_data();
        //this.gc = function(indexes){return this.get_col(this.data,indexes)};
      }
      ,prep_data : function(){

      }
    })

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

    var rotate_point = function(x,y,theta){
      return [
         x*Math.cos(theta) - y*Math.sin(theta),
         x*Math.sin(theta) + y*Math.cos(theta)
        ];
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
                  ,xy : rotate_point(300,0,scale(i))
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
