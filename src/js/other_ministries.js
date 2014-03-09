(function() {
    var APP = ns('APP');

    APP.find_other_in_min = function(dept){
      return _.filter(window.mins[dept.min.en],function(d){
          return d !== dept;
        });                
    };

    APP.other_mins = function(app,org,container){
      // container is jQuery obj
      var el = d3.select(container.find(".other_in_min")[0]);
      var table = app.state.get("table");
      var lang = app.state.get("lang");
      el.append("h2")
        .html(app.get_text("other_in_min"));
      el.append("ul")
        .attr("class","list-bullet-none")
        .style("margin-top","0px!important")
        .selectAll("li")
        .data(APP.find_other_in_min(org))
        .enter()
        .append("li")
        .append("a")
        .attr("class","router")
        .attr("href",function(d){
          if (table){
            return  "#t-"+ d.accronym +"-"+table.id.replace(/[a-zA-Z_-]+/,"");
          } else {
            return  "#d-"+ d.accronym;
          }
        })
        .html(function(d){
          return d.dept[lang];
        });
      return el.node();
    };
})();
