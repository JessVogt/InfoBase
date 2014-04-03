let SessionLoad = 1
if &cp | set nocp | endif
let s:cpo_save=&cpo
set cpo&vim
map! <S-Insert> <MiddleMouse>
nnoremap  o
map   viw
nmap ; :
map ]<Down> :call PythonNextLine(1)
map ]<Up> :call PythonNextLine(-1)
map ]d :call PythonSelectObject("function")
map ]c :call PythonSelectObject("class")
map ]v ]tV]e
omap ]t :PBoB
nmap ]t :PBoB
omap ]e :PEoB
nmap ]e :PEoB
omap ]< ]tV]e<
nmap ]< ]tV]e<
omap ]> ]tV]e>
nmap ]> ]tV]e>
omap ]# :call PythonCommentSelection()
nmap ]# :call PythonCommentSelection()
omap ]u :call PythonUncommentSelection()
nmap ]u :call PythonUncommentSelection()
omap ]J :call PythonDec("class", -1)
nmap ]J :call PythonDec("class", -1)
omap ]j :call PythonDec("class", 1)
nmap ]j :call PythonDec("class", 1)
omap ]F :call PythonDec("function", -1)
nmap ]F :call PythonDec("function", -1)
omap ]f :call PythonDec("function", 1)
nmap ]f :call PythonDec("function", 1)
vmap ]t :PBOBm'gv``
vmap ]e :PEoBm'gv``
vmap ]< <
vmap ]> >
vmap ]# :call PythonCommentSelection()
vmap ]u :call PythonUncommentSelection()
vmap ]J :call PythonDec("class", -1)
vmap ]j :call PythonDec("class", 1)
vmap ]F :call PythonDec("function", -1)
vmap ]f :call PythonDec("function", 1)
nmap _c :%s/\s\+$//gc
nmap gx <Plug>NetrwBrowseX
nnoremap <silent> <Plug>NetrwBrowseX :call netrw#NetrwBrowseX(expand("<cWORD>"),0)
map <S-Insert> <MiddleMouse>
inoremap  I
inoremap  A
imap  d$i
inoremap " ""<Left>
inoremap ' ''<Left>
inoremap (( (
inoremap ( ()<Left>
inoremap < <><Left>
inoremap [ []<Left>
imap jj 
inoremap {} {}
inoremap {{ {
inoremap { {}O
inoremap { {}<Left>
iabbr from. from . import 
iabbr ipp import IPythonIPython.embed(:w
iabbr pdb import pdbpdb.set_trace():w
iabbr im import 
let &cpo=s:cpo_save
unlet s:cpo_save
set background=dark
set backspace=indent,eol,start
set expandtab
set fileencodings=ucs-bom,utf-8,default,latin1
set fillchars=vert:|,fold:-,vert:│
set gdefault
set guicursor=n-c:block-Cursor-blinkon0
set guifont=Monospace\ 12
set guioptions=a
set helplang=en
set hidden
set hlsearch
set ignorecase
set iminsert=0
set imsearch=0
set incsearch
set isident=@,48-57,_,192-255,$
set laststatus=2
set listchars=tab:>.,trail:.,extends:#,nbsp:.
set mouse=a
set printoptions=paper:letter
set ruler
set runtimepath=~/.vim,~/.vim/bundle/vim-coffee-script,/var/lib/vim/addons,/usr/share/vim/vimfiles,/usr/share/vim/vim74,/usr/share/vim/vimfiles/after,/var/lib/vim/addons/after,~/.vim/bundle/vim-coffee-script/after,~/.vim/after
set shiftround
set shiftwidth=2
set showcmd
set showmatch
set smartcase
set smarttab
set softtabstop=2
set nostartofline
set statusline=%n\ %F\ \ %l,%v\ \ %p%%\ \ LEN=%L
set suffixes=.bak,~,.swp,.o,.info,.aux,.log,.dvi,.bbl,.blg,.brf,.cb,.ind,.idx,.ilg,.inx,.out,.toc
set tabstop=2
set termencoding=utf-8
set virtualedit=all
set wildignore=*.pyc,*.o,*.m4a,*.avi
set wildmode=longest,list,full
set window=44
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
cd ~/Projects
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +5 les/src/js/app.js
badd +213 les/src/js/queries.js
badd +83 les/src/js/d3/core.js
badd +58 les/src/js/d3/bar.js
badd +26 les/src/js/d3/tooltip.js
badd +83 les/test/test-data.js
badd +8 les/test/test.html
badd +20 les/src/js/mappers.js
badd +104 les/Gruntfile.js
badd +287 les/src/js/d3/dept_explore.js
badd +124 les/src/js/d3/pack.js
badd +328 les/test/test-d3.js
badd +190 les/src/mako/od_handlebars_templates.html
badd +57 les/src/js/waiting.js
badd +97 les/src/mako/extracss.html
badd +52 les/src/js/d3/hbar.js
badd +7 les/src/mako/od_script_includes.html
badd +104 les/src/js/d3/chapter.js
badd +22 les/src/js/d3/circle_chart.js
badd +121 les/src/js/d3/arrow.js
badd +6 les/src/mako/od.html
badd +59 les/src/js/router.js
badd +74 les/src/js/loader.js
badd +21 les/src/js/sandbox.js
badd +28 les/src/js/handlebars_helpers.js
badd +11 les/src/mako/od_fr.html
badd +15 les/todo
badd +46 les/src/mako/od_base.html
badd +103 les/src/js/search.js
badd +83 les/src/js/detail.js
badd +97 les/src/js/format.js
badd +81 les/src/js/widget.js
badd +54 les/src/js/table_builder.js
badd +174 les/src/js/story.js
badd +413 les/src/js/horizontal.js
badd +169 les/src/js/InfoBase/table1.js
badd +12 les/src/js/base_tables.js
badd +112 les/src/js/InfoBase/table2.js
badd +247 les/src/js/InfoBase/table4.js
badd +98 les/src/js/InfoBase/table5.js
badd +133 les/src/js/InfoBase/table6.js
badd +134 les/src/js/InfoBase/table7.js
badd +236 les/src/js/InfoBase/table8.js
badd +6 les/src/js/start.js
badd +84 les/src/js/InfoBase/table9.js
badd +4 les/src/js/InfoBase/table10.js
badd +4 les/src/js/InfoBase/table11.js
badd +144 les/src/js/InfoBase/InfoBase.js
badd +15 les/src/js/utils.js
badd +8 les/src/js/d3/table_builder.js
badd +58 les/src/js/InfoBase/table_common.js
badd +48 les/src/js/d3/stacked.js
silent! argdel *
edit les/src/js/format.js
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
set nosplitbelow
set nosplitright
wincmd t
set winheight=1 winwidth=1
exe 'vert 1resize ' . ((&columns * 88 + 88) / 177)
exe 'vert 2resize ' . ((&columns * 88 + 88) / 177)
argglobal
setlocal keymap=
setlocal noarabic
setlocal noautoindent
setlocal balloonexpr=
setlocal nobinary
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal cindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=j1,J1
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=sO:*\ -,mO:*\ \ ,exO:*/,s1:/*,mb:*,ex:*/,://
setlocal commentstring=//%s
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=
setlocal expandtab
if &filetype != 'javascript'
setlocal filetype=javascript
endif
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=croql
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=0
setlocal include=
setlocal includeexpr=
setlocal indentexpr=
setlocal indentkeys=0{,0},:,0#,!^F,o,O,e
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal nolist
setlocal makeprg=
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=javascriptcomplete#CompleteJS
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
setlocal norelativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=2
setlocal noshortname
setlocal nosmartindent
setlocal softtabstop=2
set spell
setlocal spell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'javascript'
setlocal syntax=javascript
endif
setlocal tabstop=2
setlocal tags=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal nowinfixheight
setlocal nowinfixwidth
set nowrap
setlocal nowrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 61 - ((36 * winheight(0) + 21) / 43)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
61
normal! 07|
wincmd w
argglobal
edit les/src/js/InfoBase/table9.js
setlocal keymap=
setlocal noarabic
setlocal noautoindent
setlocal balloonexpr=
setlocal nobinary
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal cindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=j1,J1
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=sO:*\ -,mO:*\ \ ,exO:*/,s1:/*,mb:*,ex:*/,://
setlocal commentstring=//%s
setlocal complete=.,w,b,u,t,i
setlocal concealcursor=
setlocal conceallevel=0
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=
setlocal expandtab
if &filetype != 'javascript'
setlocal filetype=javascript
endif
setlocal foldcolumn=0
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=croql
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=0
setlocal include=
setlocal includeexpr=
setlocal indentexpr=
setlocal indentkeys=0{,0},:,0#,!^F,o,O,e
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal nolist
setlocal makeprg=
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=javascriptcomplete#CompleteJS
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
setlocal norelativenumber
setlocal norightleft
setlocal rightleftcmd=search
setlocal noscrollbind
setlocal shiftwidth=2
setlocal noshortname
setlocal nosmartindent
setlocal softtabstop=2
set spell
setlocal spell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'javascript'
setlocal syntax=javascript
endif
setlocal tabstop=2
setlocal tags=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal nowinfixheight
setlocal nowinfixwidth
set nowrap
setlocal nowrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 87 - ((35 * winheight(0) + 21) / 43)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
87
normal! 057|
wincmd w
exe 'vert 1resize ' . ((&columns * 88 + 88) / 177)
exe 'vert 2resize ' . ((&columns * 88 + 88) / 177)
tabnext 1
if exists('s:wipebuf')
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 shortmess=filnxtToO
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
