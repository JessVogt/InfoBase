(function () {
    var APP = ns('APP');
    var TABLES = ns('TABLES');

    // add the #home route,
    // add handlebars template with home_t will be required 
    APP.add_container_route("home", "home", function (container) {
        container = $(container);
        this.add_crumbs([this.home_crumb]);
        this.add_title("home");
        container.html(TABLES.m('#home_t', {"_lang" : this.app.lang}));

        container.find(".row").each(function () {
            var panels = $(this).find(".netflix-panel");
            var width = d3.sum(panels, function (x) { return $(x).outerWidth(); });
            $(this).find(".inner").width(1.2 * width);
            if (1.2 * width > $(this).width()) {
                $(this).height($(this).height() + 10);
            }
        });
    });



 /*phantom-only*/ 
  window.phantom_funcs.push(
    function(){

      var ret = $.Deferred();

      ns('APP').app.router.navigate('#home', {trigger:true});

      var lang = 'eng';
      var clone = $('html').clone();

      clone.find('script').remove();
      clone.find('noscript').remove();
      clone.find('base').remove();
      clone.find("a.dept_sel:first").remove();

      clone.find(".ui-li.ui-li-divider").remove();
      clone.find("a.dept_sel_cancel").remove();
      clone.find("ul.list-view").removeClass("list-view");
      clone.find("li.ui-li").removeClass("ui-li ui-li-divider ui-bar-b ui-first-child");
      clone.find("div.ui-btn-text").removeClass("ui-btn-text");
      clone.find("div.ui-li").removeClass("ui-btn-inner ui-li");
      clone.find("li.ui-btn").removeClass("ui-btn ui-btn-icon-right ui-li-has-arrow ui-btn-up-c");
      clone.find("span").removeClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
      clone.find(".button").remove();
      clone.find("div .ui-input-search").remove();

      var body = clone[0].outerHTML;

      ret.resolve({
        url: 'nojshome-'+lang+'.html',
        scraping: body.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gm, "")
      });

      return ret.promise();
    });

/*phantom-only*/



})();
