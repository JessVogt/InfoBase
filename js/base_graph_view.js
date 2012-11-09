$(function () {
  var GRAPHS = ns('GRAPHS');
  var APP = ns('APP');

  GRAPHS.BaseGraphView = Backbone.View.extend({

    central_votes : true
    ,initialize: function () {
      _.bindAll(this);
      this.key = this.options["key"];
      this.data = this.options["data"];
      this.app = this.options["app"];
      this.def = this.options["def"];
      this.dept = this.options['dept'];
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
  });

  GRAPHS.views = {}

  var make_axes = function(ticks){
    // trim any long ticks down to no more than 50
    // characters
    ticks = _.map(ticks,
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
            tickOptions: { formatString: "$%'d",fontSize: "10px" } 
            ,label : "$K"
          }
    };
  };


  var seriesColors =  [
  '#2b6c7b', '#a3d6e3', '#3e97ab', '#cfc7a9',
  '#919191', '#e0e0e0', '#c3e4ec', '#595959' ];

  GRAPHS.pie = function(id,data,options){
    if (_.any(data[0], function(point){ return point[1] < 0 })) {
      var bar_data = _.pluck(data[0],1);
      var ticks = _.pluck(data[0],0);
      GRAPHS.bar(id,
          [bar_data],
          _.extend(options,{ticks : ticks,
           legend : {show:false},
           footnotes : []})
      );
      return
    }
    var o = {
      seriesColors : seriesColors
      ,legend : {
        show:true 
        ,placement: "outsideGrid"
        ,fontSize : "10px"
        ,location:'e'
      }
      ,seriesDefaults : {
        renderer:$.jqplot.PieRenderer, 
        trendline:{ show:false }, 
        rendererOptions: { 
          dataLabelThreshold:2,
          padding: 40,
          sliceMargin: 0,
          dataLabelPositionFactor: 1.1,
          showDataLabels : true,
          highlightMouseOver: options['highlight'] || false
          }
      }
      ,title : options['title'] || ""
    };
  $('#'+id).html("");
  $('#'+id+"_fn").html("");
   _.each(options.footnotes || [],
       function(fn){
        $('#'+id+'_fn').append("<p><small>"+fn+"</small></p>");
       }
   );
   return $.jqplot(id,data, o);
  };

  GRAPHS.bar = function(id,data,options){
    var o = {
      seriesColors : seriesColors
      ,legend : options['legend'] || {
        show:true 
        ,placement: "outsideGrid"
        ,fontSize : "10px"
        ,rendererOptions: { numberRows: 1 }
        ,location:'s'
      }
      ,stackSeries : true
      ,seriesDefaults : {
        fillToZero: true
        ,renderer:$.jqplot.BarRenderer
        ,rendererOptions: {
          highlightMouseOver: options['highlight'] || false
          ,barWidth: 30
        }
      }
      ,axes : make_axes(options['ticks']) || {}
      ,title : options['title'] || ""
    };
    if (_.has(options,'series')){
      o['series'] = options['series'];
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
   return $.jqplot(id,data, o);
  };
});

