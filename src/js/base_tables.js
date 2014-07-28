(function() {
  var APP = ns('APP');
  var TABLES = ns('TABLES');
  var MAPPERS = ns('MAPPERS');
  var WAIT = ns('WAIT');
  var LINKS = ns("TABLES.LINKS");

  TABLES.org_name = function(code,lang){
    return window.depts[code].dept[lang];
  };

  TABLES.tables = [];

  TABLES.Info = function(info){
    info = info || {};
    APP.dispatcher.trigger("info_collection",info);
     _.each(TABLES.tables, function(table){
       if (info.dept){
         table.dept_info(info,table.q(info.dept));
       }
       table.info(info,table.q());
     });
     // TODO comment this
    APP.dispatcher.trigger("info_collection_cleanup",info);
    return  _.chain(info)
      .map(function(value,key){
         return [key.replace(/(\{|\})/g,""),value];
      })
      .object()
      .value();
  };

  TABLES.format_info = function(formater,info){
     // TODO comment this
    var formated_data = _.chain(info)
       .map(function(v,k){return [k,formater(v)];})
       .object()
       .value();
    APP.dispatcher.trigger("info_formating_cleanup",formated_data,info);
    return formated_data;
  };

  TABLES.Graphs = function(app,dept){
    var info = {dept:dept},
        context = {
          app : app,
          gt : app.get_text,
          lang : app.lang,
          percent : function(x){return app.formater("percentage",x);},
          compact : function(x){return app.formater("compact1",x);},
          compact0 : function(x){return app.formater("compact0",x);}
        };

    TABLES.Info(info);

    _.extend(context, info);

    return _.chain(TABLES.tables)
      .map(function(table){
        return [table.id, _.extend({table:table},table.graphics,context)];
      })
      .object()
      .value();
  };

  function setup_tables(app){
    //TODO fix the hardcoding of 'en' by finding a way to access the lang in the InfoBase.js
    WAIT.w = WAIT.waitscreen(app.state.get('lang'),'tables');
    TABLES.m = function(s,extra_args){
      if (_.isArray(s)){
        return _.map(s,function(__){ return TABLES.m(__,extra_args);});
      }
      if (s[0] === "#" && $(s).length > 0){
        s = $(s).html();
      }
      extra_args = extra_args || {};
      var lang = app.state.get('lang');
      var args = _.clone(TABLES.template_args.common);
      _.extend(args,_.clone(TABLES.template_args[lang]),extra_args);
      if (s){
        return Handlebars.compile(s)(args);
      }
      return '';
    };
    // all tables should register themselves
    APP.dispatcher.trigger("load_tables",app);
    // all tables should download their respective datasets
    $.when.apply(null, load_data(app))
      .done(function(){
        WAIT.w.teardown();
        APP.dispatcher.trigger("data_loaded",app);
      });
  }
  APP.dispatcher.once("init", setup_tables);

  var load_data = function(app){
    var url_attr;
    // determine if this is operating in the GCDOCS 
    // environment
    if (window.gc_docs){
        url_attr = "gcdocs_url";
      } else {
        url_attr = "csv_url";
    }

    var setup_material = {};
    _.each(TABLES.tables,function(table){
      setup_material[table.id] = {url:table[url_attr]};
    });
    var sizes = [];
    var promise0 = $.Deferred();
    WAIT.getContentSizes(setup_material,sizes).done(function(){
      WAIT.w.initRequestInfo(sizes);
      promise0.resolve();
    });

    return _.map(TABLES.tables, function(table){
      /*
       *
       */
      var key = table.name[app.state.get("lang")];
      // fetch the table descriptions and attach it
      table.description = TABLES.m($('#'+table.id+"_"+app.lang).html());

      var promise1= $.Deferred(),promise2 =$.Deferred();
      // sent signal to indicate the files is being downloaded
      //WAIT.w.update_item(key,"download");
       var req = $.ajax({
         url: table[url_attr],
         //context : table,?
         xhrFields:{
           onprogress: function (e) {
             if (e.lengthComputable && promise0.state() === 'resolved') {
               WAIT.w.update_item(table.id,e.loaded);
             }
           }
         }
       });
       req.done(function(data){
         // sent signal to indicate the loading is starting
          //WAIT.w.update_item(key,"loading");
          _.delay(promise1.resolve,0,data) ;
       });
       promise1.done(function(data){
         var lang =  app.state.get("lang"),
          // create the mapper
            mapper = map_objs(lang,table);
            data = _.chain(d3.csv.parseRows(data))
                     .tail()
                     .map(mapper)
                     .groupBy(function(row){ return row.dept === 'ZGOC';})
                     .value();

        // create the fully qualified names
        table.add_fully_qualified_col_name(lang);
        table.presentation_ready_headers =  presentation_ready_headers(table.flat_headers,lang);

        TABLES.setup_table_for_queries(app,table,data);
        // send signal to indicate the table loading is finished
        //WAIT.w.update_item(key,"finished");
        _.delay(promise2.resolve,0) ;
       });
      return promise2;
    });
  };

  function map_objs(lang,table){
    var mapper = new MAPPERS.mapper(lang,table);
    return function(row){
      var row_obj =  _.object(table.unique_headers,mapper.map(row));
      _.each(row_obj, function(val, key){
         var type =  table.col_from_nick(key).type ;
         if ( type === 'big-int' || type === "big-int-real"){
           row_obj[key]=accounting.unformat($.trim(val));
         } else if (type === 'int' && !_.isNaN(parseInt(val,10))){
           row_obj[key]=parseInt(val,10);
         }
      },this);
      return row_obj;
    };
  }

  function add_child(x){
    // this === a column parent
    if (!_.isArray(x)){
      x = [x];
    }
    _.each(x, function(col){
       col.parent = this;
       col_adder.call(col.parent.table,col);
       col.wcag =  APP.make_unique();
       col.level = col.parent.level +1;
       col.table = col.parent.table;

    },this);
    this.children = (this.children || []).concat(x);
    return this;
  }

  function col_adder(x){
    // this === a table obj or null
    if (_.isString(x)){
      x =  {header : {en: x, fr: x}};
    }
    if (_.isString(x.header)){
      x.header = {en: x.header, fr: x.header};
    }
    x.table = this;
    if (!_.has(x,"key")){
       x.key = false;
    }
    if (!_.has(x,"parent")){
      x.wcag =  APP.make_unique();
      this._cols.push(x);
      x.level = 0;
    }
    this.flat_headers.push(x);
    x.add_child = add_child;
    return x;
  }

  function col_from_nick(nick){
    // find a column obj from either the nick name or the wvag uniq ID
    return _.find(this.flat_headers, function(col){
      return col.nick === nick || col.wcag === nick;
    }) || false;
  }

  function add_fully_qualified_col_name(lang){
    _.chain(this.flat_headers)
     .filter( function(header){
       // filter out nodes with children and  key nodes
       return _.isUndefined(header.children) && !header.key;
     })
     .each( function(col){
         var name = col.header[lang];
         var pointer = col ;
         while (pointer.parent){
           pointer = pointer.parent;
           if (pointer.header[lang].length > 0){
             name = pointer.header[lang] +' - '+ name;
           }
         }
         // run this once and attach to the col obj
         col.fully_qualified_name = TABLES.m(name);
     });
  }

  var calc_col_span = function(header){
    if (header.children){
      return _.chain(header.children)
        .map(calc_col_span)
        .reduce(function(x,y){
          return x+y;
        });
    }
    if (header.hidden){
      return 0;
    } else {
      return 1;
    }
  };

  var presentation_ready_headers = function(flat_heders,lang){
    var headers = [];
    _.each(flat_heders, function(header){
      if (header.hidden){
        return;
      }
      var presentation_copy = {
        val : TABLES.m(header.header[lang]),
        id : header.wcag
      };
      if (_.isUndefined(headers[header.level])){
        headers[header.level] = [];
      }
      if (header.parent){
        var wcag_headers = '';
        var pointer = header ;
        while (pointer.parent){
          pointer = pointer.parent;
          wcag_headers += pointer.wcag + " ";
        }
        presentation_copy.headers = wcag_headers;
      }
      if (header.children){
        presentation_copy.col_span = calc_col_span(header);
      }
      headers[header.level].push( presentation_copy );
    });
    return headers;
  };

  var graph = function(key,context ){

    if (context.dept && !_.has(this.depts,context.dept)){
      context.panel.remove();
      return;
    }

    var areas = context.panel.areas();
    var self = this;

    context.create_links = function(args){
      return LINKS.create_link(_.extend({
        lang : context.lang,
        table : self,
        dept : context.dept
      },args));
    };

    var temp_object = _.extend({render : self.graphics[key], table : self},context);
    var render_rtn = temp_object.render();

    // in the standard case where the graph, accompanying text, title
    // and source link just need to be appened, the graph can return
    // an object with the relevant properties and they will be appened
    // using this code
    // if the render function doesn't return anything, it will take
    // care of all the appending itself
    if (_.isObject(render_rtn)){
      if (_.has(render_rtn, "graph") ){
        render_rtn.graph(areas.graph);
      }
      if (_.has(render_rtn, "title") ){
        areas.title.html(render_rtn.title);
      }
      if (_.has(render_rtn, "text") ){
        context.panel.add_text(render_rtn.text);
      }
      if (_.has(render_rtn, "source")){
        context.panel.add_source(render_rtn.source);
      }
    }
    if (render_rtn === false ){
      setTimeout(function(){
        context.panel.remove();
      },1);
    }
  }; 


  APP.dispatcher.on("new_table", function(table){
    TABLES.tables.push(table);
    // setup the mappers
    table._cols = [];
    table.flat_headers = [];
    table._levels = [];

    // add in new functions
    table.col_from_nick = _.memoize(col_from_nick);
    table.add_col = col_adder;
    table.add_fully_qualified_col_name = add_fully_qualified_col_name;
    table.horizontal_group_sort=  table.horizontal_group_sort || _.identity;

    // register callbacks for things like after the data has been
    // loaded
    _.each(table.on,function(func, signal){
      // bind the listener to the table
      APP.dispatcher.on(signal,_.bind(func,table));
    });

    table.add_cols();

    table.graph = graph;

    // add useful attributes to each table
    // for all the nick names, how many levels of headers
    // the key columns and the unique header names
    var to_chain = _.chain(table.flat_headers);
    table._nicks = to_chain
      .map(function(x){ return x.nick;})
      .compact()
      .value();
    table._levels = to_chain
      .map(function(col){ return col.level;})
      .unique()
      .value();
    table.keys = to_chain
      .filter(function(h){ return h.key;})
      .map(function(h){return h.nick || h.header.en;})
      .value();
    table.unique_headers = to_chain
      .filter(function(h){ return !h.children;})
      .map(function(h){ return h.nick || h.wcag;})
      .value();
  });

})(this);
