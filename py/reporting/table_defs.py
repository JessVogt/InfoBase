# -*- coding: utf-8 -*-
tables =  { 
  "Table1" : { "col_defs" : [ "float",
          "str",
          "float",
          "float",
          "float",
          "float",
          "percentage",
          "float",
          "percentage",
          "float",
          "percentage"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [ { "colspan" : 2,
                  "header" : "Vote"
                },
                { "colspan" : 5,
                  "header" : "2011-12"
                },
                { "colspan" : 2,
                  "header" : "2012-13"
                },
                { "colspan" : 2,
                  "header" : "5 Year Average**"
                }
              ],
              [ "Vote Number",
                "Vote Description",
                "Authority",
                "Expenditures at Period 9",
                "Forecast Exenditures at year end",
                "Forecast Lapse (by EACPD*)",
                "Forecast Lapse (by EACPD*)",
                "Previous Year Gross Lapse (2010-11)",
                "Previous Year Gross Lapse Percentage (2010-11)",
                "5 Year Gross Lapse Average",
                "5 Year Gross Lapse Percentage"
              ]
            ],
          "fr" : [ [ { "colspan" : 2,
                  "header" : "Vote"
                },
                { "colspan" : 5,
                  "header" : "2011-12"
                },
                { "colspan" : 2,
                  "header" : "2012-13"
                },
                { "colspan" : 2,
                  "header" : "Moyenne sur cinq ans** "
                }
              ],
              [ "Numéro de crédit",
                "Nom du crédit",
                "Autorité",
                "Budgets Dépenses à la période 9",
                "Dépenses prévues à la fin de l'année",
                "Fonds inutilisés estimés par la DADPR*",
                "Fonds inutilisés estimés par la DADPR*",
                "Fonds inutilisés bruts de l'année précédente",
                "Fonds inutilisés bruts de l'année précédente en pourcentage",
                "Moyenne des fonds inutilisés bruts sur 5 ans",
                "Moyenne des fonds inutilisés bruts sur 5 ans en pourcentage"
              ]
            ]
        },
      "name" : { "en" : "Lapse Forecast",
          "fr" : "Prévision des fonds inutilisés"
        },
      "title" : { "en" : "Table 1 - Lapse Forecast for 2011-12 based on December data (P9) ($000)",
          "fr" : "Tableau 1 - Prévision des fonds inutilisés basée sur les dépenses de Décembre 2011 (P9)"
        }
    },
  "Table2" : { "col_defs" : [ "int",
          "str",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [ "Vote Number / Stat Item",
                "Vote / Statutory Description",
                "Gross Appropriations",
                "Revenues",
                "Net Appropriations",
                "Gross Expenditures",
                "Revenues",
                "Net Expenditures"
              ] ],
          "fr" : [ [ "Numéro de Crédit / Statutaire",
                "Description des dépenses votées et statutaires",
                "Crédits bruts",
                "Recettes",
                "Crédits Net",
                "Dépenses brutes",
                "Recettes",
                "Dépenses nettes"
              ] ]
        },
      "name" : { "en" : "Authority and Expenditure",
          "fr" : "Crédits et dépenses"
        },
      "title" : { "en" : "Table 2 - Authority and Expenditure based on August data (P5) ($000)",
          "fr" : "Tableau 2 - Crédits et dépenses à la fin de Août 2011 (P5) ($000)"
        }
    },
  "Table2a" : { "col_defs" : [ "wide-str",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [ { "colspan" : 1,
                  "header" : ""
                },
                { "colspan" : 6,
                  "header" : "2011 - 12 Period 5"
                },
                { "colspan" : 6,
                  "header" : "2010 - 11"
                },
                { "colspan" : 6,
                  "header" : "2009 - 10"
                }
              ],
              [ "Program Activity",
                "Operating",
                "Capital",
                "Grants & Contrib.",
                "Other Votes",
                "Statutory",
                "Total 2013-12",
                "Operating",
                "Capital",
                "Grants & Contrib.",
                "Other Votes",
                "Statutory",
                "Total 2010-11",
                "Operating",
                "Capital",
                "Grants & Contrib.",
                "Other Votes",
                "Statutory",
                "Total 2009-10"
              ]
            ],
          "fr" : [ [ { "colspan" : 1,
                  "header" : ""
                },
                { "colspan" : 6,
                  "header" : "2011 - 12 Période 5"
                },
                { "colspan" : 6,
                  "header" : "2010 - 11"
                },
                { "colspan" : 6,
                  "header" : "2009 - 10"
                }
              ],
              [ "Activites de programme",
                "Fonctionnement",
                "Capital",
                "Subventions & Contributions",
                "Autres Crédits",
                "Statutaires",
                "Total 2011-12",
                "Fonctionnement",
                "Capital",
                "Subventions & Contributions",
                "Autres Crédits",
                "Statutaires",
                "Total 2010-11",
                "Fonctionnement",
                "Capital",
                "Subventions & Contributions",
                "Autres Crédits",
                "Statutaires",
                "Total 2009-10"
              ]
            ]
        },
      "name" : { "en" : "Expenditures by Program",
          "fr" : "Dépenses par Activité"
        },
      "title" : { "en" : "Table 2A - Expenditures by Program Activity ($000)",
          "fr" : "Tableau 2A - Dépenses par Activité de programme ($000)"
        }
    },
  "Table2b" : { "col_defs" : [ "float",
          "str",
          "float",
          "float",
          "percentage",
          "float",
          "float",
          "percentage"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [ { "colspan" : 1,
                  "header" : "Vote Number"
                },
                { "colspan" : 1,
                  "header" : "Vote Description"
                },
                { "colspan" : 3,
                  "header" : "2011 - 12 Period 9"
                },
                { "colspan" : 3,
                  "header" : "2010 - 11 Period 9"
                }
              ],
              [ "",
                "",
                "Net Authority",
                "Net Expenditures",
                "Spending Rate",
                "Net Authority",
                "Net Expenditures",
                "Spending Rate"
              ]
            ],
          "fr" : [ [ { "colspan" : 1,
                  "header" : "Numéro de Crédit"
                },
                { "colspan" : 1,
                  "header" : "Description du Crédit"
                },
                { "colspan" : 3,
                  "header" : "2011-12  Période 9"
                },
                { "colspan" : 3,
                  "header" : "2010-11  Période 9"
                }
              ],
              [ "",
                "",
                "Budgets nets",
                "Dépenses nettes",
                "Niveau de dépense",
                "Budgets nets",
                "Dépenses nettes",
                "Niveau de dépense"
              ]
            ]
        },
      "name" : { "en" : "Spending Rate Comparison",
          "fr" : "Niveau de dépense"
        },
      "title" : { "en" : "Table 2B - Spending Rate Comparison (2011-12 vs 2010-11)",
          "fr" : "Tableau 2B - Niveau de dépense (2011-12 vs 2010-11)"
        }
    },
  "Table3" : { "col_defs" : [ "int",
          "str",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [ { "colspan" : 1,
                  "header" : "Vote Number"
                },
                { "colspan" : 1,
                  "header" : "Vote Description"
                },
                { "colspan" : 1,
                  "header" : "Gross Appropriations"
                },
                { "colspan" : 3,
                  "header" : "Revenues Credited to the Vote"
                },
                { "colspan" : 12,
                  "header" : "Net Appropriations"
                }
              ],
              [ "",
                "",
                "Gross Total",
                "Main Estimates",
                "Treasury Board Authorities",
                "Total Revenues",
                "Multi-year appropriations",
                "Main Estimates",
                "SE(A)",
                "SE(B)",
                "SE(C)",
                "Transfers from TB Vote 5 Gov. Contengencies",
                "Transfers from TB Vote 10 Gov. Wide Initiatives ",
                "Transfers from TB Vote 15 Compens. Adjustments  ",
                "Transfers from TB Vote 25 OBCF  ",
                "Transfers from TB Vote 30 Paylist Requirements ",
                "Transfers from TB Vote 33 CBCF ",
                "PT",
                "Net Total"
              ]
            ],
          "fr" : [ [ { "colspan" : 1,
                  "header" : "Numéro de crédit"
                },
                { "colspan" : 1,
                  "header" : "Description du Crédit"
                },
                { "colspan" : 1,
                  "header" : "Imputations brutes"
                },
                { "colspan" : 3,
                  "header" : "Revenus à valoir sur le(s) crédit(s)"
                },
                { "colspan" : 12,
                  "header" : "Imputations nettes"
                }
              ],
              [ "",
                "",
                "Total Brut",
                "Budget Principal",
                "Autorité du Conseil du du Trésor",
                "Total des Revenus",
                "Crédits pluri-annluels",
                "Budget principal",
                "Supp. A",
                "Supp. B",
                "Supp. C",
                "Transferts du crédit 5 du CT (Éventualités du gouvernement)",
                "Transferts du crédit 10 du CT (Initiatives pangouvernementales)",
                "Transferts du crédit 15 du CT (Rajustements à la rémunération)",
                "Transferts du crédit 25 du CT (Report du budget de fonctionnement)",
                "Transferts du crédit 30 du CT (Besoins en matière de rémunération)",
                "Transferts du crédit 30 du CT (Report du budget d'immobilisations)",
                "PT",
                "Total net"
              ]
            ]
        },
      "name" : { "en" : "Appropriation by Authority",
          "fr" : "Appropriations par autorité"
        },
      "title" : { "en" : " Table 3 - Appropriation by Authority ($000)",
          "fr" : "Tableau 3 - Appropriations par autorité   ($000)"
        }
    },
  "Table4" : { "col_defs" : [ "int",
          "str",
          "date",
          "float",
          "float",
          "float",
          "float",
          "percentage",
          "float",
          "percentage",
          "float",
          "float",
          "float",
          "float",
          "percentage"
        ],
      "coverage" : "historical",
      "headers" : { "en" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 5,
                  "header" : "Gross Lapse"
                },
                { "colspan" : 2,
                  "header" : "Forecast"
                },
                { "colspan" : 3,
                  "header" : "Gross Lapse Components"
                },
                { "colspan" : 2,
                  "header" : "Net Lapse"
                }
              ],
              [ "Vote Number 2010-11",
                "Vote Description",
                "Year",
                "Net Authority",
                "Net Expenditures",
                "Available next year",
                "Gross Lapse (Public Accounts)",
                "Gross Lapse Percentage (Public Accounts)(%)",
                "Department Forecast at P9",
                "Department Forecast at P9 (%)",
                "Frozen Allotment",
                "Special Purpose Allotment",
                "OBCF & CBCF Allowed",
                "Net Lapse",
                "Net Lapse (%)"
              ]
            ],
          "fr" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 5,
                  "header" : "Fonds inutilisés bruts"
                },
                { "colspan" : 2,
                  "header" : "Prévisions"
                },
                { "colspan" : 3,
                  "header" : "Ajustements aux fonds inutilisés bruts"
                },
                { "colspan" : 2,
                  "header" : "Fonds inutilisés"
                }
              ],
              [ "Numéro de crédit 2010-11",
                "Description du cédit",
                "Année",
                "Autorités nettes",
                "Dépenses nettes",
                "Disponible dans les exercices ultérieurs",
                "Fonds inutilisés bruts",
                "Fonds inutilisés bruts (%)",
                "Prévision du ministére à P9",
                "Prévision du ministére à P9 (%)",
                "Fonds bloqués",
                "Fonds à fin déterminée inutilisés",
                "Budgets reportés",
                "Fonds inutilisés nets",
                "Fonds inutilisés nets (%)"
              ]
            ]
        },
      "name" : { "en" : "Lapses",
          "fr" : "Fonds inutilisés"
        },
      "title" : { "en" : "Table 4 - Gross and Net Lapses by Vote from 2006-07 to 2010-11 ($000)",
          "fr" : "Tableau 4 - Fonds inutilisés bruts et nets par crédit de 2006-07 à 2010-11 ($000)"
        }
    },
  "Table5" : { "col_defs" : [ "int",
          "str",
          "date",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "historical",
      "headers" : { "en" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "total operating"
                },
                { "colspan" : 3,
                  "header" : "Capital"
                },
                { "colspan" : 3,
                  "header" : "Transfer Payments"
                },
                { "colspan" : 3,
                  "header" : "Special Purpose*"
                },
                { "colspan" : 3,
                  "header" : "Frozen"
                },
                { "colspan" : 3,
                  "header" : "Total"
                }
              ],
              [ "Vote Number 2010-11",
                "Vote Description",
                "Year",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**"
              ]
            ],
          "fr" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "Fonctionnement"
                },
                { "colspan" : 3,
                  "header" : "Capital"
                },
                { "colspan" : 3,
                  "header" : "Paiements de Transfert"
                },
                { "colspan" : 3,
                  "header" : "Affectations à fin spéciale*"
                },
                { "colspan" : 3,
                  "header" : "Montants gelés"
                },
                { "colspan" : 3,
                  "header" : "Total"
                }
              ],
              [ "Numéro de crédit 2010-11",
                "Description du cédit",
                "Année",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts**",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts**",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts**",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts**",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts**",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts**"
              ]
            ]
        },
      "name" : { "en" : "Voted Expenditures by Allotment",
          "fr" : "Détail des dépenses votées"
        },
      "title" : { "en" : "Table 5 - Voted Expenditures by Allotment from 2006-07 to 20010-11($000)",
          "fr" : "Tableau 5 - Détail des dépenses votées par affectation de 2006-07 à 2010-11 ($000)"
        }
    },
  "Table6" : { "col_defs" : [ "int",
          "str",
          "date",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "historical",
      "headers" : { "en" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "Personnel"
                },
                { "colspan" : 3,
                  "header" : "Other Operating Costs"
                },
                { "colspan" : 3,
                  "header" : "Revenues"
                },
                { "colspan" : 3,
                  "header" : "Total Spending"
                }
              ],
              [ "Vote Number 2010-11",
                "Vote Description",
                "Year",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**",
                "Authority",
                "Expenditures",
                "Gross Lapse**"
              ]
            ],
          "fr" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "Personnel"
                },
                { "colspan" : 3,
                  "header" : "Autres coût de fonctionnement"
                },
                { "colspan" : 3,
                  "header" : "Revenus"
                },
                { "colspan" : 3,
                  "header" : "Total"
                }
              ],
              [ "Numéro de crédit 2010-11",
                "Description du cédit",
                "Année",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts*",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts*",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts*",
                "Autorité",
                "Dépenses",
                "Fonds Périmés Bruts*"
              ]
            ]
        },
      "name" : { "en" : "Expenditures by Operating Allotment",
          "fr" : "Dépenses de fonctionnement par affectation"
        },
      "title" : { "en" : "Table 6 - Expenditures by Operating Allotment from 2006-07 to 2010-11 ($000)",
          "fr" : "Tableau 6 - Dépenses de fonctionnement par affectation de 2006-07 à 2010-11 ($000) "
        }
    },
  "Table7" : { "col_defs" : [ "int",
          "str",
          "date",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "historical",
      "headers" : { "en" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 16,
                  "header" : "Standard Objects"
                }
              ],
              [ "Vote Number 2010-11 / Statutory",
                "Vote Description / Statutory",
                "Year",
                "Personnel",
                "Transportation and communication",
                "Information",
                "Professional and special services",
                "Rentals",
                "Repair and maintenance",
                "Utilities, materials, and supplies",
                "Acquisition of land, buildings, and works",
                "Acquisition of machinery and equipment",
                "Transfer Payments",
                "Other subsidies and payments",
                "Public Debt Charges",
                "Total Gross Expenditues",
                "External Revenues",
                "Internal Revenues",
                "Total Net Expenditues"
              ]
            ],
          "fr" : [ [ { "colspan" : 3,
                  "header" : ""
                },
                { "colspan" : 16,
                  "header" : "Articles courants"
                }
              ],
              [ "Num. de crédit 2010-11 / Stat.",
                "Description du crédit / Statutaire",
                "Année",
                "Personnel",
                "Transports et communications",
                "Information",
                "Services professionels et speciaux",
                "Location",
                "Services de réparation et d'entretien",
                "Services publics, fournitures et approv.",
                "Acquisition de terrains, batiments et ouvrages",
                "Acquisition de materiel et d'outillage",
                "Paiements de transfert",
                "Autres subventions et paiements",
                "Frais de la dette",
                "Total des dépenses brutes",
                "Revenus internes",
                "Revenus externes",
                "Total des dépenses nettes"
              ]
            ]
        },
      "name" : { "en" : "Expenditures by Standard Object",
          "fr" : "Dépenses par article courant"
        },
      "title" : { "en" : "Table 7 - Expenditures by Standard Object from 2007-08 to 2010-11 ($000)",
          "fr" : "Tableau 7 - Dépenses par article courant de 2007-08 à 2010-11 ($000)"
        }
    }
}
