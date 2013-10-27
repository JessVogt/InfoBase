(function(){

  var APP = ns('APP');
  var TOOLTIP = ns('D3.TOOLTIP');

  TOOLTIP.basetooltip = Backbone.View.extend({
    initialize: function(){
      _.bindAll(this,"render","un_render");
      this.data = this.options.data;
      this.offsetx = this.options.offsetx || 0;
      this.offsety = this.options.offsety || 0;
      this.top = Math.round(this.options.top);
      this.left = Math.round(this.options.left);
    },
    init_body : function(){
      var template = APP.t(this.template);
      this.body = template({
       items : this.data 
      });
    },
    render : function(event){

      var top = (this.top || (event.pageY+this.offsety))+"px";
      var left =(this.left ||  (event.pageX+this.offsetx))+"px";
      this.$el = $('<div>');
      if (this.options.body_func){
        this.options.body_func(this.$el);
      }
      else {
        this.init_body();
        this.$el.append(this.body);
      }
      this.$el
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
      return this;
    }
    ,un_render : function(event){
      this.$el.remove();
      this.$el = null;
    }
  });

  TOOLTIP.TableGraph = TOOLTIP.basetooltip.extend({
    template : '#tablegraph_tooltip'
  });

  TOOLTIP.ExploreTooltip = TOOLTIP.basetooltip.extend({
    template : '#tablegraph_tooltip'
  });

})();
