# -*- coding: utf-8 -*-
import functools


def make_tables(year,month):

  tables = {"table1" : {"col_defs" : ["wide-str",
                                    "float",
                                    "float",
                                    "float",
                                    "float",
                                    "float",
                                    "float"],
                      "coverage" : "in_year",
                      "headers" : {"en" :[[
                        "Total available for use for the year ending March 31,{year}",
                        "Used during the quarter ended {month}-{year}",
                        "Year to date used at quarter-end",
                        "Total available for use for the year ending March 31,{last_year}",
                        "Used during the quarter ended {month}-{last_year} ",
                        "Year to date used at quarter-end",
                      ]],
                        "fr": [[
                          "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {year}"
                          "Crédits utilisés pour le trimestre terminé le {month}-{year}",
                          "Cumul des crédits utilisés à la fin du trimestre",
                          "Crédits totaux disponibles pour l'exercice se terminant le 31 mars {last_year}",
                          "Crédits utilisés pour le trimestre terminé le {month}-{last_year}",
                          "Cumul des crédits utilisés à la fin du trimestre",
                        ]]},
                      "link" : {
                        "en" : "",
                        "fr" : ""
                      },
                      "name" : { "en" : "",
                                "fr" : ""
                               },
                      "title" : { "en" : "",
                                 "fr" : ""
                                }
                      ,"key" : [0]},
          "table2" : {"col_defs" : ["wide-str",
                                    "float",
                                    "float",
                                    "float",
                                    "float"],
                      "coverage" : "in_year",
                      "headers" : {"en" :[[
                        { "colspan" : 1,
                         "header" : ""
                        },
                        { "colspan" : 2,
                         "header" : "{year}"
                        },
                        { "colspan" : 2,
                         "header" : "{last_year}"
                        }],
                        [
                          "Standard Object",
                          "Expended during the quarter ended {month}-{year}",
                          "Year to date used at quarter-end",
                          "Expended during the quarter ended {month}-{last_year}",
                          "Year to date used at quarter-end",
                        ]],
                        "fr": [[
                        { "colspan" : 1,
                         "header" : ""
                        },
                        { "colspan" : 2,
                         "header" : "{year}"
                        },
                        { "colspan" : 2,
                         "header" : "{last_year}"
                        }],
                        [
                          "Article Courant",
                          "Dépensées durant le trimestre terminé le {month}-{year}",
                          "Cumul des crédits utilisés à la fin du trimestre",
                          "Dépensées durant le trimestre terminé le {month}-{last_year}",
                          "Cumul des crédits utilisés à la fin du trimestre",
                        ]]},
                      "link" : {
                        "en" : "",
                        "fr" : ""
                      },
                      "name" : { "en" : "Departmental budgetary expenditures by Standard Object",
                                "fr" : "Dépenses ministérielles budgétaires par article courant"
                               },
                      "title" : { "en" : "Departmental budgetary expenditures by Standard Object ($000)",
                                 "fr" : "Dépenses ministérielles budgétaires par article courant ($000)"
                                }
                      ,"key" : [0]},
          "table3" : {"col_defs" : ["wide-str",
                                    "float",
                                    "float",
                                    "float",
                                    "float",
                                    "float",
                                    "float"],
                      "coverage" : "in_year",
                      "headers" : { "en" :[[
                        { "colspan" : 1,
                         "header" : ""
                        },
                        { "colspan" : 2,
                         "header" : "{year}"
                        },
                        { "colspan" : 2,
                         "header" : "{last_year}"
                        }],
                        [
                          "Program",
                          "Expended during the quarter ended {month}-{year}",
                          "Year to date used at quarter-end",
                          "Expended during the quarter ended {month}-{last_year}",
                          "Year to date used at quarter-end",
                        ]],
                        "fr": [[
                        { "colspan" : 1,
                         "header" : ""
                        },
                        { "colspan" : 2,
                         "header" : "{year}"
                        },
                        { "colspan" : 2,
                         "header" : "{last_year}"
                        }],
                        [
                          "Program",
                          "Dépensées durant le trimestre terminé le {month}-{year}",
                          "Cumul des crédits utilisés à la fin du trimestre",
                          "Dépensées durant le trimestre terminé le {month}-{last_year}",
                          "Cumul des crédits utilisés à la fin du trimestre",
                        ]]
                      },
                      "link" : {
                        "en" : "",
                        "fr" : ""
                      },
                      "name" : { "en" : "Departmental budgetary expenditures by Program",
                                "fr" : "Dépenses ministérielles budgétaires par program"
                               },
                      "title" : { "en" : "Departmental budgetary expenditures by Program ($000)",
                                 "fr" : "Dépenses ministérielles budgétaires par program ($000)"
                                }
                      ,"key" : [0] },
          "table4" : {"col_defs" : ["wide-str",
                                    "date",
                                    "float",
                                    "float",
                                    "float" ],
                      "coverage" : "historical",
                      "headers" : {"en" :[[
                        "Vote (2011-12) / Statutory",
                        "Description",
                        "Year",
                        "Total budgetary authority available for use",
                        "Budgetary authority used in the current year",
                        "Authority lapsed (or over-expended)",
                        "Authority available for use in subsequent years",
                      ]],
                        "fr": [[
                          "Crédit (2011-12) / Légis.",
                          "Description",
                          "Année",
                          "Autorisation budgétaire totale utilisable",
                          "Autorisation budgétaire utilisée dans l'exercice en cours",
                          "Autorisation expirée (ou dépassée)",
                          "Autorisation prête pour usage dans les exercices financiers suivants",
                        ]]},
                      "link" : {
                        "en" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-eng.asp",
                        "fr" : "http://www.tbs-sct.gc.ca/ems-sgd/aegc-adgc-fra.asp"
                      },
                      "name" : { "en" : "Authorities and Actual Expenditures",
                                "fr" : "Autorisations et dépenses réelles"
                               },
                      "title" : { "en" : "Authorities and Actual Expenditures ($000)",
                                 "fr" : "Autorisations et dépenses réelles ($000)"
                                }
                      ,"key" : [0,1,2]},
          "table5" : {"col_defs" : ["wide-str",
                                    "date",
                                    "float",
                                    "float",
                                    "float" ],
                      "coverage" : "historical",
                      "headers" : {"en" :[[
                        "Standard Object",
                        "{last_year}",
                        "{last_year_2}",
                        "{last_year_3}",
                      ]],
                        "fr": [[
                        "Article courtant",
                        "{last_year}",
                        "{last_year_2}",
                        "{last_year_3}",
                        ]]},
                      "link" : {
                        "en" : "",
                        "fr" : ""
                      },
                      "name" : { "en" : "Expenditures by Standard Object",
                                "fr" : "Dépenses par article courant"
                               },
                      "title" : { "en" : "Expenditures by Standard Object from {last_year_3} to {last_year} ($000)",
                                 "fr" : "Dépenses par article courant de {last_year_3} à {last_year} ($000)"
                                }
                      ,"key" : [0]},
          "table6" : {"col_defs" : ["wide-str",
                                    "date",
                                    "float",
                                    "float",
                                    "float" ],
                      "coverage" : "historical",
                      "headers" : {"en" :[[
                        "Program"
                        "{last_year}",
                        "{last_year_2}",
                        "{last_year_3}",
                      ]],
                        "fr": [[
                          "Program"
                          "{last_year}",
                          "{last_year_2}",
                          "{last_year_3}",
                        ]]},
                      "link" : {
                        "en" : "",
                        "fr" : ""
                      },
                      "name" : { "en" : "Expenditures by Program",
                                "fr" : "Dépenses par article courant"
                               },
                      "title" : { "en" : "Expenditures by Program from {last_year_3} to {last_year} ($000)",
                                 "fr" : "Dépenses par Program de {last_year_3} à {last_year} ($000)"
                                }
                      ,"key" : [0]}
          }

  fmt = functools.partial(str.format,**dict(
    year = year,
    last_year=year-1,
    last_year_2 = year-2,
    last_year_3 = year-3,
    month = month
  ))

  for table in tables:
    for lang in ("en","fr"):

      for h in ('title','name'):
        tables[table][h][lang] = fmt(tables[table][h][lang])

      for header_i,_ in enumerate(tables[table]['headers'][lang]):
        ref = tables[table]['headers'][lang][header_i]
        for i,col in enumerate(ref):
          if isinstance(ref[i],dict):
            ref[i]['header'] =  fmt(ref[i]['header'])
          else:
            ref[i] = fmt(ref[i])

  return tables






