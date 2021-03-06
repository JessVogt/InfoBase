(function() {
    var LANG = ns("LANG");

    var lookups = {
      "horizontal" : {
        "en" : "Explore horizonally across departments",
        "fr" : "Explorez les données entre les ministères"
      }
      ,"horizontal_compare" : {
        "en" : "Horizontal comparison for this value across all departments"
        ,"fr" : "Comparaison horizontale entre toutes les organisations pour la valeur sélectionnée"
      }
      ,"table" : {
        "en" : "Table"
        ,"fr" : "Tableau"
      }
      ,"cancel" : {
        "en" : "Cancel"
        ,"fr": "Annuler"
      }
      ,"more_details" : {
        "en" : "More details for"
        ,"fr": "Plus de détails pour"
      }
      ,"vertical" : {
        "en" : "Select a department",
        "fr" : "Sélectionnez un ministère"
      }
      ,"to_select" : {
        "en" : "Click to select from a list of organisations or",
        "fr" : "Cliquez pour sélectionner parmi une liste d’organisations"
      }
      // IGOC headers
      ,"legal_name" : {
        "en" : "Legal Name",
        "fr" : "Nom légal"
      }
      ,"applied_title": {
        "en" : "Applied Title",
        "fr" : "Titre d'usage"
      }
      ,"minister": {
        "en" : "Appropriate Minister(s)",
        "fr" : "Ministre(s) de tutelle"
      }
      ,"mandate": {
        "en" : "Mandate",
        "fr" : "Mandat"
      }
      ,"org_head": {
        "en" : "Insitutional Head",
        "fr" : "Premier(ère) dirigeant(e)"
      }
      ,"legislation": {
        "en" : "Legislation",
        "fr" : "Instrument(s) habilitant(s)"
      }
      ,"website": {
        "en" : "Website",
        "fr" : "Site web"
      }
       ,"about" : {
        "en" : "About this table"
        ,"fr" : "À propos de ce tableau"
      }
      ,"select" : {
        "en" : "Select"
        ,"fr" : "Sélectionner"
      }
      ,'IGOC_site' : {
        "en" : "http://www.tbs-sct.gc.ca/reports-rapports/cc-se/index-eng.asp"
        ,"fr" : "http://www.tbs-sct.gc.ca/reports-rapports/cc-se/index-fra.asp"
      }
      ,"allotment" : {
        "en" : "Allotment"
        ,"fr" : "Affectation"
      }
      ,"welcome" : {
        "en" : "<p class='lead'><a class='btn-link dept_sel'>Click</a> to select from a list of organisations</p><span class='badge badge-info'>OR</span><p class='lead'></p><form><input class='input-xlarge dept_search' type='text' placeholder='start typing the name of an organization'></input></form>"
        ,"fr" : "<p class='lead'><a class='btn-link dept_sel'>Cliquez</a> pour sélectionner parmi une liste d’organisations</p> <span class='badge badge-info'>OU</span><p class='lead'></p> <form><input class='input-xlarge dept_search' type='text' placeholder='commencez par taper une organisation'></input></form>"
      }
      ,"no_data" : {
        "en" : "No data avilable for this table"
        ,"fr" : "Pas de données disponibles pour cette table"
      }
      ,"close" : {
        "en" : "close"
        ,"fr" : "fermer"
      }
      ,"copy_tooltip" : {
        "en" : "Clicking this button will automatically select and copy the table. You can then switch over to Excel and paste in the table"
        ,"fr" : "En cliquant sur ce bouton, le tableau va automatiquement être sélectionné et copié. Vous pouvez ensuite ouvrir Excel et coller le tableau sélectionné"
      }
      ,"pie_chart_per" : {
        "en" : "Percentages under 2% are not labeled"
        ,"fr" : "Les pourcentages inférieurs à 2% ne seront pas affichés"
      }
      ,"details" : {
        "en" : "Show more details"
        ,"fr": "Voir plus de détails"
      }
      ,"home" : {
        "en" : "&larr; Start"
        ,"fr": "&larr; Commencement"
      }
      ,"back" : {
        "en" : "&larr; Back"
        ,"fr": "&larr; Retour"
      }
      ,"org_info" : {
        "en" : "Data from Inventory of Government of Canada Organizations"
        ,"fr": "Données pris de l'Inventaire des organisations du gouvernement du Canada"
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
      ,"current_year_fisc" : {
         "en" : "Financial data up to P10 for the current Fiscal Year (April 1st 2012 to January 31st 2012)",
         "fr" : "Données financières jusqu'à P10 pour l'exercice courant (du 1er avril à 31 janvier 2012 )"
      }
      ,"previous_year_fisc" : {
         "en" : "Financial data from previous fiscal years (2009-10 to 2011-12)",
         "fr" : "Données financières pour les exercises (2009-10 to 2011-12)"
      }
      ,"footnotes" : {
        "en" : "Footnotes"
        ,"fr" : "Notes"
      }
      ,"org" :{
       "en" : "Organisation"
       ,"fr" : "Organisation"
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
      ,"rank" : {
        "en": "Rank"
        ,"fr": "Rang"
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
        "en": "Lapse and Expenditure Dashboard"
        ,"fr": "Tableau de bord des fonds inutilisés et des dépenses"
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
      ,"search_site" : {
        "en": "Search their site"
        ,"fr": "Cherchez dans leur site web"
      }
      ,"search_go" : {
        "en": "Search"
        ,"fr": "Cherchez"
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
        ,"fr": "Répartition des dépenses crédits et législatives"
      }
      ,"voted_exp_breakout" : {
        "en": "Voted Expenditure Breakout For"
        ,"fr": "Détail des dépenses votées pour"
      }
      ,"exp_breakout" : {
        "'en": "Expenditure Breakout"
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
      , "gross_lapse" : {
        "en" :  "Gross Lapse"
        ,"fr" : "Fonds inutilisés bruts"
      }
      , "approp_by_auth" : {
        "en" : "Appropriation by Authority"
        ,"fr" :"Crédit par autorisation"
      }
      ,'appropriation_p' : {
        "en" : "Appropriation Period"
        ,"fr" :"Période d'appropriation"
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
      ,'statistics' : {
        "en" :  "Statistics"
        ,"fr" : "Statistiques"
      }
      ,'summary_stats' : {
        "en" :  "Summary"
        ,"fr" : "Sommaire"
      }
      ,'ministry_stats' : {
        "en" :  "Ministry"
        ,"fr" : "Portefeuille"
      }

      ,'government_stats' : {
        "en" :  "Government"
        ,"fr" : "Governement"
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

