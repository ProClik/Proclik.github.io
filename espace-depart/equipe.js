/* Module « Équipe » de l'Espace ProClik (Cyril, 15/11 : « garder le même style que le planning de BRS, mais ajouter une partie
   comme celle de RT2O »). Une vue de plus dans le Planning : qui est sur quel chantier chaque jour, combien de personnes,
   s'il en manque, et la semaine de chaque personne. Même dessin que le reste du Planning de BRS (cartes, segments, feuille du bas).
   Module activable par entreprise (Mes options › Équipe). Personnes et affectations d'exemple tant que l'équipe n'est pas branchée. */
(function(){
'use strict';
var d=document,X=window.PCX,O=window.PCOPT;if(!X||!$('#v-planning'))return;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
var esc=X.esc||function(s){return String(s)};
if(O&&O.actif('equipe')===false)return;

/* ---------- données d'exemple ---------- */
var JOURS=['Lun.','Mar.','Mer.','Jeu.','Ven.'],LUNDI=new Date(2026,9,12);
var EQ=[{n:'Thomas',r:'Chef'},{n:'Kevin',r:'Plaquiste'},{n:'Mathieu',r:'Plaquiste'},{n:'Lucas',r:'Apprenti'}];
var COUL=['var(--k-run)','var(--k-visit)','var(--k-liv)','var(--k-autre)','var(--k-devis)','var(--k-plan)'];
function chantiers(){var C=X.CH||{};return Object.keys(C).map(function(k){return C[k]}).filter(function(c){return c&&c.st!=='done'})}
function couleur(id){var L=chantiers().map(function(c){return c.id});var i=L.indexOf(id);return COUL[(i<0?0:i)%COUL.length]}
function lettre(c){return (c.n||'?').replace(/^(M\.|Mme|Cabinet|SCI)\s+/,'').charAt(0).toUpperCase()}
var K='pc-eq1';
function lit(){try{return JSON.parse(localStorage.getItem(K)||'null')}catch(e){return null}}
function ecrit(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
var S=lit();
if(!S||!S.pl){var L=chantiers().map(function(c){return c.id}),a=L[0],b=L[1]||L[0];
  S={pl:{},bes:{},envoye:false};
  S.pl['Thomas']=[a,a,b,b,'bureau'];S.pl['Kevin']=[a,a,a,b,b];S.pl['Mathieu']=[b,b,a,a,a];S.pl['Lucas']=[a,a,'',b,b];
  L.forEach(function(id){S.bes[id]=[2,2,2,2,2]})}
EQ.forEach(function(p){if(!S.pl[p.n])S.pl[p.n]=['','','','','']});
function qui(id,j){return EQ.filter(function(p){return S.pl[p.n][j]===id})}
function besoin(id,j){return (S.bes[id]||[2,2,2,2,2])[j]}
function date(j){var x=new Date(LUNDI);x.setDate(x.getDate()+j);return x.getDate()}
function nomCase(v){if(!v)return 'Rien de prévu';if(v==='bureau')return 'Au bureau';if(v==='repos')return 'Repos ou congé';var c=(X.CH||{})[v];return c?c.n:v}

/* ---------- la vue ---------- */
var seg=$('#v-planning .seg'),pv=d.createElement('div');pv.id='p-equipe';pv.className='pv';pv.hidden=true;pv.style.marginTop='12px';
$('#v-planning').appendChild(pv);
var bt=d.createElement('button');bt.setAttribute('role','tab');bt.id='seg-equipe';bt.dataset.seg='equipe';bt.setAttribute('aria-selected','false');bt.textContent='Équipe';
if(seg)seg.appendChild(bt);
bt.addEventListener('click',function(){$$('button',seg).forEach(function(x){x.setAttribute('aria-selected',String(x===bt))});$$('#v-planning .pv').forEach(function(p){p.hidden=p!==pv});rend()});

function manques(){var A=[];chantiers().forEach(function(c){var j=[];for(var i=0;i<5;i++)if(qui(c.id,i).length<besoin(c.id,i))j.push(JOURS[i].replace('.',''));if(j.length)A.push(c.n+' : il manque du monde '+j.join(', '))});
  EQ.forEach(function(p){var v=S.pl[p.n].map(function(x,i){return x?'':JOURS[i].replace('.','')}).filter(Boolean);if(v.length)A.push(p.n+' : rien de prévu '+v.join(', '))});return A}
function rend(){
  var CHs=chantiers(),A=manques(),h='';
  h+=(window.PCTAG?window.PCTAG('equipe'):'');
  h+='<div class="cal-top"><h3>Semaine du '+date(0)+' au '+date(4)+' octobre</h3><span class="pill eq-ex">Exemple</span></div>';
  if(A.length)h+='<div class="card eq-regl"><div class="sec-h" style="margin-bottom:6px"><h2>À régler</h2><span>'+A.length+'</span></div>'+A.slice(0,4).map(function(a){return '<p>'+esc(a)+'</p>'}).join('')+'</div>';
  h+='<div class="sec-h"><h2>Par chantier</h2><span>personnes par jour</span></div>';
  h+='<div class="eq-ch">'+CHs.map(function(c){
    return '<div class="card eq-c" style="--cc:'+couleur(c.id)+'"><div class="eq-h"><span class="eq-l">'+lettre(c)+'</span><span class="tx"><b>'+esc(c.n)+'</b><small>'+esc(c.v||'')+'</small></span></div>'+
      '<div class="eq-j">'+JOURS.map(function(J,i){var Q=qui(c.id,i),b=besoin(c.id,i),m=b-Q.length;
        return '<button type="button" class="eq-d'+(m>0?' manque':'')+'" data-eqc="'+c.id+'" data-j="'+i+'"><small>'+J+' '+date(i)+'</small><b>'+Q.length+'</b><span class="eq-av">'+Q.map(function(p){return '<i>'+p.n.charAt(0)+'</i>'}).join('')+'</span>'+(m>0?'<em>il manque '+m+'</em>':'')+'</button>'}).join('')+'</div></div>'}).join('')+'</div>';
  h+='<div class="sec-h"><h2>Par personne</h2><span>touchez pour changer</span></div><div class="card eq-p">'+EQ.map(function(p){
    return '<div class="eq-pl"><span class="eq-n"><b>'+p.n+'</b><small>'+p.r+'</small></span><span class="eq-sem">'+S.pl[p.n].map(function(v,i){var c=(X.CH||{})[v];
      return '<button type="button" class="eq-k'+(v?'':' vide')+'" data-eqp="'+p.n+'" data-j="'+i+'" style="'+(c?'--cc:'+couleur(v):'')+'" aria-label="'+J(i)+' : '+esc(nomCase(v))+'">'+(c?lettre(c):v==='bureau'?'B':v==='repos'?'–':'+')+'</button>'}).join('')+'</span></div>'}).join('')+
    '<div class="eq-leg">'+CHs.map(function(c){return '<span><i style="background:'+couleur(c.id)+'">'+lettre(c)+'</i>'+esc(c.n)+'</span>'}).join('')+'<span><i class="b">B</i>Bureau</span></div></div>';
  h+='<button type="button" class="btn go eq-env" id="eq-env"><span class="lab"><span>'+(S.envoye?'Renvoyer le planning à l\'équipe':'Envoyer le planning à l\'équipe')+'</span></span></button>';
  if(S.envoye)h+='<p class="hint" style="text-align:center">Envoyé : chacun voit sa semaine dans son Espace.</p>';
  pv.innerHTML=h}
function J(i){return JOURS[i]+' '+date(i)}

/* ---------- toucher un jour d'un chantier : qui vient ---------- */
function caseCh(id,j){var c=(X.CH||{})[id];
  function corps(){return '<p class="hint" style="margin:0 0 10px">Touchez une personne pour la mettre sur ce chantier, ou l\'enlever.</p><div class="eq-choix">'+EQ.map(function(p){var v=S.pl[p.n][j],ici=v===id;
    return '<button type="button" class="eq-o'+(ici?' on':'')+'" data-pp="'+p.n+'"><span class="eq-av"><i>'+p.n.charAt(0)+'</i></span><span class="tx"><b>'+p.n+'</b><small>'+(ici?'Sur ce chantier':esc(nomCase(v)))+'</small></span><span class="eq-ck">'+(ici?'✓':'+')+'</span></button>'}).join('')+'</div>'}
  X.xopen(c.n,J(j)+' · '+qui(id,j).length+' sur '+besoin(id,j)+' prévus',corps(),'<button class="btn go" id="eq-ok" style="width:100%">C\'est bon</button>',lie);
  function lie(){$$('#x-in [data-pp]').forEach(function(b){b.onclick=function(){var p=b.dataset.pp;S.pl[p][j]=S.pl[p][j]===id?'':id;ecrit();$('#x-in').innerHTML=corps();$('#x-s').textContent=J(j)+' · '+qui(id,j).length+' sur '+besoin(id,j)+' prévus';lie();rend()}});
    var ok=$('#eq-ok');if(ok)ok.onclick=function(){X.xclose()}}}
/* ---------- toucher le jour d'une personne : où elle va ---------- */
function caseP(p,j){var CHs=chantiers(),L=CHs.map(function(c){return [c.id,c.n]}).concat([['bureau','Au bureau'],['repos','Repos ou congé'],['','Rien de prévu']]);
  X.xopen(p,J(j),'<div class="eq-choix">'+L.map(function(o){var on=S.pl[p][j]===o[0];return '<button type="button" class="eq-o'+(on?' on':'')+'" data-v="'+o[0]+'"><span class="tx"><b>'+esc(o[1])+'</b></span><span class="eq-ck">'+(on?'✓':'')+'</span></button>'}).join('')+'</div>','',function(){
    $$('#x-in [data-v]').forEach(function(b){b.onclick=function(){S.pl[p][j]=b.dataset.v;ecrit();X.xclose();rend();X.toast(p+' : '+nomCase(b.dataset.v),J(j))}})})}

pv.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.eqc)return caseCh(b.dataset.eqc,+b.dataset.j);
  if(b.dataset.eqp)return caseP(b.dataset.eqp,+b.dataset.j);
  if(b.id==='eq-env'){S.envoye=true;ecrit();rend();X.toast('Planning envoyé à l\'équipe','Chacun voit sa semaine sur son téléphone (exemple).')}});

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
 '.eq-choix .eq-av i{width:30px;height:30px;font-size:13px}';
d.head.appendChild(st);
rend();
})();
