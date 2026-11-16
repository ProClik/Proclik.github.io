/* Admin ProClik : fiche Cliky de chaque client + base Cliky commune (socle et métiers).
   Ce qui n'est pas changé ici vient de la base ProClik. Rien n'est inventé : un réglage vide reste « à vérifier ». */
(function(){'use strict';
var A=window.PCADM;if(!A)return;
var api=A.api,esc=A.esc,toast=A.toast,$=function(s,r){return (r||document).querySelector(s)};
var REG=[['marge_pct','Marge sur matériaux','%'],['fg_pct','Frais généraux','%'],['taux_horaire','Taux horaire','€/h'],['taux_m2','Main-d\'œuvre au m²','€/m²'],['zone_km','Zone sans frais de déplacement','km'],['deplacement','Forfait déplacement au-delà','€'],['tva','TVA travaux','%']];
var CH={regles:'Règles du métier',ouvrages:'Ouvrages calculés par le programme',prix:'Prix moyens (main-d\'œuvre, dépose…)',reperes:'Repères de contrôle (prix posés habituels)'};
function nb(v){return v==null?'':String(v).replace('.',',')}
function deux(b,t){if(b.dataset.ok){delete b.dataset.ok;return true}var o=b.textContent;b.dataset.ok=1;b.textContent=t;setTimeout(function(){if(b.dataset.ok){delete b.dataset.ok;b.textContent=o}},3500);return false}
var CSS='<style>.ck-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:0 12px}.ck-pre{white-space:pre-wrap;font-family:var(--mono);font-size:12px;max-height:340px;overflow:auto;margin:8px 0 0;padding:10px;border-radius:12px;background:var(--bg);box-shadow:var(--n1-in)}'+
 '.ck-ta{font-family:var(--mono)!important;font-size:13px!important;min-height:120px!important}details.ck{border-top:1px solid var(--li);padding:10px 0}details.ck summary{cursor:pointer;font-weight:700;min-height:32px}.ck-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}</style>';

/* ---------- fiche Cliky d'un client ---------- */
function fiche(id){var Z=$('#fcliky');if(!Z||!id)return;Z.innerHTML='<h2>Cliky</h2><p class="mu" style="margin:0">Chargement…</p>';
 api('/admin/cliky?id='+encodeURIComponent(id)).then(function(j){rendre(Z,j)},function(e){Z.innerHTML='<h2>Cliky</h2><p class="err">'+esc(e.message)+'</p>'})}
function rendre(Z,j){var e=j.espace,r=e.reglages||{},k=j.controle||{};
 var FA='<div><label class="f" for="ckfa">Frais généraux appliqués sur</label><select class="t" id="ckfa">'+[['tout','Tout'],['matériaux','Matériaux'],['main-d\'œuvre','Main-d\'œuvre'],['','À vérifier']].map(function(o){return '<option value="'+esc(o[0])+'"'+((r.fg_assiette||'')===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>';
 var h=CSS+'<h2>Cliky</h2><p class="mu" style="margin:0">Ce que Cliky sait pour ce client. Tout ce qui n\'est pas changé ici vient de la base ProClik (onglet Réglages › Base Cliky).</p>'+
 '<div class="res" style="margin-top:10px"><b>Questionnaire de mise en service</b><div class="mu">'+nbRep(e)+'</div><button class="btn go" type="button" id="ckq" style="width:100%;margin-top:8px">'+(Object.keys(e.reponses||{}).length?'Reprendre le questionnaire':'Commencer le questionnaire')+'</button></div>'+
 '<label class="f" for="ckm">Métier</label><select class="t" id="ckm">'+j.metiers.map(function(m){return '<option value="'+esc(m.nom)+'"'+(m.nom===e.metier?' selected':'')+'>'+esc(m.libelle)+'</option>'}).join('')+'</select>'+
 '<label class="f">Base de prix</label><div class="res" style="margin-top:4px"><b>'+esc(e.fournisseur_nom||'Pas encore de base de prix')+'</b><div class="mu">'+(k.articles?k.articles+' articles lus'+(k.erreurs&&k.erreurs.length?' · '+k.erreurs.length+' problème(s)':' · aucun problème'):'Aucun article : Cliky met tout « à vérifier », sans inventer de prix.')+'</div>'+
  '<div class="ck-row"><button class="btn sm" type="button" id="ckcol">Coller une autre base</button>'+(e.fournisseur_colle?'<button class="btn sm" type="button" id="ckorig">Revenir à la base d\'origine</button>':'')+'</div>'+
  '<div id="ckz" hidden><label class="f" for="ckfn">Nom de cette base</label><input class="t" id="ckfn" placeholder="Ex. Tarif Point P 2027"><label class="f" for="ckft">Articles (une ligne par article : - [PLQ-01] Désignation | conditionnement | prix | prix par unité)</label><textarea class="t ck-ta" id="ckft" rows="8"></textarea></div></div>'+
 '<label class="f">Réglages</label><div class="ck-g">'+REG.map(function(x,i){return '<div><label class="f" for="ckr-'+x[0]+'">'+x[1]+' ('+x[2]+')</label><input class="t" id="ckr-'+x[0]+'" inputmode="decimal" value="'+esc(nb(r[x[0]]))+'" placeholder="à vérifier"></div>'+(i===1?FA:'')}).join('')+'</div>'+
 '<label class="sw" style="margin-top:10px">Réglages confirmés avec le client<input type="checkbox" id="ckok"'+(r.confirmes?' checked':'')+'></label>'+
 '<label class="f" for="ckh">Ses règles à lui (une par ligne, elles passent avant celles du métier)</label><textarea class="t" id="ckh" rows="4" placeholder="Ex. Toujours 2 plaques par face dans les chambres">'+esc((e.habitudes||[]).join('\n'))+'</textarea>'+
 '<label class="f" for="ckn">Ce qu\'il ne fait pas (une par ligne)</label><textarea class="t" id="ckn" rows="3" placeholder="Ex. Carrelage mural">'+esc((e.non_faits||[]).join('\n'))+'</textarea>'+
 '<div class="err" id="ckerr"></div><button class="btn go" type="button" id="cksave" style="width:100%">Enregistrer Cliky</button>'+
 '<details class="ck" style="margin-top:10px"><summary>Voir ce que Cliky lit pour ce client</summary><div class="mu">Règles</div><div class="ck-pre">'+esc(j.apercu.regles)+'</div><div class="mu" style="margin-top:8px">Base de prix et réglages</div><div class="ck-pre">'+esc(j.apercu.prix)+'</div></details>'+
 (e.modifie&&e.modifie.length?'<div class="ck-row"><button class="btn sm al" type="button" id="ckret">Tout remettre comme la base ProClik</button></div>':'');
 Z.innerHTML=h;
 $('#ckq',Z).onclick=function(){questionnaire(Z,j)};
 $('#ckcol',Z).onclick=function(){$('#ckz',Z).hidden=!$('#ckz',Z).hidden};
 if($('#ckorig',Z))$('#ckorig',Z).onclick=function(){if(!deux(this,'Sûr ? Toucher encore'))return;envoyer(Z,{id:j.id,fournisseur_texte:null},'Base d\'origine remise')};
 if($('#ckret',Z))$('#ckret',Z).onclick=function(){if(!deux(this,'Sûr ? Toucher encore'))return;envoyer(Z,{id:j.id,retablir:true},'Fiche Cliky remise à l\'origine')};
 $('#cksave',Z).onclick=function(){var reg={confirmes:$('#ckok',Z).checked,fg_assiette:$('#ckfa',Z).value};REG.forEach(function(x){reg[x[0]]=$('#ckr-'+x[0],Z).value.trim()});
  var body={id:j.id,metier:$('#ckm',Z).value,reglages:reg,habitudes:$('#ckh',Z).value.split('\n'),non_faits:$('#ckn',Z).value.split('\n')};
  var t=$('#ckft',Z).value.trim();if(t){body.fournisseur_texte=t;body.fournisseur_nom=$('#ckfn',Z).value}
  envoyer(Z,body,'Cliky enregistré',this)};
}
function envoyer(Z,body,ok,b){if(b)b.disabled=true;var E=$('#ckerr',Z);if(E)E.textContent='';
 api('/admin/cliky',{method:'POST',body:body}).then(function(j){toast(ok);rendre(Z,j)},function(e){if(E)E.textContent=e.message;else toast(e.message);if(b)b.disabled=false})}

/* ---------- questionnaire de mise en service : une question à la fois ---------- */
function nbRep(e){var Q=e.questionnaire||[],n=Q.filter(function(q){return q.id in (e.reponses||{})}).length;return n+' réponse'+(n>1?'s':'')+' sur '+Q.length+' · le programme de calcul applique ces choix'}
function valeurActuelle(e,q){var r=e.reponses||{};if(q.id in r)return r[q.id];
 if(q.cible==='reglage'&&e.reglages&&e.reglages[q.id]!=null)return q.type==='choix'?String(e.reglages[q.id]):e.reglages[q.id];
 if(q.cible==='parametre'&&e.parametres&&e.parametres[q.id]!=null)return e.parametres[q.id];
 if(q.cible==='habitude'&&e.habitudes_q)return e.habitudes_q.join('\n');return undefined}
function lib(q,v){if(v===undefined||v===null||v==='')return '<span class="mu">passée</span>';if(q.type==='multi')return v.length?v.map(function(x){var c=(q.choix||[]).filter(function(y){return y[0]===x})[0];return esc(c?c[1]:x)}).join(', '):'Rien';
 if(q.type==='choix'){var c=(q.choix||[]).filter(function(y){return y[0]===String(v)})[0];return esc(c?c[1]:v)}return esc(String(v).replace('.',','))+(q.unite?' '+esc(q.unite):'')}
function questionnaire(Z,j){var e=j.espace,Q=e.questionnaire||[],R={},i=0;Q.forEach(function(q){var v=valeurActuelle(e,q);if(v!==undefined)R[q.id]=v});
 var box=document.createElement('div');box.className='res';box.style.marginTop='10px';var ancre=$('#ckq',Z).parentNode;ancre.hidden=true;ancre.parentNode.insertBefore(box,ancre.nextSibling);
 function fin(){box.remove();ancre.hidden=false}
 function suivant(){i++;montre()}
 function montre(){if(i>=Q.length)return recap();var q=Q[i],v=R[q.id],h='<div class="mu">Question '+(i+1)+' sur '+Q.length+'</div><div style="height:6px;border-radius:9px;background:var(--li);margin:6px 0 12px;overflow:hidden"><div style="height:100%;width:'+Math.round(i/Q.length*100)+'%;background:var(--nu)"></div></div>'+
  '<div style="font-size:18px;font-weight:700;line-height:1.3">'+esc(q.q)+'</div>'+(q.aide?'<p class="mu" style="margin:6px 0 0">'+esc(q.aide)+'</p>':'')+'<div style="margin-top:12px">';
  if(q.type==='choix')h+=q.choix.map(function(c){return '<button class="btn'+(String(v)===c[0]?' go':'')+'" type="button" data-v="'+esc(c[0])+'" style="width:100%;margin:0 0 8px;justify-content:flex-start">'+esc(c[1])+'</button>'}).join('');
  else if(q.type==='multi')h+=q.choix.map(function(c){return '<label class="sw" style="margin:0 0 8px">'+esc(c[1])+'<input type="checkbox" data-m="'+esc(c[0])+'"'+((v||[]).indexOf(c[0])>=0?' checked':'')+'></label>'}).join('')+'<button class="btn go" type="button" id="ckqok" style="width:100%">Continuer</button>';
  else if(q.type==='nombre')h+='<div class="row"><input class="t" id="ckqv" inputmode="decimal" value="'+esc(v==null?'':String(v).replace('.',','))+'" placeholder="'+esc(q.unite||'')+'"><span style="flex:0 0 auto;font-weight:700">'+esc(q.unite||'')+'</span></div><button class="btn go" type="button" id="ckqok" style="width:100%;margin-top:10px">Continuer</button>';
  else h+='<textarea class="t" id="ckqv" rows="4">'+esc(v||'')+'</textarea><button class="btn go" type="button" id="ckqok" style="width:100%;margin-top:10px">Continuer</button>';
  h+='</div><div class="ck-row" style="justify-content:space-between"><button class="btn sm" type="button" id="ckqp">'+(i?'‹ Précédente':'Fermer')+'</button><button class="btn sm" type="button" id="ckqs">Je ne sais pas, passer</button></div>';
  box.innerHTML=h;
  [].forEach.call(box.querySelectorAll('[data-v]'),function(b){b.onclick=function(){R[q.id]=b.dataset.v;[].forEach.call(box.querySelectorAll('[data-v]'),function(x){x.classList.toggle('go',x===b)});setTimeout(suivant,220)}});
  if($('#ckqok',box))$('#ckqok',box).onclick=function(){if(q.type==='multi')R[q.id]=[].map.call(box.querySelectorAll('[data-m]:checked'),function(x){return x.dataset.m});
   else{var t=$('#ckqv',box).value.trim();if(q.type==='nombre'){t=t.replace(',','.');if(t&&!isFinite(Number(t))){toast('Tapez un nombre');return}}if(t)R[q.id]=t;else delete R[q.id]}suivant()};
  $('#ckqs',box).onclick=function(){delete R[q.id];suivant()};
  $('#ckqp',box).onclick=function(){if(!i)return fin();i--;montre()};
  box.scrollIntoView({block:'nearest'})}
 function recap(){box.innerHTML='<div style="font-size:18px;font-weight:700">Vérifiez, puis enregistrez</div><p class="mu" style="margin:4px 0 8px">Touchez une ligne pour la changer.</p>'+
  Q.map(function(q,k){return '<button type="button" data-k="'+k+'" style="display:block;width:100%;text-align:left;border:0;border-top:1px solid var(--li);background:transparent;padding:10px 0;cursor:pointer"><span class="mu" style="display:block">'+esc(q.q)+'</span><b>'+lib(q,R[q.id])+'</b></button>'}).join('')+
  '<div class="err" id="ckqe"></div><button class="btn go" type="button" id="ckqsave" style="width:100%">Enregistrer les réponses</button><div class="ck-row"><button class="btn sm" type="button" id="ckqx">Annuler</button></div>';
  [].forEach.call(box.querySelectorAll('[data-k]'),function(b){b.onclick=function(){i=+b.dataset.k;montre()}});
  $('#ckqx',box).onclick=fin;
  $('#ckqsave',box).onclick=function(){var b=this,rep={};Q.forEach(function(q){rep[q.id]=q.id in R?R[q.id]:null});b.disabled=true;
   api('/admin/cliky',{method:'POST',body:{id:j.id,reponses:rep}}).then(function(n){toast('Réponses enregistrées');rendre(Z,n)},function(er){$('#ckqe',box).textContent=er.message;b.disabled=false})};
  box.scrollIntoView({block:'nearest'})}
 montre()}

/* ---------- base Cliky commune (onglet Réglages) ---------- */
function base(Z){if(!Z)return;Z.innerHTML='<h2>Base Cliky ProClik</h2><p class="mu" style="margin:0">Chargement…</p>';
 api('/admin/cliky/base').then(function(j){rendreBase(Z,j)},function(e){Z.innerHTML='<h2>Base Cliky ProClik</h2><p class="err">'+esc(e.message)+'</p>'})}
function bloc(cle,titre,texte,modif){return '<div style="margin-top:10px"><label class="f">'+esc(titre)+(modif?' <span class="pill w">modifié</span>':'')+'</label><textarea class="t ck-ta" data-ck="'+esc(cle)+'" rows="8">'+esc(texte)+'</textarea>'+
 '<div class="ck-row"><button class="btn sm go" type="button" data-cks="'+esc(cle)+'">Enregistrer</button>'+(modif?'<button class="btn sm" type="button" data-ckr="'+esc(cle)+'">Revenir à l\'origine</button>':'')+'</div></div>'}
function rendreBase(Z,j){
 var h=CSS+'<h2>Base Cliky ProClik</h2><p class="mu" style="margin:0">Ce que Cliky sait pour tous les clients. Une modification ici vaut pour tous les clients du même métier, dès la demande suivante. Leurs réglages à eux ne bougent pas.</p>'+
 '<details class="ck"><summary>Socle commun (tous les métiers)</summary><p class="mu" style="margin:6px 0 0">Gardez les repères entre doubles accolades : c\'est là que s\'insèrent le métier et le client.</p>'+bloc('socle','Socle',j.socle,j.socle_modifie)+'</details>'+
 j.metiers.map(function(m){return '<details class="ck"><summary>'+esc(m.libelle)+(m.modifie.length?' <span class="pill w">modifié</span>':'')+'</summary>'+(m.a_ecrire?'<p class="mu" style="margin:6px 0 0">'+esc(m.a_ecrire)+'</p>':'')+
  Object.keys(CH).map(function(c){return bloc(m.nom+'|'+c,CH[c],m[c],m.modifie.indexOf(c)>=0)}).join('')+'</details>'}).join('')+
 '<details class="ck"><summary>+ Nouveau métier</summary><label class="f" for="cknm">Nom affiché</label><input class="t" id="cknm" placeholder="Ex. Plombier"><div class="ck-row"><button class="btn sm go" type="button" id="cknew">Créer</button></div></details>';
 Z.innerHTML=h;
 function poste(cle,extra){var p=cle.split('|'),b=p[0]==='socle'?{cible:'socle'}:{cible:'metier',nom:p[0],champ:p[1]};for(var k in extra)b[k]=extra[k];return b}
 [].forEach.call(Z.querySelectorAll('[data-cks]'),function(b){b.onclick=function(){var cle=b.dataset.cks,t=Z.querySelector('[data-ck="'+cle+'"]').value;b.disabled=true;
  api('/admin/cliky/base',{method:'POST',body:poste(cle,{texte:t})}).then(function(j){toast('Base Cliky enregistrée');rendreBase(Z,j)},function(e){toast(e.message);b.disabled=false})}});
 [].forEach.call(Z.querySelectorAll('[data-ckr]'),function(b){b.onclick=function(){if(!deux(b,'Sûr ? Toucher encore'))return;b.disabled=true;
  api('/admin/cliky/base',{method:'POST',body:poste(b.dataset.ckr,{retablir:true})}).then(function(j){toast('Remis à l\'origine');rendreBase(Z,j)},function(e){toast(e.message);b.disabled=false})}});
 $('#cknew',Z).onclick=function(){var n=$('#cknm',Z).value.trim();if(!n){toast('Donnez un nom au métier');return}
  var id=n.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  api('/admin/cliky/base',{method:'POST',body:{cible:'metier',nom:id,libelle:n,en_bref:n.toLowerCase()}}).then(function(j){toast('Métier créé');rendreBase(Z,j)},function(e){toast(e.message)})};
}
window.PCCliky={fiche:fiche,base:base};
})();
