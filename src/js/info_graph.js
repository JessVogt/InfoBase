(function(root) {
  
    var APP = ns('APP');
    var T = ns('TABLES');
    var TREE = ns("D3.TREE");
    var INFO = ns('INFO');

    recursive_walk = function(root, nodes){
      root._children = _.filter(nodes,function(node){
        return node.pid === root.id || node.pid === root.nick;
      });
      root.child_count = root._children.length;
      _.each(root._children, function(node){
        recursive_walk(node, nodes);
      });
    };

    // as each table is added, add it as a knowledge node
    APP.dispatcher.on("new_table",function(table){
      window.knowledge_nodes.push({
        id : table.id,
        nick : table.id,
        pid : table.attaches_to,
        name_en : table.name.en,
        name_fr : table.name.fr,
        descrition_fr : $('#'+table.id+"_fr").html(),
        descrition_en : $('#'+table.id+"_en").html()
      });
    });

    INFO.info_graph = function(container, app){
      // set the name,description to the current language
      var nodes = _.map(window.knowledge_nodes, function(node){
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

      return TREE.make_horizontal_tree({
        root : root
      })(container);

    };

})();
