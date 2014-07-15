(function() {
  var APP = ns('APP');

  var compact = function(val,lang, abbrev, precision){
     var symbol,
     abs = Math.abs(val);
     if (val === 0) { 
       return "0";
     } else if (abs >= 1000000000){
       val = val /  1000000000;
       symbol = abbrev[1000000000][lang];
     }
     else if (abs >= 1000000){
       val = val /  1000000;
       symbol = abbrev[1000000][lang];
     }
     else if (abs >= 1000){
       val = val /  1000;
       symbol = abbrev[1000][lang];
     }
     else {
       return String(val);
     }
     if (lang === 'en'){
       return accounting.formatMoney(val,
           {symbol:symbol,precision: precision, format: "%v %s" });
     } else if (lang === 'fr'){
       return accounting.formatMoney(val,{
         decimal : ',', thousand:' ',
         format: "%v %s", symbol:symbol,
         precision: precision
     });
     }
  };

  APP.types_to_format = {
    "compact_written" : function(val,lang){
       return compact(val,lang, {
         1000000000 : {en : 'billion', fr: 'millards'},
         1000000 : {en : 'million', fr: 'millions'},
         1000 : {en : 'thousand', fr: 'milliers'},
       },1);
    },
    "compact1" : function(val, lang){
      return compact(val, lang, {
         1000000000 : {en : 'B', fr: 'Mds'},
         1000000 : {en : 'M', fr: 'm'},
         1000 : {en : 'K', fr: 'k'},
       },1 );
    },
    "compact0" : function(val, lang){
      return compact(val, lang, {
         1000000000 : {en : 'B', fr: 'Mds'},
         1000000 : {en : 'M', fr: 'm'},
         1000 : {en : 'K', fr: 'k'},
       },0 );
    },
    "compact" : function(val, lang){
      return this.compact0(val, lang);
    },
    "percentage" :  function(val,lang){
      var options = {
        symbol : "%",
        format : "%v%s",
        precision : 0
      };
      if (val <= 0.01){ options.precision = 1;}
      if (_.isArray(val)){
        val = _.map(val, function(x){return x*100;});
      } else {
        val = val * 100;
      }
      if (lang === 'en'){
        return accounting.formatMoney(val,options);
      } else if (lang === 'fr'){
        return accounting.formatMoney(val,_.extend(options,{
          decimal : ',',
          thousand:' ',
          precision: 1
        }));
      }
    },
    "big-int" :  function(val,lang){
      if (_.isArray(val)){
        val = _.map(val, function(x){return x/1000;});
      } else {
        val = val / 1000;
      }
      if (lang === 'en'){
        return accounting.formatNumber(val,{precision: 0});
      } else if (lang === 'fr'){
        return accounting.formatNumber(val,{
          decimal : ',',
          thousand:' ',
          precision: 0
        });
      }
    },
    "big-int-real" : function(val,lang){
       return APP.types_to_format["big-int"](val*1000,lang);
    },
    "int" :  function(val,lang){return val;},
    "str" : function(val,lang){return val;},
    "wide-str" : function(val,lang){return val;},
    "date" : function(val,lang){return val;}
 };

})();
