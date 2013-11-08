(function(){

  var D3 = ns('D3');
  
  if (_.keys(D3).length === 0){ return;}

  var PACK = D3.PACK;
  var BAR = D3.BAR;

  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      e.dispatchEvent(evt);
    });
  };

  module("test circle packing code")

  var get_div = function(){
    if ($('#pack_div').length == 0){
      d3.select('body').insert("div").attr("id",'pack_div')
    }
    return  d3.select('#pack_div')
      .append("div")
      .style("float","left");
  }

  circle_test_data = {
     0 : {vname : '',
         children : [
           {
             name : 'A',
             children : [
                {
                   name : 'C',
                   value : 4,
                   children : [
                   ]
                 },{
                   name : 'D',
                   value : 7,
                   children : [
                   ] 
                 }
             ]
           },
           {
             name : 'B',
             value : 4 ,
             children : [
             ]
           },{
             name : 'E',
             value : 7 ,
             children : [
             ]
           }
       ]
     },
     1 : [
            ['a','b','c','d','e','f','g'],
            [9,7,6,3,1,0.5]
         ]
  };

  test("test create_data_nodes",1, function(){
    var data_nodes = PACK.create_data_nodes(
     [1,2,3], ['a','b','c']
    );
    var expected=[
      {value: 1, name : 'a'},
      {value: 2, name : 'b'},
      {value: 3, name : 'c'}
    ];
    deepEqual( expected , data_nodes);
  });

  test("test pack data",1, function(){
    var data = PACK.create_data_nodes(
       circle_test_data[1][1],
       circle_test_data[1][0]
    );
    var level_name = 'smaller';
    var expected = {
      name : '',
      children : [
        data[0],
        data[1],
        data[2],
        {name : level_name,
          children : [
          data[3],
          {name : level_name,
            children : [
              data[4],
              data[5]
            ]
          }
        ]
        }
    ]
    };
    deepEqual(expected , PACK.pack_data(data,level_name));
  });

  test("test soften spread",1, function(){
    var data = [{value: 0.1},{value: 1}, {value: 5},{value: 9}];
    PACK.soften_spread(data,"value",0.1);
    var expected = [
      {value: 0.99},
      {value: 1.7999999999999998},
      {value: 5.4},
      {value: 9}
    ];
    deepEqual(expected,data);
  });


  test("test nested circle structure mini", 0,function(){
    var div = get_div();
    div.style("width",200)
    var pack = PACK.pack({
      data :  circle_test_data[0],
      width : 199
    });
    pack(div);
  });

  test("test flat circle structure mini",0, function(){
    var level_name = 'smallerer';
    var div = get_div();
    div.style("width",150)
    var data = PACK.create_data_nodes(
       circle_test_data[1][1],
       circle_test_data[1][0]
    );
    var packed_data = PACK.pack_data(data,level_name)
    var pack = PACK.pack({
      data :  packed_data,
      width : 150
    });
    pack(div);

  });

  //asyncTest("test hover event", 1,function(){
  //  var div = get_div();
  //  div.style("width",400)
  //  var pack = PACK.pack({
  //    data :  circle_test_data[0],
  //    width : 400
  //  });
  //  pack(div);
  //  pack.dispatch.on("dataMouseEnter",function(d){
  //    if (d.depth===0){return;}
  //    equal(d.name, 'A')
  //    start();
  //    pack.dispatch.on("dataMouseEnter",null);
  //  });
  //});

  asyncTest("test drill down",1, function(){
    var level_name = 'smallerest';
    var div = get_div();
    div.style("width",400)
    var data = PACK.create_data_nodes(
       circle_test_data[1][1],
       circle_test_data[1][0]
    );
    var packed_data = PACK.pack_data(data,level_name)
    var pack = PACK.pack({
      data :  packed_data,
      width : 400
    });
    pack(div);
    pack.dispatch.on("dataClick",function(d){
      equal(d.name, level_name )
      pack.dispatch.on("dataClick",'')
      start();
    });
    setTimeout(function(){
      var node = div.selectAll("circle.parent")
         .filter(function(d){return d.name === level_name })
        .node();
      $(node).d3Click();
    },100)
  });

  test("test bar",0, function(){
    var chart = BAR.bar({
      series :  {'authorities': [10,15,12],
                 'expenditures': [8,5,19]
      },
      ticks : ['2010','2011','2012'],
      height : 400,
      width : 400
    })(get_div().style("width",400));
  });

  test("test bar2",0, function(){
    var chart = BAR.bar({
      series :  {'authorities': [-10,-15,-12],
                 'expenditures': [-8,-5,-19]
      },
      ticks : ['2010','2011','2012'],
      height : 400,
      width : 400
    })(get_div().style("width",400));
  });

  test("test bar3",0, function(){
    var chart = BAR.bar({
      series :  {'authorities': [10,-15,12],
                 'expenditures': [-8,5,-19]
      },
      ticks : ['2010','2011','2012'],
      height : 400,
      width : 400
    })(get_div().style("width",400));
  });

  test("test bar4",0, function(){
    var chart = BAR.bar({
      series :  {'authorities': [10,5,12]
      },
      ticks : ['2010','2011','2012'],
      height : 400,
      width : 400
    })(get_div().style("width",400));
  });

  test("test bar4",0, function(){
    var chart = BAR.bar({
      series :  {'authorities': [10,5,12]
      },
      ticks : ['2010','2011','2012'],
      height : 200,
      width : 200
    })(get_div().style("width",200));
  });
                 
  test("test mini bar4",0, function(){
    var data = [
          {value: 10, name : 'ABC'},
          {value: 12, name : 'ABD'},
          {value: 16, name : 'ABE'},
          {value: 18, name : 'ABF'},
          {value: -6, name : 'ABG'},
          {value: 13, name : 'ABH'},
          {value: 60, name : 'ABI'}
      ],
    el = get_div().style("width",600)
    chart = BAR.hbar({
      data : data,
      x_scale : d3.scale.linear(),
      width : 600
    })(el);
    setTimeout(function(){
      _.each(data, function(d){
        d.value = _.random(-20,50);
      });
      chart.update({
        data : _.sortBy(data,function(d){return -d.value})
      })
    },1500)

  });

})();
