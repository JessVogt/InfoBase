module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files : ['./src/**/*.js'],
      tasks: ['jshint:full']
    },
    rsync : {
        options : {
          args : ['-aLdcv'],
          exclude : ['.git*',"*.swp","node_modules"],
          recursive : true
        },
        dropbox : {
          options : {
            exclude : ["*.swp","node_modules"],
            src : "./",
            dest : "/home/andrew/Dropbox/les/"
          }
        },
        dev : {
          options : {
            src : "/home/andrew/Projects/les/",
            dest : "/media/andrew/PRIVATE/ExDB-code/"
          }
        },
        prod : {
          options : {
            src : "/home/andrew/Projects/ExDB/",
            dest : "/media/andrew/PRIVATE/ExDB/"
          }
        }
    },
    jshint: {   
      //single : {
      //      src: [grunt.option.flags()[0].replace("--js=","")] 
      //},
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
      },
      full : {
            src: ['Gruntfile.js', 'src/**/*.js'] 
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-rsync');
  // Default task(s).
  grunt.registerTask('default', ['jshint:full']);

};
