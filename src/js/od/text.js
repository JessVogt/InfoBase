
(function() {
    var LANG = ns("LANG");

    var lookups = {

      "data" : {
         "en" : "Data",
         "fr" : "Données" 
      }
      ,"arrange_by" : {
         "en" : "Arrange by",
         "fr" : "Arrange par" 
      }
      ,"alphabetical" : {
         "en" : "Alphabetical",
         "fr" : "Alphabétique" 
      }
      ,"ministry" : {
         "en" : "Ministry",
         "fr" : "Ministère" 
      }
      ,"no_data" : {
        "en" : "No data available for this table"
        ,"fr" : "Aucune donnée disponible pour cette table"
      }
      ,"financial_size" : {
         "en" : "2012 Expenditures ($000)",
         "fr" : "Dépenses en 2012 ($000)" 
      }
      ,"increased_by" : {
         "en" : "increased by",
         "fr" : "ont augmenté par" 
      }
      ,"decreased_by" : {
         "en" : "decreaed by",
         "fr" : "ont diminué par" 
      }
      ,"greater_than" : {
         "en" : "Greater than ",
         "fr" : "Plus de " 
      }
      ,"less_than" : {
         "en" : "Less than ",
         "fr" : "Moins que " 
      }
      ,"restart" : {
         "en" : "Restart",
         "fr" : "Recommencer" 
      }
      ,"data_table_instructions" :{
          "en": "Any number in the table below may be selected to produce a government-wide table of values for the financial element selected.",
         "fr": "Dans le tableau ci-dessous, il suffit de sélectionner un nombre pour produire un tableau de valeurs à l'échelle du gouvernement pour l'élément financier choisi." 
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
         "fr" : "Description" 
      }
      ,"supplementary_data" :{
         "en" : "Supplementary information about",
         "fr" : "Données supplémentaires pour" 
      }
      ,"igoc_from" : {
        "en" : "from the Inventory of Government of Canada Organizations"
        ,"fr": "provenant de l'Inventaire des organisations du gouvernement du Canada"
      }
      ,"horizontal_table" : {
        "en" : "Horizontal comparison of the selected value across all organizations"
        ,"fr" : "Comparaison horizontale entre toutes les organisations pour la valeur sélectionnée"
      }
      ,"horizontal_compare" : {
        "en" : "Horizontal comparison for this value across all organizations"
        ,"fr" : "Comparaison horizontale entre toutes les organisations pour la valeur sélectionnée"
      }
      ,"legal_name" : {
        "en" : "Legal Title",
        "fr" : "Titre légal"
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
        "en" : "Enabling <span class='wrap-none'>Instrument(s)</span>",
        "fr" : "<span class='wrap-none'> Instrument(s) </span> <span class='wrap-none'> habilitant(s)</span>"
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
        "en" : "Institutional Form"
        ,"fr" : "Type d’institution"
      }
      ,"select" : {
        "en" : "Select"
        ,"fr" : "Sélectionner"
      }
      ,"select_fy" : {
        "en" : "Select fiscal year"
        ,"fr" : "Sélectionner l'exercise"
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
        "en" : "Click here to choose a government organization",
        "fr" : "Cliquez ici pour sélectionner une organisation gouvernementale"
      }
      ,"fin_data"  : {
        "en" : "Financial data for",
        "fr" : "Données financières pour"
      }           
      ,"current_year_fisc" : {
         "en" : "Financial data for the current fiscal year (April 1st 2013 to March 31st 2014)",
         "fr" : "Renseignements financiers concernant l’exercice en cours (1er avril 2013 au 31 mars 2014)"
      }
      ,"previous_year_fisc" : {
         "en" : "Historical financial information for the 2009‒10 to 2011‒12 fiscal years",
         "fr" : "Renseignements financiers historiques des exercices financiers 2009-2010 à 2011-2012"
      }
      ,"previous_year_fisc_targeted" : {
          "en": "Financial information on selected topics for the 2009‒10 to 2011‒12 fiscal years ",
          "fr": "Renseignements financiers sur certains sujets des exercices financiers 2009-2010 à 2011-2012  "
      }
      ,"close" : {
        "en" : "close"
        ,"fr" : "fermer"
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
      ,"voted" : {
        "en" : "Voted"
        ,"fr": "Crédits"
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
        "en" : "Graph(s)"
        ,"fr" : "Graphique(s)"
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
       "en" : "Organization"
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
       "en" :  "Other Organizations in same Ministry"
      ,"fr" : "Autre(s) organisations dans le portefeuille ministériel"
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
        "en": "Organization Total"
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
        ,"fr": "Total pour le Gouvernement"
      }
      ,"copy" : {
        "en" : "Copy table"
        ,"fr": "Copiez le tableau"
      }
      ,"cancel" : {
        "en" : "Cancel"
        ,"fr": "Annuler"
      }
      ,"search" : {
        "en": "Search..."
        ,"fr": "Recherche..."
      }
      ,"other" : {
        "en": "Other(s)"
        ,"fr": "Autre(s)"
      }
      ,"remainder" : {
        "en": "Remainder"
        ,"fr": "Reste"
      }
      ,"so" : {
        "en": "Standard Object"
        ,"fr": "Article courant"
      }
      ,"program" : {
       'en' : 'Program',
       'fr' : 'Programme'
      }
      ,"votestat" : {
        "en": "Vote / Statutory"
        ,"fr": "Crédit / Législatif"
      }
      ,"vote_stat" : {
        "en": "Breakout of Voted and Statutory Expenditures"
        ,"fr": "Répartition des dépenses votées et des dépenses législatives"
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
        ,"fr" : "Autorisations"  
      }
      ,"expenditures" : {
        "en" :  "Expenditures"
        ,"fr" : "Dépenses"  
      }
      ,"change": {
        "en" :  "Change"
        ,"fr" : "Variation"  
      }
      ,"tbs_hide_central" : {
        "en" :  "The TB Central votes are not included"
        ,"fr" : "Les crédits centraux du CT ne sont pas inclus"  
     }
    ,"Estimates": {
        "en": "Estimates"
        , "fr": "Budget des dépenses"
    }
    , "Amount": {
        "en": "Amount"
        , "fr": "Montant"
    }  
        }
    LANG.l = function(entry,lang){
      return lookups[entry][lang];
    }
    LANG.lookups = lookups;
})();

