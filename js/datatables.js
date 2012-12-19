$(function(){
  var simple_asc = function ( a, b ) {
        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    }
  var simple_desc = function ( a, b ) {
        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
    }

jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "percentage-pre": function ( a ) {
        var x = (a == "-") ? 0 : a.replace( /%/, "" );
        return parseFloat( x );
    },
    "percentage-asc": simple_asc,
    "percentage-desc":simple_desc 
} );
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "int-pre": function ( a ) {
        return parseInt($(a).html()  );
    },
    "int-asc":  simple_asc,
    "int-desc": simple_desc
} );
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "big-int-pre": function ( a ) {
        a = (a==="-") ? 0 : a.replace( /[^\d\-\.]/g, "" );
        return parseInt( a );
    },
    "big-int-asc": simple_asc,
    "big-int-desc":simple_desc 
} );
});
