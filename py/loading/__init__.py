import collections
import urllib, urllib2
from io import StringIO
from lxml import html
import itertools
import xlrd
from ..reporting import table_defs
tables = table_defs.tables
f  = 'LESWEB.XLS'
f2 = 'CODES WEB LES.XLS'
f3 = 'ISLED.XLS'

wb = xlrd.open_workbook(f)
wb2 = xlrd.open_workbook(f2)
wb3 = xlrd.open_workbook(f3)
wb4 = xlrd.open_workbook("open data.xls")
wb5 = xlrd.open_workbook("open data lookups.XLS")
wb6 = xlrd.open_workbook("Enhanced Inventory of Government data.xls")
wb7 = xlrd.open_workbook("g_and_c.xlsx")
def clean_data(d):
  if isinstance(d,basestring):
    if u"  " in d:
      print d
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


def load_igoc():
  def make_bilingual(line,en,fr,force_array=False,join=False):
    if isinstance(en,list):
      return {
        "en" : ", ".join([line[x] for x in en if line[x] != 'NULL']),
        "fr":  ", ".join([line[x] for x in fr if line[x] != 'NULL'])
      }
    else:
      if force_array:
        if not isinstance(line[en],list):
          line[en] = [line[en]]
          line[fr] = [line[fr]]
        return [ {
                  "en" :line[en][i],
                  "fr": line[fr][i]
                } for i in xrange(len(line[en]))]
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
      "legal_name" : make_bilingual(line,3,4,join=True),
      "type" : make_bilingual(line,23,24),
      "website" : make_bilingual(line,27,28,True),
      "minister" : make_bilingual(line,[8,10,12],[14,16,18]),
      "mandate" : make_bilingual(line,21,22,True),
      "legislation" : make_bilingual(line,25,26,True)
    }
  row_values = wb6.sheet_by_index(0).row_values
  nrows = wb6.sheet_by_index(0).nrows
  return dict([each_line(row_values(i)) for i in
                                  xrange(1, nrows)
              if row_values(i)[0] ])

def load_od():
  data_sheets = dict(map(each_sheet,
                         filter(lambda x : 'table' in x.name,
                                    wb4.sheets())))
  data_sheets.update( dict(map(each_sheet,
                         filter(lambda x : 'table' in x.name,
                                    wb7.sheets()))))
  lookup_sheets = dict(map(each_sheet,
                           wb5.sheets()))
  lookup_sheets['footnotes'] = each_sheet(wb.sheet_by_name('Footnotes'))[1]
  lookups = {
    'depts': depts(lookup_sheets['DEPTCODE_MINCODE']),
    #'votes': votes(lookup_sheets['VOTES']),
    'sos' : sos(lookup_sheets['SO']),
    'igoc' : load_igoc()
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

