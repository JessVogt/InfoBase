$(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');

  var col = Backbone.Collection.extend({ });

  TABLES.tables = new col;

  TABLES.m = function(s){
    if (s){
      return Handlebars.compile(s)(TABLES.template_args);
    }
    return '';
  }

  APP.dispatcher.on("dept_selected", function(app){
    var signals = TABLES.tables.map(function(table){
      return 'table_' + table.get("id") +"_rendered";
    })
    APP.size_panels(app,signals)
  });

  APP.size_panels = function(app,signals){
    // once all the mini table signals have been sent
    // do some prettying up on the page
    APP.dispatcher.on_these(signals, function(){
      var views = _.map(arguments,_.identity);
      var current_table = app.state.get("table");
      if (current_table){
        var current_view = _.first(_.filter(views,function(v){
          return v.def.id === current_table.get('id');
        }));
      } else {
        var current_view = undefined;
      }
      $('.widget-row').each(function(i,row){
        $('.mini_t',row)
        .height(_.max($('.mini_t',row).map(function(x,y){
          return $(y).height();
        })));
        $('.section-header',row)
        .height(_.max($('.section-header',row).map(function(x,y){
          return $(y).height();
        })));
      });
      $('.mini_t').css({
        position : 'relative'
      });
      $('.mini_t div.details_button').css({
        'bottom' : 0, 
        'position' : 'absolute', 
        'right' : 0
      });
      APP.dispatcher.trigger("mini_tables_rendered",
          {current_view : current_view,
            views : views} 
      ); 
    });
  };

  APP.dispatcher.once("app_ready", function(app){
    // e ee ready to adjust the heights and signal the readiness
    // of the mini views
    debugger;

    TABLES.tables.on("add", function(table){

      var BTV = TABLES.BaseTableView;
      var BGV = GRAPHS.BaseGraphView;

      var id = table.get("id");

      _.each(depts,function(org){
        org['mapped_data'][id] = {};
        org['mapped_objs'][id] = {};
      });

      // setup the mappers
      MAPPERS.maps[table.get("id")] = table.get("mapper");
      table.set('mapper' , {
       'en' : new MAPPERS.mapper('en',table.attributes,id)
       ,'fr' : new MAPPERS.mapper('fr',table.attributes,id)
      }); 

      // setup the table views
      table.set('table_view', BTV.extend(table.get('table_view')));

      // setup lookups for the headers
      table.set("header_lookup" , {
        'en' : {},
        'fr' : {}
      });

      table.set("unique_headers", {}); 
      _.each(["en","fr"], function(lang){
        var all_headers = table.get("headers")[lang];
        var last_header = _.last(table.get("headers")[lang]);
        table.get("unique_headers")[lang] = _.map(last_header,
          function(header,index){
            if (_.filter(last_header, function(x){
              return _.isEqual(x,header);
            }).length >1){
              return TABLES.extract_headers(all_headers,index).join("-");
            }
            return header;
          });
      });

      _.each(['en','fr'], function(lang){
        _.each(table.get('unique_headers')[lang],function(header,index){
          table.get("header_lookup")[lang][header] = index;
        });
      });


    });


  APP.dispatcher.trigger("load_tables",app);
  APP.dispatcher.trigger("tables_loaded",app);

  });

  APP.dispatcher.on("dept_selected", function(app){

    var lang = app.state.get("lang");
    var org = app.state.get('dept');

    TABLES.tables.each(function(table){
      var id = table.get("id");
      mapper = table.get('mapper')[lang];
      // map the data for the current lang unless it's already
      // been mapped
      if (_.isUndefined(org["mapped_data"][id][lang])) {
        org["mapped_data"][id][lang] =  mapper.map(org['tables'][id]);
      }

      var headers = table.get('unique_headers')['en'];

      if (_.isUndefined(org["mapped_objs"][id][lang])) {
        org["mapped_objs"][id][lang] = _.map(org["mapped_data"][id][lang],
          function(row){
            return _.object(headers,row);
          }
        );
      }
    });

    APP.dispatcher.trigger("mapped");
  });

});

