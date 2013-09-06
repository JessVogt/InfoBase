(function() {
    var D3 = ns('D3');


    D3.pack = D3.extend_base(function(selection,index){
      var radius = this.options.radius;
      var x_scale : d3.scale.linear().range([0,this.radius]);
      var y_scale : d3.scale.linear().range([0,this.radius]);
      var pack=  d3.layout.pack()
      .size([this.radius,this.radius]);

      var svg = selection
          .append('svg')
          .attr({
            "id":"gov_bubble",
            "width": width,height:this.height})
          .append('g')

    });

})();

