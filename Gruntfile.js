module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files : ['./src/**/*.js'],
      tasks: ['concat']
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
    },
    concat: {
        options: {
          separator: ';',
        },
        dist: {
          src: [
          "src/js/sandbox.js",
          //"src/js/datatables.js",
//          "src/js/group_funcs.js" ,
          "src/js/mappers.js" ,
          "src/js/router.js",
          "src/js/app.js",
          "src/js/waiting.js",
          "src/js/loader.js",
          "src/js/handlebars_helpers.js",
//          "src/js/base_graph_view.js",
          "src/js/base_table_view.js",
          "src/js/queries.js",
          "src/js/d3/core.js",
          "src/js/d3/chapter.js",
          "src/js/d3/story.js",
          "src/js/d3/hbar.js",
          "src/js/d3/bar.js",
          "src/js/d3/dept_explore.js",
          "src/js/d3/horizontal.js",
          "src/js/d3/arrow.js",
          "src/js/d3/pack.js",
          "src/js/d3/circle_chart.js",
          "src/js/tables.js",
          "src/js/od/text.js",
          "src/js/od/tables.js",
          "src/js/od/od.js",
          "src/js/ExDB-start.js"
          ],
          dest: '../ExDB/ExDB.js',
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
