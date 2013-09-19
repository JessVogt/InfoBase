$(function () {
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');

  // attach all the graphs to their respective views
  APP.dispatcher.once("load_tables",function(app){
    var add_graph_view = function(table){
      if (_.has(GRAPHS.views, table.get("id"))){
        table.set("graph_view", GRAPHS.views[table.get("id")]);
      }
      else if (table.get("graph_view")){
        table.set("graph_view", GRAPHS.BaseGraphView.extend(table.get("graph_view")));
      }
    }
    TABLES.tables.each(add_graph_view);
    TABLES.tables.on("add",add_graph_view);
  });

  GRAPHS.BaseGraphView = Backbone.View.extend({
    template : "#graph_grid_t"
    ,events : {
     'keyup input.filter' : "filter_search"
    }
    ,filter_search : function(event){
      var input = $(event.target);
      var val = input.val();
      var lis = input.parents(".sidebar").find("li");
      if ( val.length < 3){
        lis.removeClass("ui-screen-hidden");
        return;
      }
      lis.each(function(){
        if ($(this).text().toLowerCase().search(val) == -1){
          $(this).addClass("ui-screen-hidden");
        }
      });
    }
    ,central_votes : true
    ,initialize: function () {
      this.template = APP.t(this.template);
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

      this.footnotes = this.options['footnotes'].concat(
        _.map(this.footnote_keys,
              function(key){ return this.gt(key);},
          this)
      );

      if (this.dept.accronym == 'TBC' && 
          !this.central_votes){
        this.data = _.filter(this.data,
            function(row){
              if (_.isNumber(row[0])){
               return row[0] < 2; 
              } else {
               return true
              } 
            });
        this.footnotes = this.footnotes.concat( [
          this.gt("tbs_hide_central")
        ]);
      }

      this.lang = this.app.state.get('lang');
      this.headings = this.def['headers'][this.lang];
      this.name = this.def['name'][this.lang];
      this.prep_data();
      //this.gc = function(indexes){return this.get_col(this.data,indexes)};
    }
    
    ,prep_data : function(){
    }
    ,make_id : function(suffix){
      return this.dept['accronym'] + this.key + "_" + suffix
    }
    ,get_col : function(rows,index){
       return _.pluck(rows,index);
    }
    ,get_cols : function(rows,indexes){
      return _.zip.apply(this,_.map(indexes,
          function(index){
            return this.get_col(rows,index);
          },this));
    }
    ,set_side_bar_highlight : function(event){
      $(event.target).parent().siblings().removeClass("background-medium");
      $(event.target).parent().addClass("background-medium");
    }
    ,remove : function(event){
      this.$el.off("click");
    }
  });

  GRAPHS.views = {}

  var make_axes = function(ticks){
    // trim any long ticks down to no more than 50
    // characters
    var ticks = _.map(ticks,
        function(tick){
          if (tick.length > 50) {
            return tick.substring(0,30)+"...";
          }
          return tick;
        });
    return {
          xaxis : {
            renderer: $.jqplot.CategoryAxisRenderer
            ,ticks : ticks 
            ,tickOptions : {fontSize: "10px"}
          }
          ,yaxis: { 
            tickOptions: { fontSize: "11px" } 
          }
    };
  };


  var seriesColors =  ['#4d4d4d',
  '#2b6c7b', '#a3d6e3', '#3e97ab', '#cfc7a9',
  '#919191', '#e0e0e0', '#c3e4ec', '#595959' ];
  var negativeSeries =  ['#cc2e29']

  GRAPHS.pie = function(id,data,options){
    if (_.any(data[0], function(point){ return point[1] < 0 })) {
      var bar_data = _.pluck(data[0],1);
      var ticks = _.pluck(data[0],0);
      GRAPHS.bar(id,
          [bar_data],
          _.extend(options,{
            ticks : ticks,
            legend : {show:false},
            footnotes : [],
            rotate: true})
      );
      return
    }
    var o = {
      seriesColors : seriesColors
      ,legend : {
        show:true 
        ,fontSize : "8px"
        ,location:'s'
        ,rendererOptions: {numberColumns: 2}
        ,marginTop : "0px"
        ,marginBottom: "0px"
        ,rowSpacing : "0em"
      }
      ,seriesDefaults : {
        renderer:$.jqplot.PieRenderer, 
        trendline:{ show:false }, 
        rendererOptions: { 
          dataLabelThreshold:1.5,
          diameter : 220,
          padding: 20,
          sliceMargin: 0,
          dataLabelPositionFactor: 1.2,
          showDataLabels : true,
          highlightMouseOver: options['highlight'] || false
          }
      }
      ,title : TABLES.m(options['title'] || "")
    };
  $('#'+id).html("");
  $('#'+id+"_fn").html("");
   _.each(options.footnotes || [],
       function(fn){
        $('#'+id+'_fn').append("<p><small>"+fn+"</small></p>");
       }
   );
   var plot =  $.jqplot(id,data, o);
   return plot;
  };

  GRAPHS.bar = function(id,data,options){
    options['ticks'] = _.map(options.ticks,TABLES.m);
    var o = {
      seriesColors : seriesColors
      ,negativeSeriesColors  :  negativeSeries
      ,legend : options['legend'] || {
        show:true 
        ,renderer: $.jqplot.EnhancedLegendRenderer
        ,placement: "outsideGrid"
        ,fontSize : "10px"
        ,rendererOptions: {numberRows:1}
        ,location:'s'
      }
      ,stackSeries : false
      ,seriesDefaults : {
        fillToZero: true
        ,renderer:$.jqplot.BarRenderer
        ,rendererOptions: {
          highlightMouseOver: options['highlight'] || false
          ,barWidth: options['barWidth'] || 30
        }
      }
      ,axes : make_axes(options['ticks']) || {}
      ,title : options['title'] || ""
      ,highlighter: {
              show: true,
              sizeAdjust: 7.5
            }
    };
    if (_.has(options,'rotate')){
      o['axes']['xaxis']['tickRenderer'] = $.jqplot.CanvasAxisTickRenderer;
      o['axes']['xaxis']['tickOptions']['angle'] = -30;
    }
    if (_.has(options,'series')){
      o['series'] =  _.map( options['series'],function(obj){
        return {label : TABLES.m(obj.label)}
      });
    }
    if (_.has(options,'stackSeries')){
      o['stackSeries'] = options['stackSeries'];
    }
  $('#'+id).html("");
  $('#'+id+"_fn").html("");
   _.each(options.footnotes || [],
       function(fn){
        $('#'+id+'_fn').append("<p><small>"+fn+"</small></p>");
       }
   );
   var plot =  $.jqplot(id,data, o);
   var app = ns().APP.app;
   $('#'+id+' .jqplot-yaxis-tick').html(function(){
     return app.formater('big-int',$(this).html());
   });
   return plot
  };

  GRAPHS.fix_bar_highlight  = function (plot, data,ticks,app, data_type){
    data_type = data_type || "big-int";
    _.each(plot.series,function(s,i){
      s.data = _.map(ticks, function(tick,j){
        var val =  app.formater(data_type,s.data[j][1]);
        return [tick,val];
      });
    });
  };

});


