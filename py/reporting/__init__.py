from __future__ import print_function
import codecs
import subprocess
import operator
import functools
import os
import operator
import json
import mako.lookup
from ..loading import load_les, load_od
from helpers.from_here import here
#from .table_defs import tables
from .od_table_defs import make_od_tables
from .. import models

opn = functools.partial(codecs.open,encoding='utf-8')
mako_dirs = (here(__file__)("../../mako"),)
js_dir =  here(__file__)("../../js")
js_root = '/home/andrew/Projects/media/js'
css_root = '/home/andrew/Projects/media/css'

lookup = mako.lookup.TemplateLookup(directories=mako_dirs,
                                    output_encoding='utf-8',
                                    input_encoding='utf-8')

def process_my_js(files,dev=False):
  files = [os.path.join(js_dir,f) for f in files]
  js_str = "\n".join([opn(f).read() for f in files])
  if not dev:
    proc = subprocess.Popen(['uglifyjs'],
                            stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE,
                            shell=True)
    js_str = proc.communicate(js_str.encode("utf-8"))[0].decode("utf-8")
  return js_str

my_js_files = ["sandbox.js",
               "base_graph_view.js",
               "base_table_view.js",
               "datatables.js",
               "group_funcs.js",
               "table_popup.js",
               "mappers.js",
               "tables.js",
               "app.js",
               ]

js_files = ["excanvas.compiled.js",
            '00-jquery-1.8.2.js',
            '01-underscore-min.js',
            '02-backbone.js',
            '03-jshashtable-2.1.js',
            "handlebars.min.js",
            'bootstrap.min.js',
            'jquery.numberformatter-1.2.3.js',
            "jquery.dataTables.min.js",
            "jquery.jqplot.min.js",
            "jqplot.pieRenderer.min.js",
            "jqplot.barRenderer.min.js",
            "jqplot.categoryAxisRenderer.min.js",
            "jqplot.canvasAxisTickRenderer.min.js",
           ]
js_libs = reduce(operator.add,
              map(lambda f : opn(os.path.join(js_root,f)).read()+";\n",
                  js_files))

css_files = ['bootstrap.min.css',
             "jquery.jqplot.min.css",
             ]
cssdata = reduce(operator.add,
                map(lambda f : opn(os.path.join(css_root,f)).read(),
                    css_files))

def make_after_check(lookups):
  def _(row,table):
    if table in ('Table1','Table2','Table2a','Table2b','Table3','TableIS'):
      lookups['depts'][row[0]].setdefault('tables',{}).setdefault(table,[]).append(row)
    else:
      lookups['depts'][row[0]].setdefault('tables',{}).setdefault(table,[]).append(row[1:])
  return _

def check(data,lookups,after_check=lambda x:x):
  errors = set()
  for table in data:
    #table_def = tables[table]
    #historical = table_def['coverage']
    for row in data[table]:
      try:
        # make sure rows are correct lenght
        #if table in ('Table4', 'Table5', 'Table6' ,'Table7'):
        #  row = [ x.replace(u"\xad",u"-")  if isinstance(x,basestring)  else x
        #         for x in row]
        #  try:
        #    assert len(table_def['col_defs']) == len(row)-1
        #  except Exception,e:
        #    import pdb
        #    pdb.set_trace()
        #elif table in ('Table2b','Table3'):
        #  assert len(table_def['col_defs']) == len(row)
        #elif table ==  ('Table2','Table2a'):
        #  assert len(table_def['col_defs']) == len(row)-2
        ## find acronym
        #assert row[0] in lookups['depts']
        # perform lookup on rows
        #if row[2] and row[1] != '(S)' and historical == 'historical':
        #  assert row[2] in lookups['votes'][historical]
        #if historical == 'in_year' and table != 'Table2a':
        #  assert lookups['votes'][historical][row[0]][row[1]]
        after_check(row,table)
      except Exception,e:
        import pdb
        pdb.set_trace()
        errors.add( (table,) + tuple(row[:2]) )
  for row in errors:
    print(*row,sep="\t")

def double_check(lookups):
  for dept,val in lookups['depts'].iteritems():
    val['footnotes'] = {}
    val['tables'] = {k:v for k,v in val['tables'].iteritems()
                     if not (
                       len(v) is 0 or (
                       len(v) is 1
                       and all(x in (0,"")
                               for x in v[0][1:])))}
    for table,fns in lookups['footnotes'].iteritems():
      relevant = filter(lambda fn : fn['deptcode'] == dept,
                        fns)
      if relevant:
        val['footnotes'][table] = relevant
        for rel in relevant:
          lookups['footnotes'][table].remove(rel)

def add_dept_data(depts):
  s = models.Session()
  for dept in depts.itervalues():
    if dept['accronym'] != 'ZGOC':
      about = models.About.get(s,eager_joins=('contact',
                                              "about.transaction",
                                              "legislation")
                  ).filter(
                  models.About.accronym == dept['accronym']
                  ).first()
      if not about:
        print(dept['accronym'])
      org = about.org
      about_now = org.about_now()
      legislation = org.legislation
      contact = org.contact
      if not about_now.legal_title_en:
        continue
      dept['legal_name'] = {
        'en' : about_now.legal_title_en,
        'fr' : about_now.legal_title_fr
      }
      dept['applied_title'] = {
        'en' : about_now.applied_title_en,
        'fr' : about_now.applied_title_fr
      }
      dept['minister'] = {
          'en' : ",".join([about_now.minister1_en,
                            about_now.minister2_en or ""]).strip(","),
          'fr' : ",".join([about_now.minister1_fr,
                            about_now.minister2_fr or ""]).strip(",") 
        }
      dept['mandate'] ={
        'en' : about_now.mandate_en,
        'fr' : about_now.mandate_fr
      }
      dept['org_head'] = {
        'en' : about_now.head_en,
        'fr' : about_now.head_fr
      }
      dept['org_type'] = {
        'en' : about_now.form_en,
        'fr' : about_now.form_fr
      }
      dept['legislation'] = map(lambda l : {
        'en' : l.legislation_en,
        'fr' : l.legislation_fr
      },legislation)
      if contact:
        dept['website'] = {
          'en' : contact.website_en,
          'fr' : contact.website_fr
        }
      else:
        dept['website'] = None

def html_les(dev=True):
  lookups,data = load_les()
  check(data,lookups,make_after_check(lookups))
  ## filter out departments with no tables
  lookups['depts'] = {key:val for key,val in
                     lookups['depts'].iteritems()
                     if val.get('tables')}
  double_check(lookups)
  add_dept_data(lookups['depts'])

  js_data = ";\n".join(
    [u'{}={}'.format(k,json.dumps(lookups[k]))
     for k in lookups]
  )+";\n"

  app_js_files = list(my_js_files)
  app_js_files += ["les/text.js",
                   "les/graph1.js",
                   "les/graph2a.js",
                   "les/graph2b.js",
                   "les/graph2.js",
                   "les/graph3.js",
                   "les/graph4.js",
                   "les/graph5.js",
                   "les/graph6.js",
                   "les/graph7.js",
                   "les/graphIS.js",
                   "les/tables.js",
                   "table_builder.js",
                   "les/horizontal.js",
                   "od/od.js" ]

  js_app = process_my_js(app_js_files, dev=dev)

  full_js = "\n".join([js_libs, js_data, js_app])
  full_css = cssdata
  t = lookup.get_template('les.html')
  with open("led_tbfid.html",'w') as leshtml:
    leshtml.write(t.render(full_js = full_js,
                           #js_root = './',
                           full_css = full_css,
                           no_auto_js = True,
                           no_auto_css = True))

def fake_data(lookups):
  import numpy
  rand = numpy.random.randint
  for key in lookups['depts']:
    dept = lookups['depts'][key]
    dept['tables'] = {
      'table1' : [ ],
      'table2' : [
       [key,1] +  rand(10000,10000000,4).tolist(),
       [key,2 ] + rand(10000,10000000,4).tolist(),
       [key,3 ] + rand(10000,10000000,4).tolist(),
       [key,4 ] + rand(10000,10000000,4).tolist(),
       [key,5 ] + rand(10000,10000000,4).tolist(),
       [key,6 ] + rand(10000,10000000,4).tolist(),
       [key,7 ] + rand(10000,10000000,4).tolist(),
       [key,8 ] + rand(10000,10000000,4).tolist(),
       [key,9 ] + rand(10000,10000000,4).tolist(),
       [key,10] + rand(10000,10000000,4).tolist(),
       [key,11] + rand(10000,10000000,4).tolist(),
       [key,12] + rand(10000,10000000,4).tolist(),
       [key,21] + rand(10000,10000000,4).tolist(), 
       [key,22] + rand(10000,10000000,4).tolist() 
      ],
      'table3' : [
       [key,'Program EN1','Program FR1'] + rand(10000,10000000,4).tolist(),
       [key,'Program EN2','Program FR2'] + rand(10000,10000000,4).tolist(),
       [key,'Program EN3','Program FR3'] + rand(10000,10000000,4).tolist(),
       [key,'Program EN4','Program FR4'] + rand(10000,10000000,4).tolist(),
       [key,'Program EN5','Program FR5'] + rand(10000,10000000,4).tolist(),
       [key,'Internal Services','Services Internes'] + rand(10000,10000000,4).tolist(),
      ],
      'table4' : [
       [key,1,1,'2009-10'] +  rand(10000,10000000,7-3).tolist(),
       [key,1,1,'2010-11'] +  rand(10000,10000000,7-3).tolist(),
       [key,1,1,'2011-12'] +  rand(10000,10000000,7-3).tolist(),
       [key,5,2,'2009-10'] +  rand(10000,10000000,7-3).tolist(),
       [key,5,2,'2010-11'] +  rand(10000,10000000,7-3).tolist(),
       [key,5,2,'2011-12'] +  rand(10000,10000000,7-3).tolist(),
       [key,10,3,'2009-10'] + rand(10000,10000000,7-3).tolist(),
       [key,10,3,'2010-11'] + rand(10000,10000000,7-3).tolist(),
       [key,10,3,'2011-12'] + rand(10000,10000000,7-3).tolist(),
      ],
      'table5' : [
       [key,1 ] +  rand(10000,10000000,3).tolist(),
       [key,2 ] + rand(10000,10000000,3).tolist(),
       [key,3 ] + rand(10000,10000000,3).tolist(),
       [key,4 ] + rand(10000,10000000,3).tolist(),
       [key,5 ] + rand(10000,10000000,3).tolist(),
       [key,6 ] + rand(10000,10000000,3).tolist(),
       [key,7 ] + rand(10000,10000000,3).tolist(),
       [key,8 ] + rand(10000,10000000,3).tolist(),
       [key,9 ] + rand(10000,10000000,3).tolist(),
       [key,10] + rand(10000,10000000,3).tolist(),
       [key,11] + rand(10000,10000000,3).tolist(),
       [key,12] + rand(10000,10000000,3).tolist(),
       [key,21] + rand(10000,10000000,3).tolist(), 
       [key,22] + rand(10000,10000000,3).tolist() 
      ],
      'table6' : [
       [key,'Program EN1','Program FR1'] + rand(10000,10000000,3).tolist(),
       [key,'Program EN2','Program FR2'] + rand(10000,10000000,3).tolist(),
       [key,'Program EN3','Program FR3'] + rand(10000,10000000,3).tolist(),
       [key,'Program EN4','Program FR4'] + rand(10000,10000000,3).tolist(),
       [key,'Program EN5','Program FR5'] + rand(10000,10000000,3).tolist(),
       [key,'Internal Services','Services Internes'] + rand(10000,10000000,3).tolist(),
      ]
    }
    for vote in lookups['votes']['in_year'][key]:
      v = lookups['votes']['in_year'][key][vote]
      dept['tables']['table1'].append([key,vote,v['type']] + rand(10000,10000000,19-2).tolist())

def od(dev=True):
  lookups,data = load_od()
  lookups['depts']['ZGOC'] = {'accronym' : 'ZGOC',
                              'dept' : {'en' : 'Government of Canada',
                                        'fr' : 'Gouvernement du Canada'},
                              'min' : {'en' : 'Government of Canada',
                                        'fr' : 'Gouvernement du Canada'}
                             }
  add_dept_data(lookups['depts'])

  fake_data(lookups)
  js_data = ";\n".join(
    [u'{}={}'.format(k,json.dumps(lookups[k]))
     for k in lookups]
  )+";\n"

  app_js_files = list(my_js_files)
  app_js_files += ["od/text.js",
                   "od/tables.js",
                   "od/od.js"]
  js_app = process_my_js(app_js_files, dev=dev)

  full_js = "\n".join([js_libs, js_data, js_app])
  full_css = cssdata

  t = lookup.get_template('od.html')
  with open("od_do.html",'w') as leshtml:
    leshtml.write(t.render(full_js = full_js,
                           #js_root = './',
                           full_css = full_css,
                           no_auto_js = True,
                           no_auto_css = True))

