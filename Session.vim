cd ~/Projects/reporting
for f in split(globpath("./src/js","*.js"),"\n")
  execute "badd +0 " . f
endfor
for f in split(globpath("./src/js/InfoBase","*.js"),"\n")
  execute "badd +0 " . f
endfor
for f in split(globpath("./src/js/d3","*.js"),"\n")
  execute "badd +0 " . f
endfor

vsp
ls
