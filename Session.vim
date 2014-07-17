cd ~/Projects/InfoBase
for f in split(globpath("./src/js","**/*.js"),"\n")
  execute "badd +0 " . f
endfor

vsp
ls
