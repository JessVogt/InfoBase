fs = require("fs");
var infobase_file = "/home/andrew/Projects/InfoBase/app.js";
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files : ['./src/**/*.js'],
      tasks: ["jshint"], //,'concat','line_count'],
      options: {
        spawn: false,
      },
    },
    rsync : {
        options : {
          args : ['-aLdc', '--delete'],
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
            src : "/home/andrew/Projects/reporting/",
            dest : "/media/andrew/PRIVATE/InfoBase-code/"
          }
        },
        prod : {
          options : {
            src : "/home/andrew/Projects/InfoBase/",
            dest : "/media/andrew/PRIVATE/InfoBase/"
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
        debug : true,
        latedef : true,
        noempty : true,
        trailing : true,
        //strict : true
      },
      full : {
            src: ['Gruntfile.js', 'src/js/*.js','src/js/InfoBase/*.js','src/js/d3'] 
      }
    },
    concat: {
        options: {
          separator: ';',
        },
        dist: {
          src: [
          "src/js/sandbox.js",
          "src/js/mappers.js" ,
          "src/js/router.js",
          "src/js/utils.js",
          "src/js/format.js",
          "src/js/detail.js",
          "src/js/waiting.js",
          "src/js/loader.js",
          "src/js/handlebars_helpers.js",
          "src/js/queries.js",
          "src/js/base_tables.js",
          "src/js/text.js",
          "src/js/home.js",

          "src/js/d3/core.js",
          "src/js/d3/chapter.js",
          "src/js/d3/hbar.js",
          "src/js/d3/bar.js",
          "src/js/d3/arrow.js",
          "src/js/d3/pack.js",
          "src/js/d3/circle_chart.js",
          "src/js/d3/table_builder.js",
          "src/js/d3/stacked.js",
          "src/js/d3/canada.js",
          //"src/js/d3/tree.js",
          //"src/js/d3/tree2.js",
          "src/js/d3/pack_and_bar.js",
          "src/js/d3/pie.js",
          "src/js/d3/line.js",

          "src/js/org_header.js",
          "src/js/other_ministries.js",
          "src/js/search.js",
          "src/js/widget.js",
          "src/js/horizontal.js",
          "src/js/d3/dept_explore.js",
          //"src/js/info_graph.js",

          "src/js/InfoBase/start.js",
          "src/js/InfoBase/home.js",
          "src/js/InfoBase/table_common.js",
          "src/js/InfoBase/table1.js",
          "src/js/InfoBase/table2.js",
          "src/js/InfoBase/table4.js",
          "src/js/InfoBase/table5.js",
          "src/js/InfoBase/table6.js",
          "src/js/InfoBase/table7.js",
          "src/js/InfoBase/table8.js",
          "src/js/InfoBase/table9.js",
          "src/js/InfoBase/table10.js",
          "src/js/InfoBase/table11.js",
          "src/js/InfoBase/story.js",

          "src/js/InfoBase/InfoBase.js",
          "src/js/start.js"

          ],
          dest: infobase_file,
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadTasks('./tasks'); //Loads tasks in the task directory (So far just the phantom one)
  // Default task(s).
  grunt.registerTask('default', ['jshint:full']);

  grunt.registerTask("line_count","print out the lines of the new file",function(){
    
  });

  grunt.registerTask()

  grunt.event.on("watch", function(action,filepath){
    fs.unlink(grunt.config("concat.dist.dest"), function (err) {
      if (!err) 
        console.log('successfully deleted '+ grunt.config("concat.dist.dest"));
    });
    grunt.config("jshint.full.src",[filepath]);
  });

  grunt.event.on("concat",function(){
    console.log(arguments);
  });

};


