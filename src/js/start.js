$(function(){
    // jquerymobile is bundled with WET
    // want to disable the jqmobile routing
    // functionality
    $.mobile.hashListeningEnabled = false;
    // WET adds this by default, for WCAG there can
    // only be one h1
    $('h1').remove();
    // get reference to the app and start it
    var APP = ns('APP');
    APP.start();
});
