import collections
import urllib, urllib2
from io import StringIO
from lxml import html
import itertools
import xlrd
from ..reporting import table_defs
tables = table_defs.tables
#f  = '../data/LESWEB.XLS'
#f2 = '../data/CODES WEB LES.XLS'
#f3 = '../data/ISLED.XLS'
#
#wb = xlrd.open_workbook(f)
#wb2 = xlrd.open_workbook(f2)
#wb3 = xlrd.open_workbook(f3)
wb4 = xlrd.open_workbook("../data/open data.xls")
wb7 = xlrd.open_workbook("../data/g_and_c.xlsx")
wb8 = xlrd.open_workbook("../data/inyear.xlsx")
wb9 = xlrd.open_workbook("../data/QFR Links.xlsx")
wb10 = xlrd.open_workbook("../data/depts.xls")

def clean_data(d):
  if isinstance(d,basestring):
    #if u"  " in d:
    #  print d
    d = d.strip('*').strip().replace(u"\xad","-").replace("  "," ")
    # try and convert to an integer
    # if it fails, then return the string
    try:
      d = int(d)
    except:
      return d
  if isinstance(d, float) and int(d) == d:
    return int(d)
  return d

def clean_row(r):
  return map(clean_data,r)

def each_sheet(ws,start=1):
  return ws.name, filter(lambda r : any(bool(x) for x in r),
                      map(lambda i : clean_row(ws.row_values(i)),
                          range(start,ws.nrows)))

def depts(lines):
  def _(line):
    return line[0],dict(accronym=line[0],
                        dept=dict(en=line[2],fr=line[3]),
                        min=dict(en= line[4], fr=line[5]))
  return dict(map(_,lines))

def votes(lines):

  rtn = dict(in_year = collections.defaultdict(dict),
             historical = dict())
  def _(line):
    if line[0] == 0:
      rtn['in_year'][line[1]][line[2]] = {'en' : line[3],
                                          'fr' : line[4],
                                          'type': line[5] }
    else:
      rtn['historical'][line[-1]] = {'en' : line[3],
                                     'fr' : line[4],
                                      'type': line[5]}
  map(_,lines)
  return rtn

def sos(lines):
  return {l[0]: {'en' : l[1],'fr' : l[2]}
          for l in lines}

def footnotes(lines):
  grps = itertools.groupby(sorted(lines,
                                    key = lambda l : l[0]),
                             lambda l : l[0])
  return {grp[0] : [dict(deptcode = l[1],
                         symbol = l[2].strip(u"\""),
                         note = dict(en = l[3],
                                     fr= l[4]))
                    for l in grp[1]]
          for grp in grps}

def load_qfr_links():
  line = wb9.sheet_by_index(0).row_values
  nrows = wb9.sheet_by_index(0).nrows
  return {line(i)[0]: {"en" : line(i)[2], "fr": line(i)[3]}
         for i in xrange(1, nrows)}

def load_igoc():
  def make_bilingual(line,en,fr,force_array=False,join=False):
    if isinstance(en,list):
      return {
        "en" : ", ".join([line[x] for x in en if line[x] != 'NULL']),
        "fr":  ", ".join([line[x] for x in fr if line[x] != 'NULL'])
      }
    else:
      if force_array:
        try:
          if not isinstance(line[en],list):
            line[en] = [line[en]]
            line[fr] = [line[fr]]
          return [ {
                    "en" :line[en][i],
                    "fr": line[fr][i]
                  } for i in xrange(len(line[en]))]
        except:
          import IPython
          IPython.embed()
      elif join:
        if not isinstance(line[en],list):
          line[en] = [line[en]]
          line[fr] = [line[fr]]
        return {
                "en" :",".join(line[en]),
                "fr": ",".join(line[fr])
              }
      else:
        return {
                "en" :line[en],
                "fr": line[fr]
              }

  def each_item(x):
    if '*,*' in x:
      return x.split("*,*")
    elif '<p>' in x:
     return [x.text_content() for x in html.parse(StringIO(x)).xpath("//p")]
    else:
      return x
  def each_line(line):
    key = line[0]
    line = map(each_item,line)
    return key,{
      "accronym" : key,
      "dept" : make_bilingual(line, 1,2),
      "legal_name" : make_bilingual(line,5,6,join=True),
      'min':  make_bilingual(line, 7,8),
      "type" : make_bilingual(line,25,26),
      "website" : make_bilingual(line,29,30,True),
      "minister" : make_bilingual(line,[10,12,14],[16,18,20]),
      "mandate" : make_bilingual(line,23,24,True),
      "legislation" : make_bilingual(line,27,28,True)
    }
  row_values = wb10.sheet_by_index(0).row_values
  nrows = wb10.sheet_by_index(0).nrows
  return dict([each_line(row_values(i)) for i in
                                  xrange(1, nrows)
              if row_values(i)[0] ])

def  fix_table1_and_2(data_sheets):
  data_sheets['table1'] = [x[2:] for x in data_sheets['table1']
                           if x[0] == 2013 and x[1] == 1]
  data_sheets['table2'] = [x[2:] for x in data_sheets['table2']
                           if x[0] == 2013 and x[1] == 1]

def load_od():
  data_sheets = dict(map(each_sheet,
                         filter(lambda x : 'table' in x.name,
                                    wb7.sheets()+wb8.sheets()+ wb4.sheets())))
  fix_table1_and_2(data_sheets)
  lookups = {
    'qfr_links' : load_qfr_links(),
    'sos' : {u'1': {u'en': u'Personnel', u'fr': u'Personnel'},
            u'10': {u'en': u'Transfer Payments', u'fr': u'Paiements de transfert'},
            u'11': {u'en': u'Public Debt Charges', u'fr': u'Frais de la dette'},
            u'12': {u'en': u'Other Subsidies and Payments',
                    u'fr': u'Autres subventions et paiements'},
            u'2': {u'en': u'Transportation and Telecommunications',
                    u'fr': u'Transports et communications'},
            u'20': {u'en': u'Revenues', u'fr': u'Revenus'},
            u'21': {u'en': u'External Revenues', u'fr': u'Revenus externes'},
            u'22': {u'en': u'Internal Revenues', u'fr': u'Revenus internes'},
            u'3': {u'en': u'Information', u'fr': u'Information'},
            u'4': {u'en': u'Professional and Special Services',
                    u'fr': u'Services professionnels et sp\xe9ciaux'},
            u'5': {u'en': u'Rentals', u'fr': u'Location'},
            u'6': {u'en': u'Purchased Repair and Maintenance',
                    u'fr': u"Achat de services de r\xe9paration et d'entretien"},
            u'7': {u'en': u'Utilities, Materials and Supplies',
                    u'fr': u'Services publics, fournitures et approvisionnements'},
            u'8': {u'en': u'Acquisition of Land, Buildings, and Works',
                  u'fr': u"Acquisition de terrains, de b\xe2timents et d'ouvrages"},
            u'9': {u'en': u'Acquisition of Machinery and Equipment',
                  u'fr': u'Acquisition de machines et de mat\xe9riel'}},
    'depts' : load_igoc()
  }
  return lookups,data_sheets

def load_les():
  data_sheets = dict(map(each_sheet,
                         filter(lambda x : 'Table' in x.name,
                                    wb.sheets())))
  data_sheets.update( dict(map(each_sheet,
                         filter(lambda x : 'Table' in x.name,
                                    wb3.sheets()))))
  lookup_sheets = dict(map(each_sheet,
                           wb2.sheets()))
  lookup_sheets['footnotes'] = each_sheet(wb.sheet_by_name('Footnotes'))[1]
  lookups = {
    'depts': depts(lookup_sheets['DEPTCODE_MINCODE']),
    'votes': votes(lookup_sheets['VOTES']),
    'footnotes' : footnotes(lookup_sheets['footnotes'])
  }
  return lookups,data_sheets

