(function() {
    var LANG = ns("LANG");

    var lookups = {
      "data" : {
         "en" : "Data",
         "fr" : "Données" 
      }
      ,'top' : {
         "en" : "To Top",
         "fr" : "Haut" 
      }
      ,'toc' : {
       'en' : 'Table of contents',
        "fr" : "Table des matières" 
      }
      ,"description" :{
         "en" : "Description",
         "fr" : "Déscription" 
      }
      ,"supplementary_data" :{
         "en" : "Supplementary information about",
         "fr" : "Données supplementaires pour" 
      }
      ,"igoc_from" : {
        "en" : "from the Inventory of Government of Canada Organizations"
        ,"fr": "pris de l'Inventaire des organisations du gouvernement du Canada"
      }
      ,"horizontal_table" : {
        "en" : "Horizontal comparison of the selected value across all departments"
        ,"fr" : "Comparaison horizontale entre toutes les organisations pour la valeur sélectionnée"
      }
      ,"horizontal_compare" : {
        "en" : "Horizontal comparison for this value across all departments"
        ,"fr" : "Comparaison horizontale entre toutes les organisations pour la valeur sélectionnée"
      }
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
      ,'type' : {
        "en" : "Type"
        ,"fr" : "Type"
      }
      ,"select" : {
        "en" : "Select"
        ,"fr" : "Sélectionner"
      }
      ,'IGOC_site' : {
        "en" : "http://www.tbs-sct.gc.ca/reports-rapports/cc-se/index-eng.asp"
        ,"fr" : "http://www.tbs-sct.gc.ca/reports-rapports/cc-se/index-fra.asp"
      }
      ,"click" : {
        "en" : "Click",
        "fr" : "Cliquez"
      }
      ,"to_select" : {
        "en" : "Click to select from a list of organisations or",
        "fr" : "Cliquez pour sélectionner parmi une liste d’organisations"
      }
      ,"fin_data"  : {
        "en" : "Financial data for",
        "fr" : "Données financières pour"
      }           
      ,"current_year_fisc" : {
         "en" : "Financial data for the current Fiscal Year (April 1st 2012, March 31st 2013)",
         "fr" : "Données financières pour l'exercise (1 avril á  31 mars, 2013)"
      }
      ,"previous_year_fisc" : {
         "en" : "Financial data from previous fiscal years (2009-10 to 2011-12)",
         "fr" : "Données financières pour les exercises (2009-10 to 2011-12)"
      }
      ,"close" : {
        "en" : "close"
        ,"fr" : "fermer"
      }
      ,"copy_tooltip" : {
        "en" : "Clicking this button will automatically select and copy the table. You can then switch over to Excel and paste in the table"
        ,"fr" : "En cliquant sur ce bouton, le tableau va automatiquement être sélectionné et copié. Vous pouvez ensuite ouvrir Excel et coller le tableau sélectionné"
      }
      ,"more_details" : {
        "en" : "More details for"
        ,"fr": "Plus de détails pour"
      }
      ,"details" : {
        "en" : "Details"
        ,"fr": "Détails"
      }
      ,"back" : {
        "en" : "&larr; Back"
        ,"fr": "&larr; Retour"
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
      ,"org" :{
       "en" : "Organisation"
       ,"fr" : "Organisation"
      }
      ,"open_data_link" : {
       "en" : "Open Data Link"
       ,"fr" : "Lien aux données ouvertes"
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
       "en" :  "Other Organisations in same Ministry"
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
        "en": "Open Data"
        ,"fr": "Donneés ouvertes"
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
      ,"year": {
        "en": "Year"
        ,"fr": "Année"
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
      ,"cancel" : {
        "en" : "Cancel"
        ,"fr": "Annuler"
      }
      ,"search_site" : {
        "en": "Search their site"
        ,"fr": "Cherchez dans leur site web"
      }
      ,"search" : {
        "en": "Start typing here to find a department"
        ,"fr": "Écris ici pour trouver un ministère"
      }
      ,"other" : {
        "en": "Other"
        ,"fr": "Autre"
      }
      ,"remainder" : {
        "en": "Remainder"
        ,"fr": "Rest"
      }
      ,"so" : {
        "en": "Standard Objects"
        ,"fr": "Articles courants"

      }
      ,"program" : {
       'en' : 'Program',
       'fr' : 'Programme'
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
      ,"expenditure_by_vote" : {
        "en" :  "Expenditure by Vote"
        ,"fr" : " Dépenses par crédit voté "
      }
      , "approp_by_auth" : {
        "en" : "Appropriation by Authority"
        ,"fr" :"Crédit par autorisation"
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

