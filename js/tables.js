$(function() {
  var APP = ns('APP');
  var LANG = ns('LANG');
  var TABLES = ns('TABLES');
  var GRAPHS = ns('GRAPHS');
  var MAPPERS = ns('MAPPERS');

  var col = Backbone.Collection.extend({});

  var current_mini_views  = {};
  TABLES.rendered_mini_views = function(){
    return $.when.apply(this,
      _.map(current_mini_views,function(view){
        return view['rendered'];
      }));
  }

  TABLES.tables = new col;

  TABLES.m = function(s){
    return Mustache.render(s,TABLES.template_args);
  }

  APP.dispatcher.once("app_ready", function(app){
    app.state.on("change:dept", function(){
      $.when(TABLES.rendered_mini_views()).done(
        function(){
          setTimeout(function(){
            $('.widget-row').each(function(i,row){
              $('.table-widget',row)
              .height(_.max($('.table-widget',row).map(function(x,y){
                return $(y).height();
              })));
              $('.section-header',row)
              .height(_.max($('.section-header',row).map(function(x,y){
                return $(y).height();
              })));
            });

            $('.table-widget').css({
              position : 'relative'
            });
            $('.table-widget div.details_button').css({
              'bottom' : 0, 
              'position' : 'absolute', 
              'right' : 0
            });
          });
        })
    });

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

      app.state.on("change:dept", function(state){

        var lang = app.state.get("lang");
        var org = app.state.get('dept');

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

        APP.dispatcher.trigger("mapped",table);
        
      });
    });

    APP.dispatcher.on("mapped", function(table){
      if (app.state.get('table')){
        var current_table = app.state.get('table').get('id');
      }else {
        var current_table = undefined;
      }
      var id = table.get('id');

      var mtv = new TABLES.miniTableVew({
        app : app,
        def: table.attributes
      });

      current_mini_views[id] = mtv;

      mtv.render();
      
      mtv.$el.find('a.details').on("click", function(event){
        // move the mini views out of the way and replace with larger 
        // table

        app.state.set({'table':table});

        var dv = new APP.DetailsView({
          app : app,
          def: table.attributes
        });

        dv.render();

        $('.panels').hide();
      });

      $.when(TABLES.rendered_mini_views()).done(function(){
        if (id === current_table) {
          mtv.$el.find('a.details').trigger("click");
        }
      });
    });

  APP.dispatcher.trigger("load_tables",app);

  });

});

