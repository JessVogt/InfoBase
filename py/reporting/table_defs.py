# -*- coding: utf-8 -*-
f = {
  "month_en" : "September",
  "month_fr" : "september",
  "p" : 6
}
tables =  { 
  "Table1" : { "col_defs" : [ "int",
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
                  "header" : ""
                },
                { "colspan" : 5,
                  "header" : "2012-13"
                },
                { "colspan" : 2,
                  "header" : "2011-12"
                },
                { "colspan" : 2,
                  "header" : "5 Year Average**"
                }
              ],
              [ "Vote",
                "Description",
                "Authority",
                "Expenditures at Period {p}".format(**f),
                "Forecast Exenditures at year end",
                "Forecast Lapse (by EACPD*)",
                "Forecast Lapse % (by EACPD*)",
                "Previous Year Gross Lapse (2010-11)",
                "Previous Year Gross Lapse Percentage (2010-11)",
                "5 Year Gross Lapse Average",
                "5 Year Gross Lapse Percentage"
              ]
            ],
          "fr" : [ [ { "colspan" : 2,
                  "header" : ""
                },
                { "colspan" : 5,
                  "header" : "2012-13"
                },
                { "colspan" : 2,
                  "header" : "2011-12"
                },
                { "colspan" : 2,
                  "header" : "Moyenne sur cinq ans** "
                }
              ],
              [ "Crédit",
                "Nom",
                "Autorité",
                "Budgets Dépenses à la période {p}".format(**f),
                "Dépenses prévues à la fin de l'année",
                "Fonds inutilisés (estimés par la DADPR*)",
                "Fonds inutilisés % (estimés par la DADPR*)",
                "Fonds inutilisés bruts de l'année précédente",
                "Fonds inutilisés bruts de l'année précédente en pourcentage",
                "Moyenne des fonds inutilisés bruts sur 5 ans",
                "Moyenne des fonds inutilisés bruts sur 5 ans en pourcentage"
              ]
            ]
        },
      "name" : { "en" : "1 - Lapse Forecast",
                "fr" : "1 - Prévision des fonds inutilisés"
        },
      "title" : { "en" : "Table 1 - Lapse Forecast for 2011-12 based on {month_en} data (P{p}) ($000)".format(**f),
          "fr" : "Tableau 1 - Prévision des fonds inutilisés basée sur les dépenses de {month_fr} 2011 (P{p}) ($000)".format(**f)
        }
      ,"key" : [0,1]
    },
  "Table2" : { "col_defs" : [ "int",
          "wide-str",
          "float",
          "float",
          "float",
          "float",
          "float",
          "float"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [
                { "colspan" : 2,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "Authorities"
                },
                { "colspan" : 3,
                  "header" : "Expenditures"
                }
        ],
        [ "Vote / Stat",
                "Description",
                "Gross",
                "Revenues",
                "Net",
                "Gross",
                "Revenues",
                "Net"
              ] ],
          "fr" : [[
                { "colspan" : 2,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "Crédits"
                },
                { "colspan" : 3,
                  "header" : "Dépenses"
                }
            ],  
            [ "Crédit / Statutaire",
                "Description",
                "Bruts",
                "Recettes",
                "Net",
                "Brutes",
                "Recettes",
                "Nettes"
              ] ]
        },
      "name" : { "en" : "2 - Authority and Expenditure",
          "fr" : "2 - Crédits et dépenses"
        },
      "title" : { "en" : "Table 2 - Authority and Expenditure based on {month_en} data (P{p}) ($000)".format(**f),
          "fr" : "Tableau 2 - Crédits et dépenses à la fin de {month_fr} (P{p}) ($000)".format(**f)
        }
      ,"key" : [0,1]
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
                  "header" : "2012-13 Period {p}".format(**f)
                },
                { "colspan" : 6,
                  "header" : "2011-12 Period {p}".format(**f)
                },
                { "colspan" : 6,
                  "header" : "2010-11 Period {p}".format(**f)
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
                  "header" : "2012 - 13 Période {p}".format(**f)
                },
                { "colspan" : 6,
                  "header" : "2011 - 12 Période {p}".format(**f)
                },
                { "colspan" : 6,
                  "header" : "2010 - 11 Période {p}".format(**f)
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
      "name" : { "en" : "2a - Expenditures by Program",
          "fr" : "2a - Dépenses par Activité"
        },
      "title" : { "en" : "Table 2A - Expenditures by Program Activity ($000)",
          "fr" : "Tableau 2A - Dépenses par Activité de programme ($000)"
        }
      ,"key" : [0]
    },
  "Table2b" : { "col_defs" : [ "int",
          "str",
          "float",
          "float",
          "percentage",
          "float",
          "float",
          "percentage"
        ],
      "coverage" : "in_year",
      "headers" : { "en" : [ [ { "colspan" : 2,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "2012-13 Period {p}".format(**f)
                },
                { "colspan" : 3,
                  "header" : "2011-12 Period {p}".format(**f)
                }
              ],
              [ "Vote",
                "Description",
                "Net Authority",
                "Net Expenditures",
                "Spending Rate",
                "Net Authority",
                "Net Expenditures",
                "Spending Rate"
              ]
            ],
          "fr" : [ [ { "colspan" : 2,
                  "header" : ""
                },
                { "colspan" : 3,
                  "header" : "2012-13  Période {p}".format(**f)
                },
                { "colspan" : 3,
                  "header" : "2011-12  Période {p}".format(**f)
                }
              ],
              [ "Crédit",
                "Description",
                "Budgets nets",
                "Dépenses nettes",
                "Niveau de dépense",
                "Budgets nets",
                "Dépenses nettes",
                "Niveau de dépense"
              ]
            ]
        },
      "name" : { "en" : "2b - Spending Rate Comparison",
          "fr" : "2b - Niveau de dépense"
        },
      "title" : { "en" : "Table 2B - Spending Rate Comparison (2012-13 vs 2011-12)",
          "fr" : "Tableau 2B - Niveau de dépense (2012-13 vs 2011-12)"
        }
      ,'key' : [0,1]
    },
  "Table3" : { "col_defs" : [ "int",
          "wide-str",
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
      "headers" : { "en" : [ [ { "colspan" : 2,
                  "header" : ""
                },
                { "colspan" : 1,
                  "header" : "Gross Authorities"
                },
                { "colspan" : 3,
                  "header" : "Revenues Credited to the Vote"
                },
                { "colspan" : 13,
                  "header" : "Net Authorities"
                }
              ],
              [ "Vote",
                "Description",
                "Gross Total",
                "Main Estimates",
                "Treasury Board Authorities",
                "Total Revenues",
                "Multi-year Authorities",
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
          "fr" : [ [ { "colspan" : 2,
                  "header" : ""
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
              [ "Crédit",
                "Description",
                "Total Brut",
                "Budget Principal",
                "Autorité du Conseil du du Trésor",
                "Total des Revenus",
                "Crédits pluri-annuels",
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
      "name" : { "en" : "3 - Authorities",
          "fr" : "3 - Autorités"
        },
      "title" : { "en" : " Table 3 - Authorities ($000)",
          "fr" : "Tableau 3 - Autorités ($000)"
        }
      ,'key' : [0,1]
    },
  "Table4" : { "col_defs" : [ "int",
          "str",
          "date",
          "float",
          "float",
          "float",
          "float",
          "float",
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
                  "header" : "Gross"
                },
                { "colspan" : 2,
                  "header" : "Public Accounts"
                },
                { "colspan" : 3,
                  "header" : "Gross Lapse Components"
                },
                { "colspan" : 2,
                  "header" : "Net Lapse*"
                }
              ],
              [ "Vote (2011-12)",
                "Description",
                "Year",
                "Net Authority",
                "Net Expenditures",
                "Gross Lapse",
                "Multi-Year Authorities",
                "Over Expenditure",
                "Lapse**",
                "Lapse Percentage (%)",
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
                  "header" : "Bruts"
                },
                { "colspan" : 2,
                  "header" : "Comptes publics"
                },
                { "colspan" : 3,
                  "header" : "Ajustements aux fonds inutilisés bruts"
                },
                { "colspan" : 2,
                  "header" : "Fonds inutilisés"
                }
              ],
              ["Crédit (2011-12)",
               "Description",
               "Année",
               "Autorités nettes",
               "Dépenses nettes",
               "Fonds inutilisés bruts",
               "Autorités pluri-annuels",
               "Dépenses excédentaires",
               "Fonds inutilisés",
               "Fonds inutilisés (%)",
               "Fonds bloqués",
               "Fonds à fin déterminée inutilisés",
               "Budgets reportés",
               "Fonds inutilisés nets",
               "Fonds inutilisés nets (%)"
              ]
            ]
        },
      "name" : { "en" : "4 - Lapses",
          "fr" : "4 - Fonds inutilisés"
        },
      "title" : { "en" : "Table 4 - Gross and Net Lapses by Vote from 2007-08 to 2011-12 ($000)",
          "fr" : "Tableau 4 - Fonds inutilisés bruts et nets par crédit de 2007-08 à 2011-12 ($000)"
        }
      ,'key' : [0,1,2]
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
                  "header" : "Total Operating"
                },
                { "colspan" : 3,
                  "header" : "Capital"
                },
                { "colspan" : 3,
                  "header" : "Transfer Payments"
                },
                { "colspan" : 3,
                  "header" : "Frozen"
                },
                { "colspan" : 3,
                  "header" :  "Special Purpose"
                },
                { "colspan" : 3,
                  "header" : "Total"
                }
              ],
              [ "Vote (2011-12)",
                "Vote",
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
                  "header" : "Montants gelés"
                },
                { "colspan" : 3,
                  "header" : "Affectations à fin spéciale"
                },
                { "colspan" : 3,
                  "header" : "Total"
                }
              ],
              [ "Crédit (2011-12)",
                "Description",
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
      "name" : { "en" : "5 - Voted Expenditures by Allotment",
          "fr" : "5 - Détail des dépenses votées"
        },
      "title" : { "en" : "Table 5 - Voted Expenditures by Allotment from 2007-08 to 2011-12 ($000)",
          "fr" : "Tableau 5 - Détail des dépenses votées par affectation de 2007-08 à 2011-12 ($000)"
        }
      ,'key' : [0,1,2]
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
              [ "Vote (2011-12)",
                "Description",
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
              [ "Crédit (2011-12)",
                "Description",
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
      "name" : { "en" : "6 - Expenditures by Operating Allotment",
          "fr" : "6 - Dépenses de fonctionnement par affectation"
        },
      "title" : { "en" : "Table 6 - Expenditures by Operating Allotment from 2007-08 to 2011-12 ($000)",
          "fr" : "Tableau 6 - Dépenses de fonctionnement par affectation de 2007-08 à 2011-12 ($000) "
        }
      ,'key' : [0,1,2]
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
      "headers" : { "en" : [ 
              [ "Vote (2011-12) / Statutory",
                "Description",
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
                "Public Debt Charges",
                "Other subsidies and payments",
                "Total Gross Expenditues",
                "External Revenues*",
                "Internal Revenues**",
                "Total Net Expenditues"
              ]
            ],
          "fr" : [ 
              [ "Crédit (2011-12) / Légis.",
                "Description",
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
                "Frais de la dette",
                "Autres subventions et paiements",
                "Total des dépenses brutes",
                "Revenus internes*",
                "Revenus externes**",
                "Total des dépenses nettes"
              ]
            ]
        },
      "name" : { "en" : "7 - Expenditures by Standard Object",
          "fr" : "7 - Dépenses par article courant"
        },
      "title" : { "en" : "Table 7 - Expenditures by Standard Object from 2007-08 to 2011-12 ($000)",
          "fr" : "Tableau 7 - Dépenses par article courant de 2007-08 à 2011-12 ($000)"
        }
      ,'key' : [0,1,2]
    }
}
