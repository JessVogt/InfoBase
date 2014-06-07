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
})();
