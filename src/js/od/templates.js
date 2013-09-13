(function() {
    var T = ns('OD.T');

    T.greeting_en = [
      "<h1>Welcome to the Expenditure Database.</h1>",
      "<p><a class='dept_sel ui-link clickable' href='#'>{{gt 'to_select'}}</a> from a list presented either by ministry, alphabetically or by 2011-12 budgetary net expenditures.  Users will then be directed to the organization’s overview page.</p>",
      "<h2>Navigation</h2>",
      "<ul>",
      "  <li>The overview page of each organization contains brief summary information about that organization: legal name, minister, role (or mandate) in government, and a link to the organization’s enabling legislation.</li>",
      "  <li> Historical financial information for 2009‒10 to 2011‒12 is summarized in three panels on the overview page:",
      "      <ol>",
      "        <li>Authorities and Expenditures</li>",
      "        <li>Expenditures by Standard Object</li>",
      "        <li>Expenditures by Program</li>",
      "      </ol>",
      "  </li>",
      "  <li>Details: Each financial panel expands to show further details (click on the “Details” link). The expanded panel offers various details, including the following:",
      "      <ol>",
      "        <li>Voted or statutory item categories</li>",
      "        <li>Standard object information</li>",
      "        <li>Programs</li>",
      "        <li>Ministry totals</li>",
      "        <li>Government totals</li>",
      "      </ol>",
      "  </li>",
      "  <li>Horizontal comparison: Within the expanded panels, users can click on any value to view a table comparing that organization’s data to all other organizations in the federal government.</li>",
      "  <li>Users on the overview page can also choose from a list of other organizations that are part of the same ministerial portfolio.</li>",
      "</ul>"
    ];

    T.greeting_fr = [
        "<h1>Bienvenue sur la Base de données des dépenses.</h1>",
        "<p><a class='dept_sel ui-link clickable' href='#'>{{gt 'to_select'}}</a>  à partir d’une liste organisée soit par portefeuille ministériel ou sous forme alphabétique ou encore selon les dépenses nettes pour l’exercice 2011-2012.  Les utilisateurs seront ensuite redirigés vers la page « Aperçu » de l’organisation choisie.</p>",
        "<h2>Navigation</h2>",
        "<ul>",
        "  <li>La page « Aperçu » de chaque organisation présente un court résumé de cette dernière  — appellation légale, ministre, rôle (ou mandat) au sein du gouvernement — et contient un lien vers la loi habilitante de cette organisation.</li>",
        "  <li>Les informations financières historiques pour les exercices 2009-2010 à 2011-2012 sont résumées en trois tableaux sur la page « Aperçu » :",
        "      <ol>",
        "        <li>Autorisations et dépenses </li>",
        "        <li>Dépenses par article courant </li>",
        "        <li>Dépenses par programme </li>",
        "      </ol>",
        "  </li>",
        "  <li>a. Détails : Chaque tableau s’agrandit pour fournir des informations supplémentaires (cliquez sur le lien « Détails »). Le tableau ainsi agrandit présente notamment :",
        "      <ol>",
        "        <li>les catégories de crédits votés et de postes législatifs</li>",
        "        <li>de l’information sur les articles courants </li>",
        "        <li>les programmes </li>",
        "        <li>les montants totaux pour le portefeuille ministériel </li>",
        "        <li>les montants totaux pour le gouvernement </li>",
        "      </ol>",
        "  </li>",
        "  <li>Comparaison horizontale : À l’intérieur des tableaux agrandis, les utilisateurs peuvent cliquer sur une valeur pour consulter un tableau comparant les données de cette organisation avec celles de toutes les autres organisations fédérales. </li>",
        "  <li>Dans la page « Aperçu », les utilisateurs peuvent également choisir, dans une liste, d’autres organisations qui font partie du même portefeuille ministériel. </li>",
        "</ul>"
    ];

    T.home = [
       "<div>",
       "  <div class='border-bottom span-8' ",
       "    style='padding-bottom:5px;'>",
       "    <div class='span-5'>",
       "      <a href='#' class='dept_sel ui-link clickable'>",
       "        {{{gt 'to_select'}}}",
       "      </a>",
       "    </div>",
       "    <div class='span-1' id='back_button'>",
       "    </div>",
       "  </div>",
       "  <div class='clear'></div>",
       "  <div class='org_list_by_min span-8'>",
       "  </div>",
       "  <div class='dept_zone span-8'>",
       "    <div class='span-1'></div>",
       "    <div class=' span-6'>",
       "      {{{greeting}}}",
       "    </div>",
       "  </div>",
       "</div>"
    ];

    _.each(T,function(ar,key){
      console.log(key);
      ar = _.map(ar,$.trim);
      T[key] = Handlebars.compile(ar.join(""));
    });

})();
