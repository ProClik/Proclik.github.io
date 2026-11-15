/* Kit de présentation ProClik : une page par Espace (RT2O, ERAL, BRS), mêmes onglets partout.
   Chaque page donne ses données dans window.KIT avant de charger ce fichier.
   Tout ce qui est coché ou écrit (liste, étapes faites, notes, options) reste sur l'appareil seulement. */
(function(){
var K=window.KIT;if(!K)return;
var d=document,$=function(i){return d.getElementById(i)};
/* jour / nuit : même réglage que l'Espace et les démos */
var TK='pc-theme';
function lsG(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsS(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}
var th=lsG(TK);if(th==='dark'||th==='light')d.documentElement.setAttribute('data-theme',th);
function themeCur(){return d.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
/* icônes (trait fin, comme l'Espace) */
var P={
  back:'M15 18l-6-6 6-6',moon:'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',sun:'M12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  check:'M5 12.5l4.5 4.5L19 7.5',list:'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',play:'M8 5l11 7-11 7z',euro:'M17 6.5A6.5 6.5 0 0 0 7 12a6.5 6.5 0 0 0 10 5.5M4 10h9M4 14h9',
  scale:'M12 3v18M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0zM8 21h8',chat:'M4 5h16v11H9l-5 4z',flag:'M5 21V4M5 4h11l-2 4 2 4H5',
  open:'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',expand:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',print:'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  undo:'M4 9h11a5 5 0 0 1 0 10H8M4 9l4-4M4 9l4 4',x:'M6 6l12 12M18 6L6 18',copy:'M8 8h11v12H8zM5 16V4h11',clock:'M12 7v5l3 2M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18z',
  chev:'M9 6l6 6-6 6',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6z',pres:'M3 4h18M5 4v10h14V4M12 14v3M8 21l4-4 4 4',
  idea:'M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.6.5-1 1.2-1 2.1H9.5c0-.9-.4-1.6-1-2.1A6 6 0 0 1 12 3z',star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  hide:'M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3 3.4M6.6 6.6C3.9 8.3 2 12 2 12s4 7 10 7c1.8 0 3.4-.5 4.8-1.3'};
function ic(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(P[n]||P.check)+'"/></svg>'}
var LOGO='<svg viewBox="16 -1.5 80 92" aria-hidden="true"><path d="M30.50 44.50A25.50 25.50 0 1 1 81.50 44.50A25.50 25.50 0 1 1 30.50 44.50ZM63.73 62.22A19.34 19.34 0 1 0 48.27 62.22A3.92 3.92 0 0 0 53.76 58.63L53.76 55.71A2.24 2.24 0 0 1 58.24 55.71L58.24 58.63A3.92 3.92 0 0 0 63.73 62.22Z" fill="var(--nuit)"/><circle cx="56" cy="42.82" r="4.71" fill="var(--laiton)"/></svg>';
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function eur(v){return Math.round(v).toLocaleString('fr-FR').replace(/ | /g,' ')+' €'}
/* état (sur l'appareil) */
var SK='pc-kit-'+K.id,S={};try{S=JSON.parse(lsG(SK)||'{}')||{}}catch(e){S={}}
S.ck=S.ck||{};S.et=S.et||{};S.on=S.on||{};
function save(){lsS(SK,JSON.stringify(S))}
function toast(t,i){var e=$('toast');e.innerHTML=ic(i||'check')+'<span>'+esc(t)+'</span>';e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},2400)}

var TABS=[['prep','list','Préparer'],['der','play','Déroulé'],['prix','euro','Prix']];
if(K.comparer)TABS.push(['cmp','scale','Comparer']);
TABS.push(['qr','chat','Questions'],['fin','flag','Conclure']);

function blk(t,i,h,cls){return '<section class="blk'+(cls?' '+cls:'')+'"><h2>'+ic(i)+'<span>'+t+'</span></h2>'+h+'</section>'}
function ul(L){return '<ul>'+L.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'}

/* ---------- Préparer ---------- */
function vPrep(){
  var h='<h1>Préparer le rendez-vous</h1><p class="sous">'+esc(K.sousTitre)+'</p><div class="pile">';
  h+=blk('L\'essentiel en 30 secondes','idea','<p class="pitch">'+K.essentiel.pitch+'</p>'+(K.essentiel.points?ul(K.essentiel.points):''));
  var n=K.avant.length,f=K.avant.filter(function(_,i){return S.ck[i]}).length;
  h+='<section class="blk"><h2>'+ic('check')+'<span>Avant de partir</span><span class="sp"></span><span class="etq'+(f===n?' ok':'')+'">'+f+' / '+n+'</span></h2>'+
    K.avant.map(function(a,i){return '<button class="ck pk" aria-pressed="'+!!S.ck[i]+'" data-ck="'+i+'"><span class="cb">'+(S.ck[i]?ic('check'):'')+'</span><span class="tx">'+a[0]+(a[1]?'<small>'+a[1]+'</small>':'')+'</span></button>'}).join('')+
    '<div class="actions"><button class="b2 pk" data-act="reset">'+ic('undo')+'Remettre la démo à zéro</button><button class="b2 pk" data-act="decoche">'+ic('x')+'Tout décocher</button></div></section>';
  h+=blk('Les liens du jour','open','<div class="liens">'+K.liens.map(function(l){return '<a class="b2 pk" href="'+l[1]+'"'+(l[2]?' target="_blank" rel="noopener"':'')+'>'+ic('open')+'<span>'+l[0]+'</span></a>'}).join('')+'</div>'+(K.liensNote?'<p class="mini">'+K.liensNote+'</p>':''));
  return h+'</div>'}

/* ---------- Déroulé ---------- */
function vDer(){
  var D=K.deroule,tot=D.reduce(function(s,e){return s+e.min},0),fait=D.filter(function(_,i){return S.et[i]}).length;
  var h='<h1>Déroulé de la démo</h1><p class="sous">'+K.deroulePhrase+'</p>';
  h+='<div class="chrono">'+ic('clock')+'<span>'+tot+' minutes · '+fait+' étape'+(fait>1?'s':'')+' sur '+D.length+'</span><span class="barre">'+D.map(function(e,i){return '<i class="'+(S.et[i]?'on':'')+'" style="flex:'+e.min+'"></i>'}).join('')+'</span></div><div class="pile">';
  D.forEach(function(e,i){
    h+='<section class="blk et'+(S.et[i]?' fait':'')+'"><button class="n" data-et="'+i+'" aria-label="Étape '+(i+1)+(S.et[i]?' faite':' à faire')+'">'+(S.et[i]?ic('check'):(i+1))+'</button><div>'+
      '<h3>'+e.t+' <span class="etq">'+e.min+' min</span>'+(e.fort?' <span class="etq la">Moment fort</span>':'')+'</h3><p class="faire">'+e.faire+'</p>'+(e.dire?'<p class="dire">'+e.dire+'</p>':'')+
      '<div class="row">'+(e.liens||[]).map(function(l){return '<a class="b2 pk" href="'+l[1]+'">'+ic('open')+'<span>'+l[0]+'</span></a>'}).join('')+'<button class="b2 pk" data-et="'+i+'">'+ic('check')+(S.et[i]?'Faite':'Marquer faite')+'</button></div></div></section>'});
  if(K.bonus)h+=blk(K.bonus.t,'star',ul(K.bonus.L));
  h+=blk('Phrase de fin','chat','<p class="dire" style="margin:0">'+K.fin+'</p>');
  h+='<div class="actions"><button class="b2 pk" data-act="etz">'+ic('undo')+'Recommencer le déroulé</button></div>';
  return h+'</div>'}

/* ---------- Prix ---------- */
function base(){var C=K.prix.choix;if(!C)return null;var f=S.f!=null?S.f:C.f,t=S.t!=null?S.t:C.t,F=C.formules[f],p=F[1][t];
  return {n:F[0],d:'Prix '+C.tailles[t][1]+(p==null?' : sur devis, chiffré avec vous':'')+(F[2]?' · '+F[2]:''),mois:p,devis:p==null}}
function lignes(){var C=K.prix.choix,f=C?(S.f!=null?S.f:C.f):0,L=K.prix.lignes.map(function(l){if(!l.departF)return l;var c=Object.assign({},l);c.depart=l.departF[f];return c}),b=base();if(b)L.unshift(b);
  return L}
function estOn(l,i){if(!l.opt)return true;var k=l.k||l.n;return S.on[k]!=null?S.on[k]:!!l.on}
function px(l){if(l.txt)return l.txt+(l.txtS?'<small>'+l.txtS+'</small>':'');var a=[];
  if(l.mois!=null)a.push(eur(l.mois)+'<small>HT / mois</small>');if(l.depart!=null)a.push(eur(l.depart)+'<small>HT une fois</small>');
  if(l.devis)return 'Sur devis';return (l.barre?'<s>'+l.barre+'</s>':'')+a.join('')}
function vPrix(){
  var Pp=K.prix,C=Pp.choix,L=lignes(),m=0,dep=0,devis=false;
  L.forEach(function(l,i){if(!estOn(l,i))return;if(l.devis)devis=true;if(l.mois!=null&&!l.horsTotal)m+=l.mois;if(l.depart!=null&&!l.horsTotal)dep+=l.depart});
  var h='<div class="hors-prop"><h1>La fiche de prix</h1><p class="sous">'+Pp.intro+'</p></div>';
  if(C){var f=S.f!=null?S.f:C.f,t=S.t!=null?S.t:C.t;
    h+='<div class="hors-prop"><div class="choix" role="group" aria-label="Formule">'+C.formules.map(function(F,i){return '<button aria-pressed="'+(i===f)+'" data-f="'+i+'">'+F[0]+'</button>'}).join('')+'</div>'+
      '<div class="choix" role="group" aria-label="Taille de l\'équipe">'+C.tailles.map(function(T,i){return '<button aria-pressed="'+(i===t)+'" data-t="'+i+'">'+T[0]+'</button>'}).join('')+'</div></div>'}
  h+='<div class="prop" id="prop"><div class="ent">'+LOGO+'<span><b>'+Pp.titre+'</b><small>'+Pp.sous+'</small></span></div>';
  L.forEach(function(l,i){var on=estOn(l,i);
    h+='<div class="lg'+(on?'':' off')+'"><span class="tx"><b>'+l.n+'</b>'+(l.d?'<small>'+l.d+'</small>':'')+'</span><span class="px">'+px(l)+'</span>'+
      (l.opt?'<button class="sw" aria-pressed="'+on+'" aria-label="'+esc(l.n)+' : '+(on?'active':'pas prise')+'" data-sw="'+esc(l.k||l.n)+'"></button>':'')+'</div>'});
  h+='<div class="tot"><div><small>Chaque mois</small><b>'+(devis?'Sur devis':eur(m)+' <em>HT</em>')+'</b></div><div><small>Au départ</small><b>'+(dep?eur(dep)+' <em>HT</em>':'0 €')+'</b></div></div>';
  if(Pp.conditions&&Pp.conditions.length)h+='<ul class="cond">'+Pp.conditions.map(function(c){return '<li>'+ic('check')+'<span>'+c+'</span></li>'}).join('')+'</ul>';
  h+='<span class="ex">'+Pp.mention+'</span></div>';
  h+='<div class="actions hors-prop"><button class="go" data-act="grand">'+ic('expand')+'Montrer en grand</button><button class="b2 pk" data-act="print">'+ic('print')+'Imprimer ou PDF</button></div>';
  h+='<p class="mini hors-prop">Les interrupteurs montrent le prix avec ou sans une option, en direct devant le client. Une option prise est « active », jamais « incluse ».</p>';
  if(Pp.vous)h+='<div class="pile hors-prop" style="margin-top:12px">'+Pp.vous.map(function(v){return blk(v[0],v[1]||'eye',ul(v[2]),'vous')}).join('')+'</div>';
  return h}

/* ---------- Comparer ---------- */
function vCmp(){var C=K.comparer,h='<h1>'+C.titre+'</h1><p class="sous">'+C.intro+'</p><div class="pile">';
  C.tables.forEach(function(T){h+=blk(T.t,'scale',(T.p?'<p>'+T.p+'</p>':'')+'<div class="tab-w"><table class="cmp"><tr>'+T.cols.map(function(c){return '<th>'+c+'</th>'}).join('')+'</tr>'+
    T.rows.map(function(r){return '<tr'+(r.nous?' class="nous"':'')+'>'+r.c.map(function(c,j){return '<td'+(T.num===j?' class="n"':'')+'>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>'+(T.note?'<p class="mini">'+T.note+'</p>':''))});
  if(C.honnete)h+=blk('À dire honnêtement','chat',ul(C.honnete),'vous');
  if(C.sources)h+='<p class="src">Sources : '+C.sources.map(function(s){return '<a href="'+s[1]+'" target="_blank" rel="noopener">'+s[0]+'</a>'}).join(' · ')+'</p>';
  return h+'</div>'}

/* ---------- Questions ---------- */
function vQr(){var h='<h1>Questions et objections</h1><p class="sous">Posez les questions avant la démo, puis montrez les écrans qui y répondent.</p><div class="pile deux">';
  h+=blk('À leur demander','chat','<ol>'+K.questions.map(function(q){return '<li>'+q+'</li>'}).join('')+'</ol>');
  h+='<section class="blk"><h2>'+ic('idea')+'<span>S\'ils disent…</span></h2>'+K.objections.map(function(o,i){return '<div class="ob"><button aria-expanded="false" data-ob="'+i+'">'+ic('chev')+'<span>'+o[0]+'</span></button><div class="rep">'+o[1]+'</div></div>'}).join('')+'</section></div>';
  h+='<div class="pile" style="margin-top:12px"><section class="blk"><h2>'+ic('list')+'<span>Notes du rendez-vous</span></h2><textarea class="notes" id="notes" placeholder="Ce qu\'ils utilisent aujourd\'hui, ce qui les a fait réagir, ce qu\'il faut adapter… (dictée du clavier possible)">'+esc(S.notes||'')+'</textarea>'+
    '<div class="actions"><button class="b2 pk" data-act="copier">'+ic('copy')+'Copier les notes</button></div><p class="mini">Les notes restent sur cet appareil seulement.</p></section></div>';
  return h}

/* ---------- Conclure ---------- */
function vFin(){var F=K.conclure,h='<h1>Conclure</h1><p class="sous">'+F.intro+'</p><div class="pile">';
  h+=blk('Pour finir le rendez-vous','flag','<ol>'+F.etapes.map(function(e){return '<li>'+e+'</li>'}).join('')+'</ol>');
  if(F.apres)h+=blk('Dans les jours qui suivent','clock',ul(F.apres));
  if(F.confirmer)h+=blk('À confirmer avant le jour J','eye',ul(F.confirmer),'vous');
  if(K.masquable)h+='<div class="actions"><button class="b2 pk" data-act="masquer">'+ic('hide')+'Masquer le bouton Présentation sur cet appareil</button></div>';
  return h+'</div>'}

var V={prep:vPrep,der:vDer,prix:vPrix,cmp:vCmp,qr:vQr,fin:vFin};
var cur=S.tab&&V[S.tab]&&TABS.some(function(t){return t[0]===S.tab})?S.tab:'prep';
try{var qt=new URLSearchParams(location.search).get('o');if(qt&&V[qt])cur=qt}catch(e){}

function head(){return '<header class="top"><div class="l1"><a class="retour pk" href="'+K.retour.href+'">'+ic('back')+'<span>'+K.retour.t+'</span></a>'+
  '<span class="logo">'+LOGO+'<span><b>Présentation · '+esc(K.client)+'</b><small>'+esc(K.demo)+'</small></span></span><span class="sp"></span>'+
  '<button class="rb pk" id="th" aria-label="Jour ou nuit">'+ic(themeCur()==='dark'?'sun':'moon')+'</button></div>'+
  '<nav class="tabs" role="tablist">'+TABS.map(function(t){return '<button role="tab" data-tab="'+t[0]+'" aria-selected="'+(t[0]===cur)+'">'+ic(t[1])+t[2]+'</button>'}).join('')+'</nav><div class="pad"></div></header>'}
function render(){S.tab=cur;save();
  $('m').innerHTML='<div class="sec on '+cur+'">'+V[cur]()+'</div>';
  d.querySelectorAll('.tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab===cur)});
  var n=$('notes');if(n)n.addEventListener('input',function(){S.notes=n.value;save()})}

d.body.insertAdjacentHTML('afterbegin',head()+'<main id="m"></main><button class="rb pk sortir" data-act="petit" aria-label="Revenir au kit">'+ic('x')+'</button><div class="toast" id="toast" role="status"></div>');
render();
var act=d.querySelector('.tabs button[aria-selected="true"]');if(act&&act.scrollIntoView)try{act.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}

d.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var D=b.dataset;
  if(D.tab){cur=D.tab;d.body.classList.remove('grand');render();scrollTo(0,0);return}
  if(b.id==='th'){var n=themeCur()==='dark'?'light':'dark';d.documentElement.setAttribute('data-theme',n);lsS(TK,n);b.innerHTML=ic(n==='dark'?'sun':'moon');return}
  if(D.ck!=null){S.ck[D.ck]=!S.ck[D.ck];save();render();return}
  if(D.et!=null){S.et[D.et]=!S.et[D.et];save();render();return}
  if(D.sw!=null){var L=lignes(),l=L.filter(function(x){return (x.k||x.n)===D.sw})[0];S.on[D.sw]=!estOn(l);save();render();return}
  if(D.f!=null){S.f=+D.f;save();render();return}
  if(D.t!=null){S.t=+D.t;save();render();return}
  if(D.ob!=null){b.setAttribute('aria-expanded',b.getAttribute('aria-expanded')!=='true');return}
  var a=D.act;if(!a)return;
  if(a==='reset'){try{Object.keys(localStorage).forEach(function(k){if(K.reset.some(function(p){return k.indexOf(p)===0}))localStorage.removeItem(k)})}catch(e){}toast('Démo remise à zéro');return}
  if(a==='decoche'){S.ck={};save();render();return}
  if(a==='etz'){S.et={};save();render();return}
  if(a==='grand'){d.body.classList.add('grand');scrollTo(0,0);return}
  if(a==='petit'){d.body.classList.remove('grand');return}
  if(a==='print'){print();return}
  if(a==='copier'){var t=S.notes||'';if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('Notes copiées')},function(){toast('Copie impossible','x')});else toast('Copie impossible','x');return}
  if(a==='masquer'){lsS('pc-presentation',null);toast('Bouton masqué. Pour le retrouver : lien avec ?presentation=1','hide');return}
});
d.addEventListener('keydown',function(e){if(e.key==='Escape')d.body.classList.remove('grand')});
})();
