
//This script will remove the phantom-only block for production code.
//The phantom only blocks must follow this EXACT syntax.
/*phantom-only*/ 
// code here
/*phantom-only*/

//var file_names = process.argv.slice(2),
fs = require('fs');

module.exports = function(grunt){

	grunt.registerTask('strip_phantom',function(in_file){

		var src_file = this.args[0],
		dest_file = this.args[1];

		grunt.log.ok("src: "+src_file+" dest:"+dest_file);

		raw_file = grunt.file.read(src_file,{encoding:null});
		raw_file = ""+raw_file; //coerce to a string (just in case)
		raw_file = raw_file.replace(/\/\*phantom\-only\*\/[\s\S]*?\/\*phantom\-only\*\//gi, "");
		grunt.file.write(dest_file,raw_file);

	});

};

	





