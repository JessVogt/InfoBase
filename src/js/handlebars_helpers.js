ns().APP.dispatcher.once("init", function(app){

  Handlebars.registerHelper("change_by",function(context){
     if (_.head(context)==='-'){
      return "decreased by " + context;
     } else {
      return "increased by " + context;
     }
  });

  Handlebars.registerHelper("change_de_m",function(context){
     if (_.head(context)==='-'){
      return "diminés de " + context;
     } else {
      return "augmentés de " + context;
     }
  });

  Handlebars.registerHelper("change_de_f",function(context){
     if (_.head(context)==='-'){
      return "diminées de " + context;
     } else {
      return "augmentées de " + context;
     }
  });

  Handlebars.registerHelper("gt",function(context){
    return app.get_text(context);
  });

  Handlebars.registerHelper("uri",function(context){
    return encodeURI(context[app.state.get("lang")]);
  });
  Handlebars.registerHelper("lang",function(context){
    if (context && _.has(context, app.state.get("lang"))){
      return context[app.state.get("lang")];
    } else {
      return "";
    }
  });
  Handlebars.registerHelper("dept",function(context){
     return window.depts[context].dept[app.state.get("lang")];
  });
  Handlebars.registerHelper("encodeURI",function(context,options){
    if (_.has(context,'en') && _.has(context,"fr")){
      context = context[app.state.get("lang")];
    }
    return encodeURI(context);
  });
  Handlebars.registerHelper("is_dept",function(context,options){
    var dept = context.dept[app.state.get("lang")];
    if (_.has(context,'org_type') && context.org_type.en === 'Departments') {
      return options.fn({dept:dept});
    }else{
      return options.inverse({dept:dept});
    }
  });
});
