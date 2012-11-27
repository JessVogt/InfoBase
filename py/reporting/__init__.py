from __future__ import print_function
import codecs
import operator
import functools
import os
import operator
import json
import redis
from ..loading import load
from helpers.from_here import here
import mako.lookup
from .table_defs import tables


mako_dirs = (here(__file__)("../../mako"),
             here(__file__)("../../js"))
lookup = mako.lookup.TemplateLookup(directories=mako_dirs,
                                    output_encoding='utf-8',
                                    input_encoding='utf-8')

js_root = '/home/andrew/Projects/media/js'
js_files = [ "excanvas.js",
            '00-jquery-1.8.2.js',
            '01-underscore-min.js',
            '02-backbone.js',
            '03-jshashtable-2.1.js',

            'bootstrap.min.js',

            'jquery.numberformatter-1.2.3.js',

            "jquery.dataTables.min.js",

            "jquery.jqplot.min.js",
            "jqplot.pieRenderer.min.js",
            "jqplot.barRenderer.min.js",
            "jqplot.categoryAxisRenderer.min.js",
            "jqplot.canvasAxisTickRenderer.min.js",

           ]

css_root = '/home/andrew/Projects/media/css'
css_files = ['bootstrap.min.css',
             "jquery.jqplot.min.css",
             ]

opn = functools.partial(codecs.open,encoding='utf-8')


def make_after_check(lookups):
  def _(row,table):
    if table in ('Table1','Table2','Table2a','Table2b','Table3'):
      lookups['depts'][row[0]].setdefault('tables',{}).setdefault(table,[]).append(row)
    else:
      lookups['depts'][row[0]].setdefault('tables',{}).setdefault(table,[]).append(row[1:])
  return _

def check(data,lookups,after_check=lambda x:x):
  errors = set()
  for table in data:
    table_def = tables[table]
    historical = table_def['coverage']
    for row in data[table]:
      try:
        # make sure rows are correct lenght
        if table in ('Table4', 'Table5', 'Table6' ,'Table7'):
          row = [ x.replace(u"\xad",u"-")  if isinstance(x,basestring)  else x
                 for x in row]
          try:
            assert len(table_def['col_defs']) == len(row)-1
          except Exception,e:
            import pdb
            pdb.set_trace()
        elif table in ('Table2b','Table3'):
          assert len(table_def['col_defs']) == len(row)
        elif table ==  ('Table2','Table2a'):
          assert len(table_def['col_defs']) == len(row)-2
        # find acronym
        assert row[0] in lookups['depts']
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

def html_les():
  lookups,data = load()
  check(data,lookups,make_after_check(lookups))
  ## filter out departments with no tables
  lookups['depts'] = {key:val for key,val in
                     lookups['depts'].iteritems()
                     if val.get('tables')}
  double_check(lookups)
  lookups['les_tables'] = tables

  extra_js = reduce(operator.add,
                    map(lambda k : u'%s=%s;\n' % (k,json.dumps(lookups[k])),
                        lookups))
  jsdata = reduce(operator.add,
                  map(lambda f : opn(os.path.join(js_root,f)).read()+";\n",
                      js_files))
  cssdata = reduce(operator.add,
                  map(lambda f : opn(os.path.join(css_root,f)).read(),
                      css_files))

  full_js = jsdata + u"\n" + extra_js
  full_css = cssdata

  t = lookup.get_template('les.html')
  with open("les.html",'w') as leshtml:
    leshtml.write(t.render(full_js = full_js,
                           #js_root = './',
                           full_css = full_css,
                           no_auto_js = True,
                           no_auto_css = True))


