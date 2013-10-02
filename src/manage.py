#!/usr/bin/env python
import subprocess
import sys,os
from argparse import ArgumentParser

here = os.path.realpath(__file__)
here_dir = os.path.split(here)[0]

def shell():
  from sqlalchemy import select, cast,join,func
  from IPython import embed
  from py import models
  s = models.Session()
  embed()

def report(dev=True, output=None):
  from py.reporting import html_les,od
  #from py import ke_extract
  if output == 'les':
    html_les(dev)
  elif output == 'od':
    od(dev)
  elif output == 'ke':
    ke_extract.load_and_integrate()


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

parser = ArgumentParser()
parser.add_argument("-b","--shell",action='store_true')
parser.add_argument("-r","--report",action='store_true')
parser.add_argument("-dev",
                    action="store_true",
                    dest="dev" )
parser.add_argument("-output",
                    action="store",
                    choices=['les','od','ke'],
                    default='les')
parser.add_argument("-w","--watch",
                 action="store_true", dest="watch", default=False,
                 help="watch for changes")

if __name__ == "__main__":
  # parse args
  args = parser.parse_args()
  # start server
  if args.shell:
    shell()
  if args.report:
    report(dev=args.dev,output=args.output)
  if args.watch:
    watch()

