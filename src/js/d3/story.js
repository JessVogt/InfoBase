(function(root) {
  
  var APP = ns('APP');
  var D3 = ns('D3');

    D3.story =  function(app){
      return new _story(app);
    };

    _story = function(app){
      this.chapters = [];


    };

    var storyp = _story.prototype;

    storyp.add_chapter = function(options){
      this.chapters.push(new chapter(options));
    };

    var chapter = function(app,options){

    };

    chapterp = chapter.prototype;


})();

