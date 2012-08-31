import os
import glob
from my_libs import tornado_launcher
from sites import settings
controllers_dir = "sites/controllers/"

controllers = [os.path.basename(c)[:-3] for c
               in glob.glob(controllers_dir+ "*.py") if "__init__" not in c]

mod = __import__('sites.controllers',fromlist=controllers)
for controller in controllers:
  c = getattr(mod,controller)
  name = c.__name__.split(".")[-1]
  settings.make_app(c.Handler,
                    root = "/" + name).listen(c.port)
  #print("%s:%d" % (name,c.port))
  #for handler in c.Handler.handlers:
  #  print(handler.attrs['full_path'])

import tornado.ioloop
tornado.ioloop.IOLoop.instance().start()



