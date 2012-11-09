#!/usr/bin/env python
import subprocess
import sys,os
from optparse import OptionParser

here = os.path.realpath(__file__)
here_dir = os.path.split(here)[0]

def shell():
  from sqlalchemy import select, cast,join,func
  from IPython import embed
  from py import les, settings
  embed()

def report():
  from py.reporting import html_les
  html_les()

def watch():
  import subprocess
  from helpers import watch_dir

  import pynotify
  pynotify.init("icon-summary-body")

  paths = ('./js',)
  def rerunner(f):
    print("rebuilding due to change in...%s" % os.path.basename(f))
    x = subprocess.call(['./manage.py', '-r'],shell=True)
    if pynotify and x:
      n = pynotify.Notification("error!! recompiling {0}".format(f))
      n.show()

  watcher= watch_dir.make_watch_dir(paths,rerunner)
  watcher()

parser = OptionParser()
parser.add_option("-b","--shell",
                 action="store_true", dest="shell", default=False,
                 help="choose address")
parser.add_option("-r","--report",
                 action="store_true", dest="report", default=False,
                 help="run report")
parser.add_option("-w","--watch",
                 action="store_true", dest="watch", default=False,
                 help="watch for changes")

if __name__ == "__main__":
  # parse args
  args, left_over= parser.parse_args(sys.argv)
  # start server
  if args.shell:
    shell()
  if args.report:
    report()
  if args.watch:
    watch()

