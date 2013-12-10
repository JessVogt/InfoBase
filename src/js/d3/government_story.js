(function(root) {
  
    var APP = ns('APP');
    var D3 = ns('D3');
    var STORY = D3.STORY;
    var PACK = D3.PACK;
    var BAR = D3.BAR;


    STORY.gov_story =  function(container,app){
      return new _gov_story(app);
    };

    _gov_story = function(container,app){
      container = container[0];
      var chapter = new STORY.chapter(app, {history: true, target : container[0]});
      chapter.graph_area()
      chapter.history_area()
      chapter.text_area()

    };

    var p = _gov_story.prototype;

})();


