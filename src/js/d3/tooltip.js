(function(){

  var APP = ns('APP');
  var TOOLTIP = ns('D3.TOOLTIP');

  D3.basetooltip = Backbone.View.extend({
    initialize: function(){
      _.bindAll(this,"render","un_render");
      this.data = this.options.data;
      this.init_body();
    },
    init_body : function({
      var template = APP.t(this.template);
      this.body = template(
       items : this.data 
      );
    })
    render : function(event){
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

    }
  });

  D3.TableGraph = D3.basetooltip({
    template : '#tablegraph_tooltip'
  });

})();
