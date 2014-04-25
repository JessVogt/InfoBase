(function() {
  var PARSER = ns('PARSER');

  PARSER.parse_orgs = function(org_rows){
    function make_bilingual(line,en,fr,force_array,join){
      force_array = force_array || false;
      join = join || false;
      if (_.isArray(en)){
        return {
          "en" : _.compact(_.at(line,en)).join(", "),
          "fr" : _.compact(_.at(line,fr)).join(", ")
        };
      } else {
        if (force_array){
          if (!_.isArray(line[en])){
             line[en] = [line[en]];
             line[fr] = [line[fr]];
          }
          return _.map(_.range(line[en].length), function(i){
            return {
              'en' : line[en][i],
              'fr' : line[fr][i]
            };
          });
        }
        else if (join){
          if (!_.isArray(line[en])){
             line[en] = [line[en]];
             line[fr] = [line[fr]];
          } 
          return  {
                "en" :line[en].join(","),
                "fr" :line[fr].join(",")
          };
        } else {
          return {
                  "en" :line[en],
                  "fr": line[fr]
          };
        }  
      }
    }
    function each_item(x){
      var split = x.split('*,*');
      if (split.length > 1){
        return split;
      }
      return x;
    }
    function each_line(line){
      key = line[0];
      line = _.map(line,each_item);
      return [key,{
        "accronym" : key,
        "dept" : make_bilingual(line, 1,2),
        "legal_name" : make_bilingual(line,5,6,false,true),
        'min':  make_bilingual(line, 7,8),
        "type" : make_bilingual(line,25,26),
        "website" : make_bilingual(line,29,30,true),
        "minister" : make_bilingual(line,[10,12,14],[16,18,20]),
        "mandate" : make_bilingual(line,23,24,true),
        "legislation" : make_bilingual(line,27,28,true)
      }];
    }
    return _.object(_.map(_.tail(org_rows), each_line));
  };

  PARSER.parse_lookups = function(rows){
    _.chain(rows)
     .groupBy(0)
     .each(function(grp,grp_name){
       window[grp_name] = _.object(_.map(grp, function(row){
         return [row[1], {
                'en': row[2],
                'fr': row[3]
              }];
        }));
     })
    .value();
  };

  PARSER.parse_qfrlinks = function(depts,qfrlinks){
    function each_line(line){
      return [line[0], {
        'en': line[1],
        'fr': line[2]
      }];
    }
    var links =  _.object(_.map(_.tail(qfrlinks),each_line));
    _.each(links, function(links, key){
      if (key === 'ZGOC'){ return;}
      if (!key){return;}
      depts[key].qfr_link = links;
    });
  };

  PARSER.parse_lang = function(lang){
    function each_line(line){
      return [line[0], {
        'en': line[2],
        'fr': line[3]
      }];
    }
    return _.object(_.map(lang,each_line));

  };

  PARSER.parse_kg = function(nodes){
    window.info_nodes =  nodes;
  };


})();

