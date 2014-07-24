/*phantom-only*/ 

window.phantom_funcs = [];

window.start_phantom = function(){ 
	console.log("start phantom");

	var canStart = window.dev_helpers.wait_for_prom(function(){
			return $('.app-ready').length > 0;
	});

	console.log("waiting for app-ready class");

	canStart.then(function(){

		console.log("app-ready was detected. Starting phantom_funcs!");


		dev_helpers.chain_promises(phantom_funcs, function(data){
			window.callPhantom({url:data.url,scraping:data.scraping});//Write the file
		}).then(function(){
			window.callPhantom({done: true});
		});

	});
	return;

};

/*phantom-only*/
