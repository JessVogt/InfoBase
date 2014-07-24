/*phantom-only*/ 

window.phantom_funcs = [];

window.phantom_helpers = {

	//Basically a setInterval that RESOLVES itself once its passed function returns true.
	//It only returns a promise because I hate the inversion of control behind sending a callback to be executed. 
	wait_for_prom : function(testFx,timeOutMillis){
	  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
	  start = new Date().getTime(),
	  ret = $.Deferred(), //this gets resolved only once testFx returns true
	  interval = setInterval(function() {
	    if(new Date().getTime() - start < maxtimeOutMillis) {
	      // If not time-out yet and condition not yet fulfilled
	      if(testFx()){
	        clearInterval(interval);
	        ret.resolve();
	      }
	    } else { //time up
	          clearInterval(interval);
	          console.log("waited too long");
	    }
	  }, 100);
	  return ret.promise();
	}

};

//Responsible for preparing and starting the chain of functions. 
window.start_phantom = function(){ 
	console.log("start phantom");

	var canStart = window.phantom_helpers.wait_for_prom(function(){
			return $('.app-ready').length > 0;
	});

	console.log("waiting for app-ready class");

	canStart.then(function(){

		console.log("app-ready was detected. Starting phantom_funcs!");

		var proms = new Array(window.phantom_funcs.length);

	  proms[0] = phantom_funcs[0]();

		for(i=1;i<window.phantom_funcs.length;i++){

			proms[i-1].then(function(data){
				window.callPhantom({url:data.url,scraping:data.scraping});//Write the file
			}).then(function(){
				proms[i] = phantom_funcs[i]();//Call the function only once the last one has resolved.
			});

		}

		proms[window.phantom_funcs.length-1].then(function(data){
			window.callPhantom({url:data.url,scraping:data.scraping});
			window.callPhantom({done: true});
		});

	});
	return;

};
/*phantom-only*/
