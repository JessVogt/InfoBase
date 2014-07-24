/*phantom-only*/ 

//In this file we wefine helpers that can be used both in scraping and testing to avoid code duplication.


window.dev_helpers = {

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
	} ,


//Promise chaining, where an array of functions that return promises are passed 
//And this function executes them in order, 
//returns a promise that is resolved once all functions are completed and resolved.
//betweenCB is an optional synchronous callback
//to be called after each resolve, with the resolver data.

	chain_promises :  function(funcs,betweenCB){ 

		var ret = $.Deferred();

		var proms = new Array(funcs.length);

	  proms[0] = funcs[0]();

		for(i=1;i<funcs.length;i++){

			proms[i-1].then(function(data){
				if(betweenCB)
					betweenCB(data);
				proms[i] = funcs[i]();//Call the function only once the last one has resolved.
			});
		}

		proms[funcs.length-1].then(function(data){
			if(betweenCB)
				betweenCB(data);
				ret.resolve();
		});

		return ret.promise();

	}



};

/*phantom-only*/
