var page = require('webpage').create(),
fs = require('fs'),
system = require('system'),
START_TIME = new Date().getTime(),
url = "http://localhost:8080/InfoBase/index-eng.html";

page.onConsoleMessage = function (msg) {
    console.log('From page: ' + msg);
};

page.onCallback = function(data){
  if(data.msg){
  	console.log(data.msg);
  }
  else if(data.done){
    setTimeout(phantom.exit,0);
  }
  else {
    console.log('misuse of callPhantom');
  }
};

page.open(url, function(status){
  page.evaluate(function(){
    window.start_tests();
  });
});//page.open
