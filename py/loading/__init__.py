import collections
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

def clean_data(d):
  if isinstance(d,basestring):
    d = d.strip('*').strip().replace(u"\xad","-")
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

def stat(lines):
  def _(line):
    return line[0],{'en' : line[1],'fr':line[2]}
  return dict(map(_,lines))

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


def load_od():

  data_sheets = None

  lookup_sheets = dict(map(each_sheet,
                           wb2.sheets()))
  lookup_sheets['footnotes'] = each_sheet(wb.sheet_by_name('Footnotes'))[1]
  lookups = {
    'depts': depts(lookup_sheets['DEPTCODE_MINCODE']),
    'votes': votes(lookup_sheets['VOTES']),
    'sos' : sos(lookup_sheets['SO'])
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
    #'stat': stat(lookup_sheets['STATUTORY'])
    'footnotes' : footnotes(lookup_sheets['footnotes'])
  }
  return lookups,data_sheets

