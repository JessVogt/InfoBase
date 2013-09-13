$(function(){
  var APP = ns('APP')
  var langs = ['en','fr'];
  var func ;
  for (var lang in langs){
    lang = langs[lang];
    APP.app.state.set('lang',lang);
    _.each(_.keys(depts),function(key,x){
      var dept = depts[key];
      func = function(){
        APP.app.acv.updater(dept.dept[lang]);
        _.each(_.range(10),function(index){
          var func2 = function(){
              index+=1;
              var menu_append_el = $('#table_dropdown .dropdown-menu');
              menu_append_el.find('li:nth-child('+index+') a').trigger("click");
              }
          window.setTimeout(func2,index * 200);
          }
        );
      }
      window.setTimeout(func,x*2000);
    });
  }
 });

