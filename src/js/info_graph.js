(function(root) {
  
    var APP = ns('APP');
    var D3 = ns('D3');
    var T = ns('TABLES');
    var TREE = ns("D3.TREE");
    var INFO = ns('INFO');

    recursive_walk = function(root, nodes){
      root.tables = 0;
      root._children = _.filter(nodes,function(node){
        return node.pid === root.id || node.pid === root.nick;
      });
      root.child_count = root._children.length;
      _.each(root._children, function(node){
        node.parent = root;
        root.tables += recursive_walk(node, nodes);
      });
      return  (root.table? 1 : 0) + root.tables;
    };

    // as each table is added, add it as an info node
    APP.dispatcher.on("new_table",function(table){
      // add the new table node into the list
      window.info_nodes.push({
        table : true,
        id : table.id,
        nick : table.id,
        pid : table.attaches_to,
        name_en : table.name.en,
        name_fr : table.name.fr,
        descrition_fr : $('#'+table.id+"_fr").html(),
        descrition_en : $('#'+table.id+"_en").html()
      });
      // create a temporary tree
      var root = INFO.create_info_tree();
      var node = INFO.find_node(root,"id",table.id);
      // now the 
      new_node_parents = INFO.get_node_parents(node);
      var time_period = _.find(new_node_parents, function(node){
        return node.level_name === 'time_period';
      });
      var data_type = _.find(new_node_parents, function(node){
        return node.level_name === 'data_type';
      });
      table.coverage = {
        en: time_period.name_en,
        fr: time_period.name_fr
      };
      table.data_type = {
        en: data_type.name_en,
        fr: data_type.name_fr
      };
    });

    INFO.get_node_parents = function(node) {
      var walk_to_top = function(x){
        return x.parent ? [x].concat(walk_to_top(x.parent)) : [x];
      };
      return  _.tail(walk_to_top(node).reverse());
    };

    INFO.find_node = function(root,attr, val){
      function gather_children(root){
        return [root].concat(_.map(root._children,gather_children ));
      }
      var all_nodes = _.flatten(gather_children(root));
      return _.find(all_nodes, function(node){
        return node[attr] === val;
      });
    };

    APP.dispatcher.on("load_tables",function(app){
      INFO.create_info_tree = function() {
        // set the name,description to the current language
        var nodes = _.map(window.info_nodes, function(node){
          node = _.clone(node);
          node.name = node['name_'+app.lang];
          node.description = node['description_'+app.lang];
          return node;
        });
        // find the root
        var root = _.head(_.remove(nodes, function(node){
          return node.nick === "root";
        }));
        // build the knowledge graph
        recursive_walk(root, nodes);
        return root;
      };
    });

//    INFO.info_graph = function(container, app, dept){
//      var root = INFO.create_info_tree();
//
//      if (!_.isUndefined(dept)){
//        // filter out the tables where there is no data for this
//        // department
//        var filter_func = function(node){
//           node._children = _.filter(node._children, filter_func);
//           return !(node.table && _.isUndefined(node.table.depts,dept.accronym));
//        };
//        root.children = _.filter(root._children, filter_func);
//      }
//
//      var colors = D3.tbs_color();
//      root.color = colors(0);
//      _.map(root._children, function(child,i){
//         child.color = colors(i+1);
//      });
//
//      return TREE.make_horizontal_tree({
//        root : root,
//        text_func : function(d){
//          if (d.table){
//            return d.name;
//          }
//          return d.name + " (" +d.tables +")";
//        }
//      })(container);
//    };

})();
