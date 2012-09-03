(function() {
    LANG = ns("LANG");

    lookups = {
      "about" : {
        "en" : "About this table"
        ,"fr" : "fr:About this table"
      }
      ,"close" : {
        "en" : "close"
        ,"fr" : "fermer"
      }
      ,"copy_tooltip" : {
        "en" : "Clicking this button will load the paste buffer with the table. You can then switch over to Excel and paste in the table"
        ,"fr" : "fr:Clicking this button will load the paste buffer with the table. You can then switch over to Excel and paste in the table"
      }
      ,"details" : {
        "en" : "Show more details"
        ,"fr": "Details"
      }
      ,"hide" : {
        "en" : "Hide detail"
        ,"fr": "Cache les details"
      }
      ,"full_screen" : {
        "en" : "Full Screen"
        ,"fr": "Plein Ecran"
      }
      ,"graphs" : {
        "en" : "Graphs"
        ,"fr" : "Graphiques"
      }
      ,"lang" : {
        "en" : "Français"
        ,'fr' : 'English'
      }
      ,"loading" : {
        "en": "Loading"
        ,"fr": "Chargement"
      }
      ,"print" : {
        "en" : "Print"
        ,"fr" : "Imprime"
      }
      ,"print_help" : {
        "en" : "Help text here, for long tables, use landscape/legal"
        ,"fr" : "fr"
      }
      ,"print_friend" : {
        "en" : "Printer Friendly"
        ,"fr" : "Imprimer"
      }
      ,"sub_avg": {
        "en": "Average"
        ,"fr": "Moyen"
      }
      ,"sub_total": {
        "en": "Subtotal"
        ,"fr": "Sous Total"
      }
      ,"title" : {
        "en": "Lape and Expenditure Statistics"
        ,"fr": "Statistiques sur les fonds inutilisés et les dépenses"
      }
      ,'table' : {
        'en' : 'Table'
        ,'fr' : 'Tableau'
      }
      ,'tables' : {
        'en' : 'Tables'
        ,'fr' : 'Tableaux'
      }
      ,"total": {
        "en": "Total"
        ,"fr": "Total"
      }
      ,"copy" : {
        "en" : "Copy table for pasting"
        ,"fr": "fr:Copy table for pasting"
      }
      ,"welcome" : {
        "en": "Search above for a  Department to get started"
        ,"fr": "choisis un ministére"
      }
    }
    LANG.l = function(entry,lang){
      return lookups[entry][lang];
    }
})();

