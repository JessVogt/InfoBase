var url = 'file:///home/andrew/Projects/ExDB/index-eng.html';
var page = require('webpage').create();
page.viewportSize = {width: 1585, height : 814};

page.onConsoleMessage = function( msg, line, srcId)
{//show console errors for page
    console.log('Page has errors showing in console: ' + msg
                + ' (line: ' + (line || '?') + ', id: ' + srcId + ')');
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};
page.onLoadFinished = function(stat){
  console.log(stat);
  page.evaluate(function () {
    window.$('.dept_sel').trigger("click");
  });
  window.setTimeout(function(){
    page.render("blah.png");
    phantom.exit();
  
  },2000)
} ;

page.open(url);
