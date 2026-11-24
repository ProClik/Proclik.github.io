/* Module « Équipe » de l'Espace ProClik (Cyril, 15/11 : « garder le même style que le planning de BRS, mais ajouter une partie
   comme celle de RT2O »). Une vue de plus dans le Planning : qui est sur quel chantier chaque jour, combien de personnes,
   s'il en manque, et la semaine de chaque personne. Même dessin que le reste du Planning de BRS (cartes, segments, feuille du bas).
   Module activable par entreprise (Mes options › Équipe). Personnes et affectations d'exemple tant que l'équipe n'est pas branchée.
   24/11 (Cyril : « la gestion des employés sur le chantier ») : affectations rangées par DATE (plus par n° de jour de la semaine),
   semaines qui défilent (‹ ›), et window.PCEQ partagé avec la fiche du chantier (bloc « Votre équipe sur ce chantier »). */
(function(){
'use strict';
var d=document,X=window.PCX,O=window.PCOPT;if(!X)return;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
var esc=X.esc||function(s){return String(s)};

/* ---------- données (partagées avec la fiche chantier) ---------- */
var JOURS=['Lun.','Mar.','Mer.','Jeu.','Ven.'],JL=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],JC=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'],
 MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
var EQ=[{n:'Thomas',r:'Chef'},{n:'Kevin',r:'Plaquiste'},{n:'Mathieu',r:'Plaquiste'},{n:'Lucas',r:'Apprenti'}];
var COUL=['var(--k-run)','var(--k-visit)','var(--k-liv)','var(--k-autre)','var(--k-devis)','var(--k-plan)'];
function p2(n){return (n<10?'0':'')+n}
function iso(x){return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate())}
function dte(s){return new Date(s+'T12:00:00')}
function plus(x,n){var y=new Date(x);y.setDate(y.getDate()+n);return y}
function lundiDe(x){var y=new Date(x);y.setHours(12,0,0,0);y.setDate(y.getDate()-((y.getDay()+6)%7));return y}
function auj(){return window.PCDEMO?PCDEMO.today():new Date()}
var LUN0=lundiDe(auj());
function chantiers(){var C=X.CH||{};return Object.keys(C).map(function(k){return C[k]}).filter(function(c){return c&&c.st!=='done'})}
function couleur(id){var L=chantiers().map(function(c){return c.id});var i=L.indexOf(id);return COUL[(i<0?0:i)%COUL.length]}
function lettre(c){return (c.n||'?').replace(/^(M\.|Mme|Cabinet|SCI)\s+/,'').charAt(0).toUpperCase()}
/* jours de travail d'un chantier = ses jours « Chantier » du planning */
function evJours(id){var c=(X.CH||{})[id],o={};(X.EV||[]).forEach(function(e){if(e.k!=='run')return;var x=e.x||{};
  if(x.ch===id||(id==='alpes'&&x.ch===1)||(c&&c.n&&String(e.t||'').indexOf(c.n)>-1))o[e.d]=1});return Object.keys(o).sort()}
var K='pc-eq2';
function lit(){try{return JSON.parse(localStorage.getItem(K)||'null')}catch(e){return null}}
function ecrit(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
var S=lit();
if(!S||!S.jr){S={jr:{},bes:{},env:{},prev:{}};
  var L=chantiers().map(function(c){return c.id}),a=L[0],b=L[1]||L[0],Ja=evJours(a);
  var M={Thomas:[a,a,b,b,'bureau'],Kevin:[a,a,a,b,b],Mathieu:[b,b,a,a,a],Lucas:[a,a,'',b,b]};
  [0,7].forEach(function(w){for(var i=0;i<5;i++){var k=iso(plus(LUN0,w+i)),o=S.jr[k]={};
    EQ.forEach(function(p,j){var v=M[p.n][i];if(v===a&&Ja.length&&Ja.indexOf(k)<0)v=(j%2&&L[2])?L[2]:b;o[p.n]=v})}});
  ecrit()}
['jr','bes','env','prev'].forEach(function(k){if(!S[k])S[k]={}});
/* tâches par personne et par jour (Cyril 24/11) : lignes de travaux du chantier ; exemple : travaux pas finis répartis sur les jours */
if(!S.ta){S.ta={};chantiers().forEach(function(c){var R=(c.ouv||[]).filter(function(o){return o[2]<100}).map(function(o){return o[0]}),i=0;if(!R.length)return;
  evJours(c.id).forEach(function(k){EQ.forEach(function(p){if(get(k,p.n)===c.id){(S.ta[k]=S.ta[k]||{})[p.n]=[R[i%R.length]];i++}})})});ecrit()}
function taches(k,n){return ((S.ta[k]||{})[n]||[]).slice()}
function togTache(k,n,t){var o=S.ta[k]=S.ta[k]||{},L=o[n]=o[n]||[],i=L.indexOf(t);if(i>-1)L.splice(i,1);else L.push(t);ecrit();bouge()}
function get(k,n){return (S.jr[k]||{})[n]||''}
function set(k,n,v){(S.jr[k]=S.jr[k]||{})[n]=v;ecrit();bouge()}
function qui(id,k){return EQ.filter(function(p){return get(k,p.n)===id})}
function besoin(id,k){var B=S.bes[id];if(B&&B[k]!=null)return B[k];var J=evJours(id);return J.length?(J.indexOf(k)>-1?2:0):(dte(k).getDay()%6?2:0)}
function setBesoin(id,k,n){(S.bes[id]=S.bes[id]||{})[k]=Math.max(0,n);ecrit();bouge()}
/* jours à venir d'un chantier (aujourd'hui compris) : ceux du planning, sinon les 5 prochains jours ouvrés */
function jours(id){var T=iso(auj()),J=evJours(id).filter(function(k){return k>=T});if(J.length)return J;
  var c=(X.CH||{})[id];if(c&&c.st==='done')return [];var R=[],x=auj();while(R.length<5){if(x.getDay()%6)R.push(iso(x));x=plus(x,1)}return R}
function nomCase(v){if(!v)return 'Rien de prévu';if(v==='bureau')return 'Au bureau';if(v==='repos')return 'Repos ou congé';var c=(X.CH||{})[v];return c?c.n:v}
/* ce qu'on a envoyé à l'équipe pour un chantier : signature des affectations, pour voir s'il y a eu des changements depuis */
function sig(id){return jours(id).map(function(k){return k+':'+qui(id,k).map(function(p){return p.n+'='+taches(k,p.n).join(',')}).join('+')}).join('|')}
function prevenir(id){var Q={};jours(id).forEach(function(k){qui(id,k).forEach(function(p){Q[p.n]=1})});var N=Object.keys(Q);
  S.prev[id]={d:iso(auj()),sig:sig(id),qui:N,vu:N.slice(0,Math.max(0,N.length-1))};ecrit();bouge();return N}
function prevenu(id){var P=S.prev[id];if(!P)return null;return {d:P.d,qui:P.qui||[],vu:P.vu||[],change:P.sig!==sig(id)}}
var ecoute=[];function bouge(){ecoute.forEach(function(f){try{f()}catch(e){}})}
function jourLong(k){var x=dte(k);return JL[x.getDay()]+' '+x.getDate()+' '+MOIS[x.getMonth()]}
function jourCourt(k){var x=dte(k);return JC[x.getDay()]+' '+x.getDate()}
function relatif(k){var T=iso(auj()),D=iso(plus(auj(),1));return k===T?'Aujourd\'hui':k===D?'Demain':jourCourt(k)}
window.PCEQ={EQ:EQ,iso:iso,get:get,set:set,taches:taches,togTache:togTache,qui:qui,besoin:besoin,setBesoin:setBesoin,jours:jours,nomCase:nomCase,prevenir:prevenir,prevenu:prevenu,
  jourLong:jourLong,jourCourt:jourCourt,relatif:relatif,ecoute:function(f){ecoute.push(f)}};

if(!$('#v-planning'))return;
if(O&&O.actif('equipe')===false)return;
var WK=0;
function kj(j){return iso(plus(LUN0,7*WK+j))}
function date(j){return plus(LUN0,7*WK+j).getDate()}
function titreSem(){var a=plus(LUN0,7*WK),b=plus(a,4);return 'Semaine du '+a.getDate()+(a.getMonth()!==b.getMonth()?' '+MOIS[a.getMonth()]:'')+' au '+b.getDate()+' '+MOIS[b.getMonth()]}

/* ---------- la vue ---------- */
var seg=$('#v-planning .seg'),pv=d.createElement('div');pv.id='p-equipe';pv.className='pv';pv.hidden=true;pv.style.marginTop='12px';
$('#v-planning').appendChild(pv);
var bt=d.createElement('button');bt.setAttribute('role','tab');bt.id='seg-equipe';bt.dataset.seg='equipe';bt.setAttribute('aria-selected','false');bt.textContent='Équipe';
if(seg)seg.appendChild(bt);
bt.addEventListener('click',function(){$$('button',seg).forEach(function(x){x.setAttribute('aria-selected',String(x===bt))});$$('#v-planning .pv').forEach(function(p){p.hidden=p!==pv});rend()});
ecoute.push(function(){if(!pv.hidden)rend()});

/* 24/11 (Cyril : « un planning équipe qui ressemblerait au planning de l'Espace ») : même dessin que Planning › Semaine
   (jours en tuiles, aujourd'hui en bleu nuit, une colonne par jour, cartes à point de couleur, « Libre » en pointillés).
   Dans chaque colonne : une carte par chantier avec les prénoms, puis Bureau, puis « Libre » = ceux qui n'ont rien de prévu. */
var SEL=null;
function court(v){if(!v)return '—';if(v==='bureau')return 'Bureau';if(v==='repos')return 'Repos';var c=(X.CH||{})[v];if(!c)return v;
  var w=(c.n||'').replace(/^(M\.|Mme|Cabinet|SCI|Maison)\s+/,'').split(/[\s·,]+/)[0];return w.length>8?w.slice(0,7)+'.':w}
function nomCh(c){return (c.n||'').replace(/^Cabinet\s+/,'')}
function manques(){var A=[];for(var i=0;i<5;i++){var k=kj(i);
  chantiers().forEach(function(c){var m=besoin(c.id,k)-qui(c.id,k).length;if(m>0)A.push([k,'c',c.id,jourCourt(k)+' · '+c.n+' : il manque '+m+' personne'+(m>1?'s':'')])});
  EQ.forEach(function(p){if(!get(k,p.n))A.push([k,'p',p.n,jourCourt(k)+' · '+p.n+' n\'a rien de prévu'])})}return A}
function rend(){
  var CHs=chantiers(),A=manques(),h='',env=S.env[kj(0)],T=iso(auj()),K5=[0,1,2,3,4].map(kj),M0=dte(K5[0]);
  h+=(window.PCTAG?window.PCTAG('equipe'):'');
  h+='<div class="cal-top"><h3>'+MOIS[M0.getMonth()].replace(/^./,function(x){return x.toUpperCase()})+' <span>'+M0.getFullYear()+'</span></h3><div class="cal-nav"><button class="nb" data-wk="-1" aria-label="Semaine précédente">‹</button><button data-wk="0">Aujourd\'hui</button><button class="nb" data-wk="1" aria-label="Semaine suivante">›</button></div></div>';
  var G='grid-template-columns:repeat(5,minmax(0,1fr))';
  h+='<div class="wkc eqw"><div class="wkc-h" style="'+G+'"><div style="display:none"></div>'+K5.map(function(k,i){var n=EQ.filter(function(p){var v=get(k,p.n);return v&&v!=='repos'}).length,
      m=CHs.reduce(function(s,c){return s+Math.max(0,besoin(c.id,k)-qui(c.id,k).length)},0);
    return '<div class="'+(k===T?'tdy':'')+'">'+JOURS[i].replace('.','')+'<b>'+dte(k).getDate()+'</b><small class="f2n'+(m?' eqw-m':'')+'">'+(m?'il manque '+m:n+' pers.')+'</small></div>'}).join('')+'</div>';
  h+='<div class="wkc-b" style="'+G+'">'+K5.map(function(k){
    var cartes=CHs.filter(function(c){return besoin(c.id,k)>0||qui(c.id,k).length}).map(function(c){var Q=qui(c.id,k),m=besoin(c.id,k)-Q.length;
      return '<button type="button" class="ev'+(m>0?' eqw-man':'')+'" data-eqc="'+c.id+'" data-k="'+k+'" style="--c:'+couleur(c.id)+'"><b>'+esc(nomCh(c))+'</b>'+
        Q.map(function(p){return '<small>'+p.n+'</small>'}).join('')+(m>0?'<em>+'+m+' à trouver</em>':'')+'</button>'}).join('');
    var bu=EQ.filter(function(p){return get(k,p.n)==='bureau'}),re=EQ.filter(function(p){return get(k,p.n)==='repos'}),li=EQ.filter(function(p){return !get(k,p.n)});
    if(bu.length)cartes+='<button type="button" class="ev" data-eqp="'+bu[0].n+'" data-k="'+k+'" style="--c:var(--muted)"><b>Bureau</b>'+bu.map(function(p){return '<small>'+p.n+'</small>'}).join('')+'</button>';
    if(re.length)cartes+='<button type="button" class="ev" data-eqp="'+re[0].n+'" data-k="'+k+'" style="--c:var(--line)"><b>Repos</b>'+re.map(function(p){return '<small>'+p.n+'</small>'}).join('')+'</button>';
    if(li.length)cartes+='<button type="button" class="ev free" data-eqp="'+li[0].n+'" data-k="'+k+'" style="--c:var(--k-free)"><b>Libre</b>'+li.map(function(p){return '<small>'+p.n+'</small>'}).join('')+'</button>';
    return '<div class="wkc-col'+(k===T?' tdy':'')+'">'+cartes+'</div>'}).join('')+'</div></div>';
  h+='<div class="eqw-leg">'+CHs.map(function(c){return '<span><i style="background:'+couleur(c.id)+'"></i>'+esc(c.n)+'</span>'}).join('')+'<span><i class="free"></i>Libre : rien de prévu</span></div>';
  /* à régler dans la semaine */
  if(A.length)h+='<div class="card eq-regl"><div class="sec-h" style="margin-bottom:4px"><h2>À régler cette semaine</h2><span>'+A.length+'</span></div>'+A.slice(0,5).map(function(a){
    return '<button type="button" class="eq-rg" '+(a[1]==='c'?'data-eqc="'+a[2]+'"':'data-eqp="'+a[2]+'"')+' data-k="'+a[0]+'"><span>'+esc(a[3])+'</span><span class="ch-vb">Régler</span></button>'}).join('')+(A.length>5?'<p class="hint" style="margin:6px 0 0">… et '+(A.length-5)+' autre'+(A.length-5>1?'s':'')+'.</p>':'')+'</div>';
  /* la semaine de chacun */
  h+='<div class="sec-h eq-sh"><h2>La semaine de chacun</h2><span>touchez une case pour changer</span></div><div class="card eq-p"><div class="eq-pl eq-ph"><span class="eq-n"></span><span class="eq-sem">'+K5.map(function(x,i){return '<span class="'+(x===T?'on':'')+'">'+JOURS[i].replace('.','')+' '+dte(x).getDate()+'</span>'}).join('')+'</span></div>'+EQ.map(function(p){
    return '<div class="eq-pl"><span class="eq-n"><b>'+p.n+'</b><small>'+p.r+'</small></span><span class="eq-sem">'+K5.map(function(x){var v=get(x,p.n),c=(X.CH||{})[v];
      return '<button type="button" class="eq-k'+(v?'':' vide')+(c?' ch':'')+'" data-eqp="'+p.n+'" data-k="'+x+'" style="'+(c?'--cc:'+couleur(v):'')+'" aria-label="'+jourCourt(x)+' : '+esc(nomCase(v))+'">'+esc(court(v))+'</button>'}).join('')+'</span></div>'}).join('')+'</div>';
  h+='<button type="button" class="btn go eq-env" id="eq-env"><span class="lab"><span>'+(env?'Renvoyer le planning à l\'équipe':'Envoyer le planning à l\'équipe')+'</span></span></button>';
  if(env)h+='<p class="hint" style="text-align:center">Envoyé : chacun voit sa semaine dans son Espace.</p>';
  pv.innerHTML=h}

/* ---------- toucher un jour d'un chantier : qui vient ---------- */
function caseCh(id,k){var c=(X.CH||{})[id];
  function sous(){return jourLong(k)+' · '+qui(id,k).length+' sur '+besoin(id,k)+' prévus'}
  function corps(){return '<p class="hint" style="margin:0 0 10px">Touchez une personne pour la mettre sur ce chantier, ou l\'enlever. Puis touchez ce qu\'elle fait.</p><div class="eq-choix">'+EQ.map(function(p){var v=get(k,p.n),ici=v===id;
    var T=taches(k,p.n),O=(c.ouv||[]).map(function(o){return o[0]});T.forEach(function(t){if(O.indexOf(t)<0)O.push(t)});
    var hT=ici&&O.length?'<div class="cheq-ta"><small>Ce qu\'il fait :</small>'+O.map(function(t){var on=T.indexOf(t)>-1;return '<button type="button" class="cheq-tc'+(on?' on':'')+'" data-ta="'+esc(t)+'" data-tp="'+p.n+'" aria-pressed="'+on+'">'+esc(t)+'</button>'}).join('')+'</div>':'';
    return '<div class="cheq-pw'+(ici?' on':'')+'"><button type="button" class="eq-o'+(ici?' on':'')+'" data-pp="'+p.n+'"><span class="eq-av"><i>'+p.n.charAt(0)+'</i></span><span class="tx"><b>'+p.n+'</b><small>'+(ici?'Sur ce chantier':esc(nomCase(v)))+'</small></span><span class="eq-ck">'+(ici?'✓':'+')+'</span></button>'+hT+'</div>'}).join('')+'</div>'}
  X.xopen(c.n,sous(),corps(),'<button class="btn go" id="eq-ok" style="width:100%">C\'est bon</button>',lie);
  function lie(){$$('#x-in [data-pp]').forEach(function(b){b.onclick=function(){var p=b.dataset.pp;set(k,p,get(k,p)===id?'':id);$('#x-in').innerHTML=corps();$('#x-s').textContent=sous();lie()}});
    $$('#x-in [data-ta]').forEach(function(b){b.onclick=function(){togTache(k,b.dataset.tp,b.dataset.ta);$('#x-in').innerHTML=corps();lie()}});
    var ok=$('#eq-ok');if(ok)ok.onclick=function(){X.xclose()}}}
/* ---------- toucher le jour d'une personne : où elle va ---------- */
function caseP(p,k){var CHs=chantiers(),L=CHs.map(function(c){return [c.id,c.n]}).concat([['bureau','Au bureau'],['repos','Repos ou congé'],['','Rien de prévu']]);
  X.xopen(p,jourLong(k),'<div class="eq-choix">'+L.map(function(o){var on=get(k,p)===o[0];return '<button type="button" class="eq-o'+(on?' on':'')+'" data-v="'+o[0]+'"><span class="tx"><b>'+esc(o[1])+'</b></span><span class="eq-ck">'+(on?'✓':'')+'</span></button>'}).join('')+'</div>','',function(){
    $$('#x-in [data-v]').forEach(function(b){b.onclick=function(){set(k,p,b.dataset.v);X.xclose();X.toast(p+' : '+nomCase(b.dataset.v),jourLong(k))}})})}

pv.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.wk){WK=b.dataset.wk==='0'?0:WK+(+b.dataset.wk);return rend()}
  if(b.dataset.sel){SEL=b.dataset.sel;return rend()}
  if(b.dataset.eqc)return caseCh(b.dataset.eqc,b.dataset.k);
  if(b.dataset.eqp)return caseP(b.dataset.eqp,b.dataset.k);
  if(b.id==='eq-env'){S.env[kj(0)]=true;ecrit();rend();X.toast('Planning envoyé à l\'équipe','Chacun voit sa semaine sur son téléphone (exemple).')}});

var st=d.createElement('style');
st.textContent=
 '#p-equipe .cal-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px}'+
 '#p-equipe .eq-ex{font-size:11.5px;font-weight:700;color:var(--muted);background:var(--teinte);padding:4px 10px;border-radius:99px}'+
 '#p-equipe .eq-regl p{margin:4px 0;font-size:13.5px;color:var(--fg)}#p-equipe .eq-regl{margin-bottom:14px;box-shadow:inset 3px 0 0 var(--cor),var(--up)}'+
 '#p-equipe .eq-ch{display:grid;gap:12px;margin-bottom:16px}@media (min-width:900px){#p-equipe .eq-ch{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '#p-equipe .eq-c{margin:0;padding:14px}#p-equipe .eq-h{display:flex;align-items:center;gap:10px;margin-bottom:10px}'+
 '#p-equipe .eq-h .tx{display:flex;flex-direction:column;min-width:0}#p-equipe .eq-h small{color:var(--muted);font-size:12.5px}'+
 '#p-equipe .eq-l,#p-equipe .eq-leg i{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--cc,var(--muted));color:#fff;font:800 13px/1 Manrope,system-ui,sans-serif;font-style:normal}'+
 '#p-equipe .eq-j{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}'+
 '#p-equipe .eq-d{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px;border-radius:14px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);min-width:0}'+
 '#p-equipe .eq-d small{font-size:11px;color:var(--muted);font-weight:600;white-space:nowrap}#p-equipe .eq-d b{font-size:20px;line-height:1}'+
 '#p-equipe .eq-d em{font-style:normal;font-size:10.5px;font-weight:700;color:var(--cor);white-space:nowrap}#p-equipe .eq-d.manque{box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--cor)}'+
 '#p-equipe .eq-av{display:flex;justify-content:center;flex-wrap:wrap;gap:2px;min-height:18px}#p-equipe .eq-av i,.eq-choix .eq-av i{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font:800 10px/1 Manrope,system-ui,sans-serif;font-style:normal;background:var(--teinte);color:var(--fg)}'+
 '#p-equipe .eq-p{margin:0 0 14px;padding:10px 14px}#p-equipe .eq-pl{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}#p-equipe .eq-pl:first-child{border-top:0}'+
 '#p-equipe .eq-n{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eq-n small{color:var(--muted);font-size:12px}'+
 '#p-equipe .eq-sem{display:flex;gap:5px}#p-equipe .eq-k{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;font:800 13px/1 Manrope,system-ui,sans-serif;color:#fff;background:var(--cc,var(--muted))}'+
 '#p-equipe .eq-k.vide{background:var(--bg);color:var(--cor);box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--cor)}'+
 '#p-equipe .eq-leg{display:flex;flex-wrap:wrap;gap:8px 14px;padding-top:10px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)}#p-equipe .eq-leg span{display:flex;align-items:center;gap:6px}#p-equipe .eq-leg i{width:20px;height:20px;font-size:10.5px}#p-equipe .eq-leg i.b{background:var(--muted)}'+
 '#p-equipe .eq-env{width:100%;justify-content:center}'+
 '.eq-choix{display:grid;gap:8px}.eq-o{display:flex;align-items:center;gap:10px;padding:12px;border-radius:16px;background:var(--bg);box-shadow:var(--n1-pk);text-align:left;color:var(--fg)}'+
 '.eq-o .tx{flex:1;display:flex;flex-direction:column}.eq-o small{color:var(--muted);font-size:12.5px}.eq-o.on{box-shadow:var(--n1-pk),0 0 0 2px var(--n1-laiton)}.eq-o .eq-ck{font-weight:800;color:var(--n1-nuit)}'+
 '.eq-choix .eq-av i{width:30px;height:30px;font-size:13px}'+
 '#p-equipe .eq-top{justify-content:flex-start}#p-equipe .eq-top h3{flex:1;text-align:center;margin:0}#p-equipe .eq-fl{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;line-height:1;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg)}'+
 '#p-equipe .eq-d.off{opacity:.45;box-shadow:none}'+
 'html body #v-planning #p-equipe .wkc-b{display:grid;gap:4px;height:auto!important}'+
 'html body #v-planning #p-equipe .wkc-col{position:relative;display:flex;flex-direction:column;gap:6px;padding:4px;min-height:220px}'+
 'html body #v-planning #p-equipe .wkc-col .ev{position:relative!important;left:auto!important;right:auto!important;top:auto!important;height:auto!important;display:flex!important;flex-direction:column;align-items:stretch;text-align:left;min-width:0;width:100%;cursor:pointer}'+
 'html body #v-planning #p-equipe .wkc-col .ev b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}'+
 'html body #v-planning #p-equipe .wkc-col .ev small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10.5px!important;line-height:1.35;color:var(--fg)!important;font-weight:600}'+
 'html body #v-planning #p-equipe .wkc-col .ev.free small{color:var(--cor,#B4472F)!important}'+
 'html body #v-planning #p-equipe .wkc-col .ev em{display:block;font-style:normal;font-size:10px;font-weight:800;color:var(--cor,#B4472F);margin-top:2px;line-height:1.2}'+
 'html body #v-planning #p-equipe .wkc-col .ev.eqw-man{box-shadow:inset 0 0 0 1.5px var(--cor,#B4472F),var(--z-ombre-s,0 1px 3px rgba(0,0,0,.1))!important}'+
 'html body #v-planning #p-equipe .wkc-h small.eqw-m{color:var(--cor,#B4472F)!important;font-weight:800}'+
 '@media (min-width:700px){html body #v-planning #p-equipe .wkc-col .ev b{font-size:13px!important}html body #v-planning #p-equipe .wkc-col .ev small{font-size:12.5px!important}html body #v-planning #p-equipe .wkc-col .ev em{font-size:12px}html body #v-planning #p-equipe .wkc-col .ev{padding:8px 10px 8px!important}html body #v-planning #p-equipe .wkc-col .ev::before{left:10px!important;top:12px!important}html body #v-planning #p-equipe .wkc-col .ev b{padding-top:0!important;padding-left:14px}}'+
 '#p-equipe .eqw-leg{display:flex;flex-wrap:wrap;gap:6px 14px;margin:10px 2px 16px;font-size:12.5px;color:var(--muted)}#p-equipe .eqw-leg span{display:flex;align-items:center;gap:6px}#p-equipe .eqw-leg i{width:8px;height:8px;border-radius:50%}#p-equipe .eqw-leg i.free{border:1.5px dashed var(--muted);width:10px;height:10px;box-sizing:border-box}'+
 '#p-equipe .eq-jours{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:0 0 16px}'+
 '#p-equipe .eq-jours button{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 2px;border-radius:16px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);min-width:0}'+
 '#p-equipe .eq-jours small{font-size:11.5px;color:var(--muted);font-weight:600}#p-equipe .eq-jours b{font-size:19px;line-height:1.15}#p-equipe .eq-jours em{font-style:normal;font-size:10px;font-weight:700;color:var(--n1-laiton)}'+
 '#p-equipe .eq-jours button[aria-selected="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}#p-equipe .eq-jours button[aria-selected="true"] small,#p-equipe .eq-jours button[aria-selected="true"] em{color:rgba(255,255,255,.8)}'+
 '#p-equipe .eq-pt{position:absolute;top:6px;right:8px;width:8px;height:8px;border-radius:50%;background:var(--cor,#B4472F)}'+
 '#p-equipe .eq-sh h2::first-letter{text-transform:uppercase}'+
 '#p-equipe .eq-ou{display:grid;gap:12px;margin-bottom:16px}@media (min-width:900px){#p-equipe .eq-ou{grid-template-columns:repeat(2,minmax(0,1fr))}#p-equipe .eq-hors{grid-column:1/-1}}'+
 '#p-equipe .eq-cc{margin:0;padding:14px 16px;box-shadow:inset 4px 0 0 var(--cc),var(--up)}#p-equipe .eq-cc.manque{box-shadow:inset 4px 0 0 var(--cc),inset 0 0 0 1.5px var(--cor),var(--up)}'+
 '#p-equipe .eq-cch{display:flex;align-items:flex-start;gap:10px}#p-equipe .eq-cch .tx{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eq-cch .tx b{font-size:16px}#p-equipe .eq-cch small{color:var(--muted);font-size:12.5px}'+
 '#p-equipe .eq-nb{font-size:14px;color:var(--muted);font-weight:700;white-space:nowrap}#p-equipe .eq-nb b{font-size:24px;color:var(--fg)}#p-equipe .eq-nb.manque b,#p-equipe .eq-nb.manque{color:var(--cor)}'+
 '#p-equipe .eq-gens{display:grid;gap:8px;margin-top:10px}#p-equipe .eq-g{display:flex;align-items:center;gap:10px}#p-equipe .eq-g>i{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--cc);color:#fff;font:800 13px/1 Manrope,system-ui,sans-serif;font-style:normal}'+
 '#p-equipe .eq-g>span{display:flex;flex-direction:column;min-width:0}#p-equipe .eq-g b{font-size:15px}#p-equipe .eq-g small{font-size:12.5px;color:var(--muted)}'+
 '#p-equipe .eq-man{margin:10px 0 0;font-size:13.5px;font-weight:700;color:var(--cor)}'+
 '#p-equipe .eq-ch2{margin-top:12px;min-height:40px;padding:0 16px;border-radius:99px;border:1.5px solid var(--line);background:none;box-shadow:none;color:var(--fg);font:700 14px var(--f,inherit)}#p-equipe .eq-ch2.fort{background:var(--n1-nuit,#1B2440);border-color:var(--n1-nuit,#1B2440);color:#fff}'+
 '#p-equipe .eq-hors{margin:0;padding:6px 16px}#p-equipe .eq-hl{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}#p-equipe .eq-hl:first-child{border-top:0}'+
 '#p-equipe .eq-ht{flex:none;width:120px;font-size:13px;color:var(--muted);font-weight:600}#p-equipe .eq-hl.manque .eq-ht{color:var(--cor)}#p-equipe .eq-hn{display:flex;flex-wrap:wrap;gap:6px}'+
 '#p-equipe .eq-hp{min-height:34px;padding:0 12px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 13.5px var(--f,inherit)}#p-equipe .eq-hl.manque .eq-hp{box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--cor);color:var(--cor)}'+
 '#p-equipe .eq-regl{padding:12px 16px}#p-equipe .eq-rg{display:flex;align-items:center;gap:10px;width:100%;padding:9px 0;border:0;border-top:1px solid var(--line);background:none;box-shadow:none;text-align:left;color:var(--fg);font-size:14px;border-radius:0}#p-equipe .eq-rg span:first-child{flex:1}'+
 '#p-equipe .eq-regl .sec-h+.eq-rg{border-top:0}'+
 '#p-equipe .eq-p .eq-pl{padding-left:10px;padding-right:6px}#p-equipe .eq-ph{padding:4px 0 6px}#p-equipe .eq-ph .eq-sem span{width:56px;text-align:center;font-size:11px;color:var(--muted);font-weight:600}#p-equipe .eq-ph .eq-sem span.on{color:var(--fg);font-weight:800}'+
 '#p-equipe .eq-k{width:56px;height:36px;border-radius:12px;font:700 11.5px/1 Manrope,system-ui,sans-serif;padding:0 2px;overflow:hidden;white-space:nowrap;background:var(--teinte);color:var(--fg)}'+
 '#p-equipe .eq-k.ch{background:var(--cc);color:#fff}#p-equipe .eq-k.sel{outline:2px solid var(--n1-laiton);outline-offset:1px}'+
 '@media (max-width:460px){#p-equipe .eq-k,#p-equipe .eq-ph .eq-sem span{width:44px}#p-equipe .eq-k{font-size:10.5px;height:34px;border-radius:10px}#p-equipe .eq-sem{gap:3px}#p-equipe .eq-n{min-width:0;overflow:hidden}#p-equipe .eq-n b{font-size:14px;overflow:hidden;text-overflow:ellipsis}#p-equipe .eq-n small{display:none}}';
d.head.appendChild(st);
rend();
})();
