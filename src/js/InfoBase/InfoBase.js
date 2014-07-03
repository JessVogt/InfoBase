(function() {
  var APP = ns('APP');

  var LANG = ns('LANG');
  var PARSER = ns('PARSER');
  var WAIT = ns('WAIT');
  var TABLES = ns("TABLES");

  function lang_load(promises,data){
   LANG.lookups = PARSER.parse_lang(d3.csv.parseRows(data));
  }

  function table_text_load(promises,data){
    $('html').append(data);
  }

  function template_load(promises,data){
    $('html').append(data);
  }

  function org_load(promises,data){
    window.depts = PARSER.parse_orgs(d3.csv.parseRows(data));
  }

  function sos_load(promises,data){
    PARSER.parse_lookups(d3.csv.parseRows(data));
  }

  function qfr_links_load(promises,data){
    promises.Organizations.done(function(){
      PARSER.parse_qfrlinks(window.depts, d3.csv.parseRows(data));
    });
  }

  var sizes  = [];

  APP.start = function(){
    // download initialization data files and when that's done,
    // parse the data and create a new app

    // parse the file name of the html file to figure out if the
    // language is en or fr  TODO fix how awkwardly this is done
    var lang = _.last(location.pathname.replace(".html",""),3).join("")==='eng' ? 'en' : 'fr';

    WAIT.w = WAIT.waitscreen(lang,"Application");

    var setup_material = {
      "Language" :  {url:"data/lang.csv", onload:lang_load},
      "Table Text" : {url:"handlebars/infobase_tables.html",onload:table_text_load},
      "Templates" :  {url:"handlebars/infobase.html", onload:template_load},
      "Organizations" :  {url:"data/orgs.csv", onload:org_load},
      "Lookups" :  {url:"data/lookups.csv", onload:sos_load},
      "QFR Links" :  {url:"data/QFRLinks.csv", onload:qfr_links_load}
    };

    var promise0 = $.Deferred();
    WAIT.getContentSizes(setup_material,sizes).done(function(){
      WAIT.w.initRequestInfo(sizes);
      promise0.resolve();
    });

      var promises = _.chain(setup_material)
       .map(function(obj,key){
          var promise1 = $.Deferred(),promise2 = $.Deferred();
          var req = $.ajax({
            url:obj.url,
            xhrFields: {
              onprogress: function (e) {
                if (e.lengthComputable && promise0.state() == 'resolved') {
                  WAIT.w.update_item(key,e.loaded);
                }
              }
            }
          });
          req.done(function(data){
            _.delay(promise1.resolve,0,data);
          });
          promise1.done(function(data){
            obj.onload(promises,data);

            _.delay(promise2.resolve,0);
          });
          return [key,promise2];
      })
      .object().value();

    // when the hot mess above is finished, create the app
    // using the language you figured out from the url

    $.when.apply(null,_.values(promises)).done(function(){
      WAIT.w.teardown();
      APP.app = new APP.APP({ state : { "lang":lang }});
    });
  };

  APP.dispatcher.on("data_loaded",function(app){
    window.mins = d3.nest()
      .key(function(d){ return d.min.en;})
      .map(_.values(window.depts));
    window.dept_name_map = _.chain(window.depts)
      .map(function(dept){
        return [dept.dept[app.state.get("lang")],dept];
      })
      .object()
      .value();
    APP.dispatcher.trigger_a("app_ready",app);
  });

  APP.dispatcher.on("app_ready",function(app){
    Backbone.history.start();
  });


  // this is a constructor function, so this will be a new
  // object when new APP.APP() is called
  APP.APP = function(options) {
    //
    _.bindAll.apply(this,[this].concat(_.functions(this)));
    this.state = new APP.stateModel(_.extend({app:this},options.state));
    this.lang = this.state.get("lang");

    APP.dispatcher.trigger("init",this);

    this.router = new APP.AppRouter({app:this});
  };

  APP.APP.prototype.formater = function(format,val){
    if (_.has(APP.types_to_format,format)){
      if (_.isArray(val)){
        return _.map(val, function(v){ return this.formater(format,v);},this);
      } else if (_.isObject(val)){
        return _.chain(val)
          .map(function(v,k){ return [k,this.formater(format,v)];},this)
          .object()
          .value();
      } else  if (_.isString(val)){
        return val;
      } else {
        return APP.types_to_format[format](val,this.lang);
      }
    }
    return val;
  };

   APP.APP.prototype.list_formater = function(formats,vals){
      // formats can be either an array of values or one single one
      // which will be duplicated for each item in vals
      if (!_.isArray(formats)){
        formats = _.map(vals, function(){ return formats;});
      }
      return _.map(formats, function(format,i){
        return this.formater(format,vals[i]);
      },this);
    };

   APP.APP.prototype.make_formater = function(format){
      var that = this;
      return function(d){ return that.formater(format,d);};
    };

   APP.APP.prototype.get_text = function(txt, context){
      context = context || {};
      return TABLES.m(LANG.l(txt,this.state.get('lang')),context);
   };

})();
