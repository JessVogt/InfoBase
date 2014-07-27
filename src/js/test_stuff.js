/*phantom-only*/

window.test_funcs = [];

window.start_tests = function(){

	var canStart = window.dev_helpers.wait_for_prom(function(){
			return $('.app-ready').length > 0;
	});

	var usePhantom = !!window.callPhantom;
	var print_test;
	var message = function(module,pass,msg){
		return "("+(pass? "pass" : "--FAIL--")+") "+module+": "+msg;
	};
	if(usePhantom){
		usePhantom = true;
		print_test = function(module,pass,msg){
			window.callPhantom({msg:message(module,pass,msg)});
		};
	} else {
		print_test = function(module,pass,msg){
			if(pass)console.log('%c'+message(module,pass,msg),'color: #7d9325');
			else console.log('%c'+message(module,pass,msg),'color: #d91d1d');
		};
	}
	var fails = 0;
	var done;

	if(usePhantom) {
		done = function(){
			window.callPhantom({msg: fails+" tests have failed."});
			window.callPhantom({done:true});
		};
	}
	else {
		done = function(){
			if(!!fails) console.log('%c'+fails+" tests have failed.", 'color:#d91d1d');
			else console.log('%c No errors! ', 'color: #7d9325');

		};
	}


	canStart.then(function(){

		//var test_funcs;
		//if (!!str){
		//	if(tests[str]){
		//		test_funcs = tests[str];
		//	} else {
		//		console.log("no test module: '"+str+"'");
		//		return;
		//	}
		//}
		//else {

		//	//do all of them

		//}

		console.log("Starting tests!");


		dev_helpers.chain_promises(test_funcs, function(data){
			if(!data.pass){
				fails++;
			}
			print_test(data.module,data.pass,data.msg);
		}).then(function(){
			done();
		});

	});


};

/*phantom-only*/
