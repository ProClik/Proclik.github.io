/* Espace ProClik : « Mes habitudes de chantier » (demande de Cyril, 18/11, maquette n°2 validée).
   Quand le client en dit peu, le pré-devis est calculé avec les habitudes de l'artisan, à modifier ensuite ligne par ligne.
   Pour chaque travail : « D'habitude » (cases à toucher), « Quand le chantier ne le permet pas » (plan B : mur abîmé,
   chevrons trop petits…), « Plus de détails » replié, et « Je ne fais pas ce travail ».
   Réservé à l'option Cliky (bandeau Cliky ; sans l'option, la ligne ouvre « Mes options »).
   Ce que le client a dit passe toujours avant l'habitude. Chaque toucher est enregistré tout de suite (service : /espace/habitudes,
   même fiche que la mise en service). Sans service (démo) : exemple rempli, gardé sur l'appareil. */
(function(){
'use strict';
var d=document,X=window.PCX;if(!X)return;
var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var toast=function(a,b){if(X.toast)X.toast(a,b)};
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))SERVICE='';
var jeton=function(){return lsG('pc-vrai-jeton',null)};
var enDirect=function(){return !!(SERVICE&&jeton())};

/* Copie des questions pour la démo (le service envoie les siennes, toujours à jour). */
var Q0=[{"id":"non_faits","c":"Travaux que je ne fais pas","p":"detail","t":"m","g":"partout","ch":[["sols","Sols (carrelage, parquet)"],["fenetres","Pose de fenêtres"],["portes","Portes intérieures"],["combles","Isolation des combles perdus"],["rampants","Combles aménagés (rampants)"],["escaliers","Trémies d'escalier"]],"d":[]},{"id":"doublage","c":"Je fais","p":"habitude","g":"murs","ch":[["appuis","Sur appuis (fourrure murale horizontale, appuis, rail contre-cloison, fourrures)"],["ossature","Sur ossature (rails et montants 48)"],["colle","Doublage collé (complexe isolant)"]],"d":"appuis"},{"id":"doublage_epaisseur","c":"Épaisseur de laine","p":"habitude","g":"murs","ch":[["100","100 mm"],["120","120 mm"],["140","140 mm"],["160","160 mm"]],"d":"120"},{"id":"doublage_planb","c":"Je fais alors","p":"planb","g":"murs","ch":[["oss48","Ossature 48 (45 kraft entre montants + laine nue derrière)"],["oss70","Ossature 70 (laine 70 entre montants + laine nue derrière)"]],"d":"oss48"},{"id":"doublage_pv","c":"Pare-vapeur","p":"detail","g":"murs","ch":[["kraft","Le kraft de la laine"],["membrane","Une membrane à part"]],"d":"kraft"},{"id":"rampants_ep1","c":"1re couche (nue, entre chevrons)","p":"habitude","g":"rampants","ch":[["chevrons","Selon les chevrons"],["100","100 mm"],["120","120 mm"],["140","140 mm"],["160","160 mm"],["200","200 mm"]],"d":"chevrons"},{"id":"rampants_ep2","c":"2e couche (kraft, croisée)","p":"habitude","g":"rampants","ch":[["auto","Pour atteindre R = 6"],["100","100 mm"],["120","120 mm"],["140","140 mm"],["160","160 mm"],["200","200 mm"]],"d":"auto"},{"id":"rampants_suspente","c":"Suspentes","p":"habitude","g":"rampants","ch":[["verifier","Je choisis à chaque fois"],["240","240 mm"],["300","300 mm"],["400","400 mm"]],"d":"verifier"},{"id":"rampants_planb","c":"Je fais alors","p":"planb","g":"rampants","ch":[["suivre","La 1re couche suit les chevrons, la 2e grossit"],["garder","Je garde mes épaisseurs (suspentes plus longues)"]],"d":"suivre"},{"id":"rampants_pv","c":"Pare-vapeur","p":"detail","g":"rampants","ch":[["kraft","Le kraft de la laine"],["membrane","Une membrane à part"]],"d":"kraft"},{"id":"cloison_ossature","c":"Ossature","p":"habitude","g":"cloisons","ch":[["48","48"],["70","70"]],"d":"48"},{"id":"cloison_laine","c":"Laine","p":"habitude","g":"cloisons","ch":[["avec","Oui (45 en ossature 48, 70 en ossature 70)"],["sans","Non"]],"d":"avec"},{"id":"plafond_type","c":"Je fais","p":"habitude","g":"plafonds","ch":[["suspendu","Suspendus (fourrures F47 + suspentes)"],["autoportant","Autoportants (ossature d'un mur à l'autre)"]],"d":"suspendu"},{"id":"plafond_laine","c":"Laine au-dessus","p":"habitude","g":"plafonds","ch":[["0","Non"],["100","100 mm"],["120","120 mm"],["140","140 mm"],["160","160 mm"],["200","200 mm"]],"d":"0"},{"id":"plafond_suspente_longue","c":"Je fais alors","p":"planb","g":"plafonds","ch":[["verifier","Je choisis à chaque fois"],["170","Suspentes 170 mm"],["240","Suspentes 240 mm"],["300","Suspentes 300 mm"],["400","Suspentes 400 mm"]],"d":"verifier"},{"id":"plafond_plaque","c":"Plaques","p":"habitude","g":"plafonds","ch":[["standard","BA13 standard"],["horizon","BA13 4 bords amincis (Horizon)"]],"d":"standard"},{"id":"plafond_plaque_long","c":"Longueur des plaques","p":"habitude","g":"plafonds","ch":[["240","240 cm"],["250","250 cm"],["260","260 cm"],["270","270 cm"],["280","280 cm"],["300","300 cm"]],"d":"250"},{"id":"plafond_entraxe","c":"Écart des fourrures","p":"habitude","g":"plafonds","ch":[["50","50 cm"],["60","60 cm"]],"d":"50"},{"id":"combles_type","c":"Je fais","p":"habitude","g":"combles","ch":[["souffle","Laine soufflée (350 mm)"],["rouleaux","Laine en rouleaux"]],"d":"souffle"},{"id":"combles_ep","c":"Épaisseur en rouleaux","p":"habitude","g":"combles","ch":[["200","200 mm"],["240","240 mm"],["300","300 mm"]],"si":{"combles_type":"rouleaux"},"d":"300"},{"id":"combles_trappe","c":"Je fais alors","p":"planb","g":"combles","ch":[["oui","Je crée une trappe isolée"],["question","Je décide sur place"]],"d":"question"},{"id":"sol_ajouts","c":"J'ajoute d'habitude","p":"habitude","t":"m","g":"sols","ch":[["depose","Dépose de l'ancien sol"],["ragreage","Ragréage"],["souscouche","Sous-couche (parquet)"],["plinthes","Plinthes"],["seuils","Barres de seuil"]],"d":["plinthes"]},{"id":"cloison_phonique","c":"Plaques","p":"habitude","g":"cloisons","ch":[["standard","1 plaque par face"],["renforcee","2 plaques par face"]],"d":"standard"},{"id":"hauteur_defaut","c":"Hauteur sous plafond, si le client ne la donne pas","p":"detail","g":"partout","ch":[["2.5","2,50 m"],["2.6","2,60 m"],["2.7","2,70 m"]],"d":"2.5"},{"id":"largeur_porte_defaut","c":"Largeur de porte, si le client ne la donne pas","p":"detail","g":"partout","ch":[["73","73 cm"],["83","83 cm"],["93","93 cm"]],"d":"83"},{"id":"finition","c":"Finition des plaques","p":"habitude","g":"partout","ch":[["pret","Prêt à peindre (bandes + enduit)"],["bandes","Bandes seules"]],"d":"pret"},{"id":"poignee","c":"Poignée standard avec chaque porte","p":"habitude","g":"partout","ch":[["oui","Oui"],["non","Non, le client la choisit"]],"d":"oui"},{"id":"protection","c":"Protection et nettoyage de fin de chantier","p":"habitude","g":"partout","ch":[["oui","Oui"],["non","Non"]],"d":"oui"}];
var O0={"doublage_epaisseur":"160","rampants_ep1":"140","rampants_ep2":"160","rampants_suspente":"300"};
var TITRES={murs:'Isolation des murs',rampants:'Rampants (sous la toiture)',cloisons:'Cloisons',plafonds:'Plafonds',combles:'Combles perdus',sols:'Pose des sols',partout:'Partout'};
/* quand le pré-devis passe au plan B tout seul */
var QUAND={murs:'mur abîmé, humide, qui ne tient pas les fixations, gros faux aplomb',rampants:'chevrons plus petits que votre 1re couche',plafonds:'plafond à descendre nettement',combles:'pas de trappe pour monter aux combles'};
/* ce qui se fait toujours, sans réglage */
var TOUJOURS={plafonds:'Suspentes tous les 1,20 m le long des fourrures.',cloisons:'Porte à galandage : ossature 70. Client qui veut moins de bruit : 2 plaques par face. Pièce d\'eau : plaque hydro de ce côté.',sols:'Fourniture chiffrée chez le fournisseur, pose chiffrée chez vous.'};
var NF={rampants:'rampants',combles:'combles',sols:'sols'}; /* « Je ne fais pas ce travail » → non_faits */
var I=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
var IC={
 murs:I('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M3 15h18M9 4v6M15 10v5M9 15v5"/>'),
 rampants:I('<path d="M2 19 12 5l10 14"/><path d="M6 19 12 10.5 18 19"/>'),
 cloisons:I('<path d="M5 3v18M19 3v18M5 7h14M5 17h14"/>'),
 plafonds:I('<path d="M3 6h18"/><path d="M7 6v5M12 6v5M17 6v5"/><path d="M3 11h18"/>'),
 combles:I('<path d="M2 14 12 5l10 9"/><path d="M5 14h14"/><path d="M7 14c1-2 2-2 3 0s2 2 3 0 2-2 3 0"/>'),
 sols:I('<path d="M3 9h18v10H3z"/><path d="M9 9v10M15 9v10M3 14h18"/>'),
 partout:I('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
 tete:I('<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5"/>')
};

/* résumé lisible sous le titre (au lieu de « Oui · Non ») */
var SUM={
 cloison_ossature:function(v){return 'ossature '+v},
 cloison_laine:function(v){return v==='sans'?'sans laine':'avec laine'},
 plafond_laine:function(v){return v==='0'?'sans laine au-dessus':'laine '+v+' mm au-dessus'},
 combles_ep:function(v){return v+' mm'},
 sol_ajouts:function(v){return v.length?'pose + '+v.map(function(c){return {depose:'dépose',ragreage:'ragréage',souscouche:'sous-couche',plinthes:'plinthes',seuils:'barres de seuil'}[c]||c}).join(', '):'pose seule'},
 poignee:function(v){return v==='non'?'sans poignée':'poignée fournie'},
 protection:function(v){return v==='non'?'sans protection':'protection et nettoyage'}
};
var G=null,V={},ORI={};
function depuisDemo(){
  var g={};Q0.forEach(function(q){(g[q.g]=g[q.g]||[]).push({id:q.id,court:q.c,partie:q.p,type:q.t==='m'?'multi':'choix',choix:q.ch,si:q.si,defaut:q.d})});
  G=Object.keys(TITRES).filter(function(k){return g[k]}).map(function(k){return {id:k,titre:TITRES[k],questions:g[k]}});
  ORI=O0;V=lsG('pc-habitudes-demo',null)||JSON.parse(JSON.stringify(O0));
}
function appel(corps){
  return fetch(SERVICE+'/espace/habitudes',{method:corps?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+jeton()},body:corps?JSON.stringify(corps):undefined,cache:'no-store'})
   .then(function(r){return r.json().catch(function(){return {}}).then(function(x){if(!r.ok||!x.ok)throw new Error(x.erreur||('Service '+r.status));G=x.groupes;V=x.valeurs||{};ORI=x.origine||{};return x})});
}
/* valeur affichée : celle de l'artisan, sinon le réglage de départ du calcul (defaut) */
function val(q){var v=V[q.id];if(v==null||v==='')v=q.defaut;if(q.type==='multi')return Array.isArray(v)?v:String(v||'').split(/[,;]\s*/).filter(Boolean);return v==null||v===''?(q.choix[0]||[])[0]:String(v)}
function lib(q,c){var x=q.choix.filter(function(y){return y[0]===c})[0];return x?x[1]:c}
function visible(q){if(!q.si)return true;return Object.keys(q.si).every(function(k){var qq=tout().filter(function(y){return y.id===k})[0];return qq&&val(qq)===q.si[k]})}
function tout(){var L=[];(G||[]).forEach(function(g){L=L.concat(g.questions)});return L}
function nonFaits(){var q=tout().filter(function(y){return y.id==='non_faits'})[0];return q?val(q):[]}
function resume(g){
  if(NF[g.id]&&nonFaits().indexOf(NF[g.id])>=0)return 'Je ne fais pas ce travail';
  var court=function(t){return String(t).split(' (')[0]};
  var Q=function(id){return g.questions.filter(function(q){return q.id===id})[0]};
  if(g.id==='rampants'&&Q('rampants_ep1')&&Q('rampants_ep2')){
    var a=val(Q('rampants_ep1')),b=val(Q('rampants_ep2')),s=Q('rampants_suspente')?val(Q('rampants_suspente')):'';
    return (a==='chevrons'?'1re couche selon les chevrons':a+' nue')+' + '+(b==='auto'?'kraft pour R = 6':b+' kraft')+(a!=='chevrons'&&b!=='auto'?' ('+(+a + +b)+' mm)':'')+(/^\d+$/.test(s)?' · suspentes '+s+' mm':'');
  }
  return g.questions.filter(function(q){return q.partie==='habitude'&&visible(q)}).map(function(q){var v=val(q);
    if(SUM[q.id])return SUM[q.id](v);
    return q.type==='multi'?(v.length?v.map(function(c){return court(lib(q,c))}).join(', '):'rien en plus'):court(lib(q,v))}).join(' · ');
}
function puces(q){
  var v=val(q),m=q.type==='multi';
  return '<div class="hb-ch" role="group" aria-label="'+esc(q.court)+'">'+q.choix.map(function(c){
    var on=m?v.indexOf(c[0])>=0:v===c[0];
    var t=String(c[1]),p=t.match(/^([^(]+)\(([^)]+)\)\s*$/);
    return '<button type="button" class="hb-c" data-q="'+esc(q.id)+'" data-v="'+esc(c[0])+'" aria-pressed="'+on+'">'+(p?esc(p[1].trim())+'<small>'+esc(p[2])+'</small>':esc(t))+'</button>'}).join('')+'</div>';
}
function bloc(q){return '<div class="hb-q"><h4>'+esc(q.court)+'</h4>'+puces(q)+'</div>'}
/* maquette n°4 validée (Cyril, 18/11 20h43) : un onglet par métier, une carte par travail qui se lit d'un coup d'œil
   (libellé → valeur en gras, ligne Plan B orange) ; « Changer » ouvre les choix dans la carte, « C'est bon » la referme.
   Le sol est un métier à part (décision Cyril 18/11 20h40). */
var METIERS=[['plaq','Plaquiste',['murs','rampants','cloisons','plafonds','combles'],'murs'],['sol','Sols',['sols'],'sols'],['tout','Partout',['partout'],'partout']];
var onglet='plaq',edit='';
var court=function(t){return String(t).split(' (')[0]};
function valeur(q){var v=val(q);if(SUM[q.id])return SUM[q.id](v);
  return q.type==='multi'?(v.length?v.map(function(c){return court(lib(q,c))}).join(', '):'Aucun'):court(lib(q,v))}
function fiche(g){
  var hab=g.questions.filter(function(q){return q.partie==='habitude'&&q.id!=='non_faits'&&visible(q)}),
      pb=g.questions.filter(function(q){return q.partie==='planb'&&visible(q)}),
      det=g.questions.filter(function(q){return q.partie==='detail'&&q.id!=='non_faits'&&visible(q)}),
      off=NF[g.id]&&nonFaits().indexOf(NF[g.id])>=0,e=edit===g.id;
  var tete='<div class="hb-ft"><span class="hb-i">'+(IC[g.id]||IC.partout)+'</span><h3>'+esc(g.titre)+'</h3>'+
    (e?'':'<button type="button" class="hb-mod" data-e="'+g.id+'">Changer</button>')+'</div>';
  if(!e){
    if(off)return '<section class="hb-f off" data-g="'+g.id+'">'+tete+'<p class="hb-off">Je ne fais pas ce travail</p></section>';
    var rows=hab.map(function(q){return '<dt>'+esc(court(q.court))+'</dt><dd>'+esc(valeur(q))+'</dd>'}).join('');
    var planb=pb.length?'<p class="hb-pbl"><b>Plan B</b><span>'+esc(pb.map(valeur).join(', '))+(QUAND[g.id]?'<i> · si '+esc(QUAND[g.id])+'</i>':'')+'</span></p>':'';
    var tj=TOUJOURS[g.id]?'<p class="hb-tjl"><b>Toujours</b><span>'+esc(TOUJOURS[g.id])+'</span></p>':'';
    return '<section class="hb-f" data-g="'+g.id+'">'+tete+(rows?'<dl class="hb-rows">'+rows+'</dl>':'')+planb+tj+(g.id==='partout'?nfResume():'')+'</section>';
  }
  return '<section class="hb-f on" data-g="'+g.id+'">'+tete+'<div class="hb-b">'+(off?'':hab.map(bloc).join('')+
      (TOUJOURS[g.id]?'<p class="hb-tj"><b>Toujours :</b> '+esc(TOUJOURS[g.id])+'</p>':'')+
      (pb.length?'<div class="hb-pb"><h4>Plan B · quand le chantier ne le permet pas</h4>'+(QUAND[g.id]?'<p>Par exemple : <b>'+esc(QUAND[g.id])+'</b>. Le pré-devis passe tout seul à ce choix.</p>':'')+pb.map(function(q){return puces(q)}).join('')+'</div>':'')+
      (det.length?'<details class="hb-d"><summary>Plus de détails</summary>'+det.map(bloc).join('')+'</details>':''))+
      (NF[g.id]?'<button type="button" class="hb-nf" data-nf="'+NF[g.id]+'">'+(off?'Je fais ce travail':'Je ne fais pas ce travail')+'</button>':'')+
      (g.id==='partout'?nfPartout():'')+
      '<button type="button" class="btn hb-ok" data-e="">C\'est bon</button></div></section>';
}
function nfResume(){var q=tout().filter(function(y){return y.id==='non_faits'})[0];if(!q)return '';
  var v=val(q).filter(function(c){return !/^(rampants|combles|sols)$/.test(c)});
  return v.length?'<dl class="hb-rows"><dt>Je ne fais pas</dt><dd>'+esc(v.map(function(c){return court(lib(q,c))}).join(', '))+'</dd></dl>':''}
function rendu(){
  var ids=(G||[]).map(function(g){return g.id});
  var mets=METIERS.filter(function(m){return m[2].some(function(k){return ids.indexOf(k)>=0})});
  if(!mets.some(function(m){return m[0]===onglet}))onglet=(mets[0]||[''])[0];
  var m=mets.filter(function(x){return x[0]===onglet})[0]||['','',[]];
  return '<p class="hb-intro">Le client en dit peu ? Votre pré-devis est calculé <b>comme vous faites d\'habitude</b>. Touchez « Changer » pour modifier.</p>'+
   (enDirect()?'':'<p class="hb-demo">Exemple : en démo, vos choix restent sur cet appareil.</p>')+
   '<div class="hb-tabs" role="tablist" aria-label="Mes métiers">'+mets.map(function(x){return '<button type="button" class="hb-tab" role="tab" data-t="'+x[0]+'" aria-selected="'+(x[0]===onglet)+'">'+(IC[x[3]]||'')+esc(x[1])+'</button>'}).join('')+'</div>'+
   '<div class="hb-l">'+(G||[]).filter(function(g){return m[2].indexOf(g.id)>=0}).map(fiche).join('')+'</div>'+
   '<p class="hb-tjl hb-cf"><b>Le client d\'abord.</b><span>Ce qu\'il a dit passe avant l\'habitude. Le plan B se met tout seul si le chantier ne permet pas l\'habitude.</span></p>';
}
/* les autres travaux qu'on peut ne pas faire (fenêtres, portes, escaliers) : dans « Partout » */
function nfPartout(){
  var q=tout().filter(function(y){return y.id==='non_faits'})[0];if(!q)return '';
  var reste={choix:q.choix.filter(function(c){return !/^(rampants|combles|sols)$/.test(c[0])}),id:q.id,court:'Travaux que je ne fais pas',type:'multi'};
  return '<div class="hb-q"><h4>Travaux que je ne fais pas</h4>'+puces(reste)+'</div>';
}
function peindre(){var c=$('#hb-x');if(!c)return;var y=($('#x-in')||{}).scrollTop;c.innerHTML=rendu();lier(c);var xi=$('#x-in');if(xi&&y!=null)xi.scrollTop=y}
var file=Promise.resolve();
function enregistre(ch){
  Object.keys(ch).forEach(function(k){V[k]=ch[k]});peindre();
  if(!enDirect()){lsS('pc-habitudes-demo',V);toast('Habitude enregistrée','En démo : gardée sur cet appareil.');return}
  file=file.then(function(){return appel({valeurs:ch})}).then(function(){peindre();toast('Habitude enregistrée','Les prochains pré-devis la prennent.')}).catch(function(e){toast('Pas enregistré',String(e.message||e));return appel().then(peindre).catch(function(){})});
}
function lier(c){
  $$('.hb-tab',c).forEach(function(b){b.addEventListener('click',function(){onglet=b.dataset.t;edit='';peindre()})});
  $$('[data-e]',c).forEach(function(b){b.addEventListener('click',function(){var g=b.dataset.e||b.closest('.hb-f').dataset.g;edit=b.dataset.e;peindre();
    var f=$('.hb-f[data-g="'+g+'"]',c);if(f&&f.scrollIntoView)f.scrollIntoView({block:'nearest',behavior:'smooth'})})});
  $$('.hb-c',c).forEach(function(b){b.addEventListener('click',function(){
    var q=tout().filter(function(y){return y.id===b.dataset.q})[0];if(!q)return;var o={};
    if(q.type==='multi'){var v=val(q).slice(),i=v.indexOf(b.dataset.v);if(i>=0)v.splice(i,1);else v.push(b.dataset.v);o[q.id]=v}
    else{if(val(q)===b.dataset.v)return;o[q.id]=b.dataset.v}
    enregistre(o);
  })});
  $$('.hb-nf',c).forEach(function(b){b.addEventListener('click',function(){var v=nonFaits().slice(),k=b.dataset.nf,i=v.indexOf(k);if(i>=0)v.splice(i,1);else v.push(k);enregistre({non_faits:v})})});
}
function ouvrir(){
  X.xopen('Mes habitudes de chantier','Votre façon de faire, pour des pré-devis déjà presque finis','<div id="hb-x"><p class="hint">Chargement…</p></div>','<button class="btn" data-xclose>Fermer</button>');
  var go=enDirect()?appel().catch(function(e){toast('Habitudes en démo',String(e.message||e));depuisDemo()}):Promise.resolve(depuisDemo());
  go.then(peindre);
}
window.PCHabitudes={ouvrir:ouvrir};

/* ---------- la ligne dans les Réglages, juste après « Mes options » ---------- */
var menu=$('#menu');
function poser(){
  if(($('#x-t')||{}).textContent!=='Votre espace'||$('#hb-ligne'))return;
  var c=$('#x-in .card.menu');if(!c)return;
  var b=d.createElement('button');b.type='button';b.id='hb-ligne';
  b.innerHTML='<span class="av hb-av">'+IC.tete+'</span><span class="tx"><b>Mes habitudes de chantier</b><small>160 mm aux murs, rampants croisés… le pré-devis fait comme vous</small></span><span class="go">›</span>';
  /* réservé à l'option Cliky (décision de Cyril, 18/11) : sans elle, le pré-devis n'est pas automatique, la ligne mène à « Mes options » */
  var cl=window.PCOPT?PCOPT.actif('cliky'):true;
  if(window.PCTAG)b.querySelector('.tx').insertAdjacentHTML('afterbegin',PCTAG('cliky'));
  if(!cl)b.querySelector('.tx small').textContent='Avec l\'option Cliky : le pré-devis se calcule comme vous faites';
  b.addEventListener('click',function(){X.xclose();setTimeout(cl||!window.PCMesOptions?ouvrir:PCMesOptions.ouvrir,0)});
  var mo=$('#mo-opt',c);c.insertBefore(b,mo?mo.nextSibling:c.firstChild);
}
if(menu)menu.addEventListener('click',function(){setTimeout(poser,10)});
if(/[#&]habitudes\b/.test(location.hash))setTimeout(ouvrir,600);

var st=d.createElement('style');
st.textContent=
 '#hb-ligne .hb-av{color:var(--accx,#A8823F)}#hb-ligne .hb-av svg{width:20px;height:20px}'+
 '.hb-intro{margin:0 2px 4px;line-height:1.45}.hb-demo{margin:0 2px 8px;font-size:12.5px;color:var(--muted)}'+
 '.hb-l{display:flex;flex-direction:column;gap:10px}'+
 '.hb-g{background:var(--card);border-radius:16px;box-shadow:var(--shadow);overflow:hidden}'+
 '.hb-h{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;text-align:left;background:none;border:0;color:inherit;font:inherit;cursor:pointer}'+
 '.hb-h .tx{flex:1;min-width:0}.hb-h b{display:block;font-size:15px}.hb-h small{display:block;color:var(--muted);font-size:12.5px;margin-top:2px;line-height:1.35}'+
 '.hb-h .go{color:var(--muted);transition:transform .15s}.hb-g.on .hb-h .go{transform:rotate(90deg)}'+
 '.hb-i{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--soft);color:var(--fg)}.hb-i svg{width:22px;height:22px}'+
 '.hb-g.off .hb-h small{text-decoration:line-through}'+
 '.hb-b{display:none;flex-direction:column;gap:14px;padding:2px 14px 14px}.hb-g.on .hb-b{display:flex}'+
 '.hb-q{display:flex;flex-direction:column;gap:8px}.hb-q h4,.hb-pb h4{margin:0;font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}'+
 '.hb-ch{display:flex;flex-wrap:wrap;gap:8px}'+
 '.hb-c{min-height:44px;padding:8px 13px;border-radius:13px;background:var(--card);color:var(--fg);font:inherit;font-weight:700;font-size:14px;text-align:left;cursor:pointer;border:0;box-shadow:0 0 0 1px var(--line),0 2px 4px rgba(14,19,34,.08)}'+
 '.hb-c small{display:block;font-weight:600;font-size:12px;color:var(--muted);margin-top:1px}'+
 '.hb-c[aria-pressed=true]{background:var(--nuit,#1B2440);color:#fff;box-shadow:none;position:relative;padding-left:36px}'+
 '.hb-c[aria-pressed=true]::before{content:"";position:absolute;left:11px;top:50%;width:17px;height:17px;margin-top:-8.5px;border-radius:50%;background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6 12.5l4 4 8-9%27 fill=%27none%27 stroke=%27%231B2440%27 stroke-width=%273.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") center/13px no-repeat}'+
 ':root[data-theme=dark] .hb-c[aria-pressed=true]::before{background-color:#1B2440;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6 12.5l4 4 8-9%27 fill=%27none%27 stroke=%27%23fff%27 stroke-width=%273.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")}'+
 ':root[data-theme=dark] .hb-c:not([aria-pressed=true]){background:transparent;box-shadow:0 0 0 1.5px rgba(232,234,242,.28)}'+
 '.hb-c:not([aria-pressed=true]){background:transparent}.hb-c[aria-pressed=true] small{color:inherit;opacity:.8}'+
 ':root[data-theme=dark] .hb-c[aria-pressed=true]{background:#E8EAF2;color:#0E1322}'+
 '.hb-c:focus-visible,.hb-h:focus-visible,.hb-nf:focus-visible{outline:2px solid var(--accx,#A8823F);outline-offset:2px}'+
 '.hb-pb{background:var(--warn-bg);border-radius:13px;padding:11px 12px;display:flex;flex-direction:column;gap:8px}.hb-pb h4{color:var(--warn)}.hb-pb p{margin:0;font-size:13px;line-height:1.4}'+
 '.hb-tj{margin:0;font-size:13px;color:var(--muted);line-height:1.4}'+
 '.hb-d summary{cursor:pointer;font-weight:700;font-size:13.5px;color:var(--muted);padding:2px 0}.hb-d[open] summary{margin-bottom:10px}.hb-d .hb-q+.hb-q{margin-top:12px}'+
 '.hb-tabs{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 10px;margin:4px -2px 2px;scrollbar-width:none}.hb-tabs::-webkit-scrollbar{display:none}'+
 '.hb-tab{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:8px 15px;border-radius:999px;border:0;font:inherit;font-weight:800;font-size:14px;cursor:pointer;background:var(--card);color:var(--fg);box-shadow:0 0 0 1px var(--line),0 2px 4px rgba(14,19,34,.08)}'+
 '.hb-tab svg{width:18px;height:18px}.hb-tab[aria-selected=true]{background:var(--nuit,#1B2440);color:#fff;box-shadow:none}'+
 ':root[data-theme=dark] .hb-tab[aria-selected=true]{background:#E8EAF2;color:#0E1322}'+
 '.hb-f{background:var(--card);border-radius:16px;box-shadow:var(--shadow);padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px}'+
 '.hb-ft{display:flex;align-items:center;gap:12px}.hb-ft h3{flex:1;margin:0;font-size:16px;font-weight:800;line-height:1.25}'+
 '.hb-mod{flex:none;min-height:40px;padding:6px 14px;border-radius:12px;border:0;font:inherit;font-weight:800;font-size:14px;cursor:pointer;background:var(--card);color:var(--fg);box-shadow:0 0 0 1px var(--line),0 2px 4px rgba(14,19,34,.1)}'+
 '.hb-rows{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:7px 12px;margin:0}'+
 '.hb-rows dt{color:var(--muted);font-size:13.5px;line-height:1.35}.hb-rows dd{margin:0;font-weight:800;font-size:15px;line-height:1.3}'+
 '.hb-pbl,.hb-tjl{display:flex;gap:10px;margin:0;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.4}'+
 '.hb-pbl{background:var(--warn-bg)}.hb-pbl b{color:var(--warn);flex:none}.hb-pbl i{font-style:normal;color:var(--muted)}'+
 '.hb-tjl{background:var(--soft)}.hb-tjl b{flex:none}.hb-tjl span{color:var(--muted)}.hb-cf{margin-top:12px}'+
 '.hb-off{margin:0;color:var(--muted);font-weight:700}.hb-f.off .hb-i{opacity:.5}'+
 '.hb-f .hb-b{display:flex;padding:0}.hb-ok{align-self:stretch;margin-top:4px}'+
 '.hb-mod:focus-visible,.hb-tab:focus-visible{outline:2px solid var(--accx,#A8823F);outline-offset:2px}'+
 '@media(min-width:700px){.hb-rows{grid-template-columns:200px 1fr}}'+
 '.hb-nf{align-self:flex-start;background:none;border:0;padding:4px 0;font:inherit;font-size:13px;font-weight:700;color:var(--muted);text-decoration:underline;cursor:pointer}';
d.head.appendChild(st);
})();
