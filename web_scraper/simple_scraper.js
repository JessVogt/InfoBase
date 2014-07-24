var page = require('webpage').create(),
fs = require('fs'),
system = require('system'),
Q = require('q'),
START_TIME = new Date().getTime(),
url = "http://localhost:8080/InfoBase/index-eng.html",
my_exit = function(){
  console.log("All done! All of this took: "+ (new Date().getTime()-START_TIME)+"ms");
  phantom.exit();
};

page.onConsoleMessage = function (msg) {
    console.log('From page: ' + msg);
};

page.onCallback = function(data){
  console.log("data/url: "+data.url+", data/done: "+data.done);
  if(data.url){
    fs.write(data.url, data.scraping,'w');
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
    window.start_phantom();
  });
});//page.open
