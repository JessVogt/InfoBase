(function() {
    var LANG = ns("LANG");

    var lookups = {
       "about" : {
        "en" : "About this table"
        ,"fr" : "À propos de ce tableau"
      }
      ,"select" : {
        "en" : "Select"
        ,"fr" : "Sélectionner"
      }
      ,"welcome" : {
        "en" : ["Click to select from a list of organisations ",
                "<span class='badge badge-info'>OR</span>",
                 " start typing the name of an organisation or its accronym."
                ].join("")
        ,"fr" : ["Cliquez pour sélectionner parmi une liste d’organisations ",
                 "<span class='badge badge-info'>OU</span>",
                 " commencez par entrer le nom d'une organisation ou son acronyme."
                ].join("")
      }
      ,"close" : {
        "en" : "close"
        ,"fr" : "fermer"
      }
      ,"copy_tooltip" : {
        "en" : "Clicking this button will automatically select and copy the table. You can then switch over to Excel and paste in the table"
        ,"fr" : "En cliquant sur ce bouton, le tableau va automatiquement être sélectionné et copié. Vous pouvez ensuite  ouvrir Excel et coller le tableau sélectionné"
      }
      ,"pie_chart_per" : {
        "en" : "Percentages under 2% are not labeled"
        ,"fr" : "Les pourcentages inférieurs à 2% ne sera pas affichée"
      }
      ,"details" : {
        "en" : "Show more details"
        ,"fr": "Voir plus de détails"
      }
      ,"hide" : {
        "en" : "Hide detail"
        ,"fr": "Masquer les détails"
      }
      ,"vote" : {
        "en" : "Vote"
        ,"fr": "Crédit"
      }
      ,"stat" : {
        "en" : "Statutory"
        ,"fr": "Législatif"
      }
      ,"full_screen" : {
        "en" : "Full Screen"
        ,"fr": "Plein écran"
      }
      ,"graphs" : {
        "en" : "Graphs"
        ,"fr" : "Graphiques"
      }
      ,"lang" : {
        "en" : "Français"
        ,"fr" : "English"
      }
      ,"footnotes" : {
        "en" : "Footnotes"
        ,"fr" : "Notes"
      }
      ,"loading" : {
        "en": "Loading"
        ,"fr": "Chargement"
      }
      ,"print" : {
        "en" : "Print"
        ,"fr" : "Imprimer"
      }
      ,"other_in_min" : {
       "en" :  "Other Organisations in ministry"
      ,"fr" : "Autres organisations dans le portefeuille"
      }
      ,"print_help" : {
        "en" : "For long tables, use landscape/legal"
        ,"fr" : "Pour les tableaux plus longs, utiliser les options paysage et légal "
      }
      ,"print_friend" : {
        "en" : "Printer Friendly"
        ,"fr" : "Impression optimisée "
      }
      ,"sub_avg": {
        "en": "Average"
        ,"fr": "Moyenne"
      }
      ,"sub_total": {
        "en": "Subtotal"
        ,"fr": "Sous total"
      }
      ,"title" : {
        "en": "Lapse and Expenditure Statistics"
        ,"fr": "Statistiques sur les fonds inutilisés et les dépenses"
      }
      ,"table" : {
        "en" : "Table"
        ,"fr" : "Tableau"
      }
      ,"tables" : {
        "en" : "Tables"
        ,"fr" : "Tableaux"
      }
      ,"total": {
        "en": "Org Total"
        ,"fr": "Total pour l’organisation"
      }
      ,"year_total": {
        "en": "Year Total"
        ,"fr": "Total pour l'année"
      }
      ,"min_total": {
        "en": "Ministry Total"
        ,"fr": "Total pour le portefeuille ministériel"
      }
      ,"goc_total": {
        "en": "Government Total"
        ,"fr": "Total pour le Gouvernment"
      }
      ,"copy" : {
        "en" : "Copy table"
        ,"fr": "Copiez le tableau"
      }
      ,"search" : {
        "en": "Organisation search..."
        ,"fr": "Cherchez une organisation"
      }
      ,"other" : {
        "en": "Other"
        ,"fr": "Autre"
      }
      ,"so" : {
        "en": "Standard Objects"
        ,"fr": "Articles courants"
      }
      ,"graph2b_title" : {
        "en": "Comparison of Authorities and Expenditures Between This Period and the Same from the Previous Fiscal year"
        ,"fr": "Comparaison des crédits et dépenses entre cette période et la même à partir de l'exercice précédent"
      }
      ,"graph7_title_1" : {
        "en": "5 Year Average of Major Standard Objects"
        ,"fr": "Le moyenne de cinq ans des articles courants principaux"
      }
      ,"graph7_title_2" : {
        "en": "5 Year Average of Major Standard Objects by Vote/Stat"
        ,"fr": "Le moyenne de cinq ans des articles courants principaux par crédits votés/législatifs"
      }
      ,"graph7_footnote" : {
        "en" :  "Major standard objects are those represnting more than 5% of total expenditures."
        ,"fr" : " Les objets courants principaux sont ceux qui représentent plus de 5% des dépenses totales."  
      }
      ,"votestat" : {
        "en": "Vote / Stat"
        ,"fr": "Crédit / Législatif"
      }
      ,"vote_stat" : {
        "en": "Breakout of Voted and Statutory Expenditures"
        ,"fr": "Breakout de dépenses crédits et législatives"
      }
      ,"voted_exp_breakout" : {
        "en": "Voted Expenditure Breakout For"
        ,"fr": "Détail des dépenses votées"
      }
      ,"exp_breakout" : {
        "en": "Expenditure Breakout"
        ,"fr": "Détail des dépenses"
      }
      ,"graph5_title_1" : {
        "en" :  "5 Year Average for Voted Expenditures by Allotment"
        ,"fr" : "Le moyenne des 5 années des détails des dépenses votées par affection"
      }
      ,"expenditure_by_vote" : {
        "en" :  "Expenditure by Vote"
        ,"fr" : " Dépenses par crédit voté "
      }
      , "net_lapse" : {
        "en" :  "Net Lapse"
        ,"fr" : "Fonds inutilisés nets"
      }
      , "approp_by_auth" : {
        "en" : "Appropriation by Authority"
        ,"fr" :"Crédit par autorisation"
      }
      , "central_vote_transfer" : {
        "en" :  "Central Vote Transfers"
        ,"fr" : "Transferts des crédits centraux"
      }
      ,"history_spend" : {
        "en" :  "Historical Expenditures"
        ,"fr" : "Dépenses historiques"
      }
      ,"help" : {
        "en" :  "Help"
        ,"fr" : "Aide"
      }
      ,"lapse_forcast"  : {
        "en" :  "Lapse Forecast"
        ,"fr" : "Fonds inutilisés"
      }
      ,"lapse_history"  : {
        "en" :  "Lapse History"
        ,"fr" : "Historique des fonds inutilisés"
      }
      ,"details_help"  : {
        "en" :  "Due to the size of this table, some columns are hidden by default"
        ,"fr" : "En raison de la taille de ce tableau, certaines colonnes sont masquées par défaut"  
      }
      ,"graph2_title" : {
        "en" :  "Comparison of current spending to authorities"
        ,"fr" : "Comparaison des dépenses courantes aux crédits"
      }
      ,"gross" : {
        "en" :  "Gross"
        ,"fr" : "Bruts"  
      }
      ,"revenues" : {
        "en" :  "Revenues"
        ,"fr" : "Recettes"  
      }
      ,"authorities" : {
        "en" :  "Authorities"
        ,"fr" : "Crédits"  
      }
      ,"expenditures" : {
        "en" :  "Expenditures"
        ,"fr" : "Dépenses"  
      }
      ,"tbs_hide_central" : {
        "en" :  "The TB Central votes are not included"
        ,"fr" : "Les crédits centraux du CT ne sont pas inclus"  
      }
    }
    LANG.l = function(entry,lang){
      return lookups[entry][lang];
    }
    LANG.lookups = lookups;
})();

