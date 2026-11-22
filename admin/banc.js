/* Admin ProClik : banc d'essai de la lecture des plans (Cyril 22/11 : « entraîner Cliky à lire les plans »).
   Quelques vrais plans avec leur bonne réponse. « Lancer le banc » : Cliky relit chaque photo, on compte ses erreurs.
   À chaque retouche de sa consigne, on relance : c'est l'avant/après. */
(function(){'use strict';
var A=window.PCADM;if(!A)return;
var api=A.api,esc=A.esc,toast=A.toast,$=function(s,r){return (r||document).querySelector(s)};
var D=null,EN=false;
var CSS='<style>.bc-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}.bc-g>div{min-width:0}.bc-v{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px solid var(--li)}.bc-v:first-child{border-top:0}'+
 '.bc-n{font-weight:700;white-space:nowrap}.bc-ok{color:#2e7d4f}.bc-ph{width:100%;border-radius:12px;display:block;margin-top:8px}.bc-ul{margin:8px 0 0;padding-left:18px}.bc-ul li{margin:3px 0}</style>';
function jour(d){return d?new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):''}
function erreurs(n){return n===0?'<span class="bc-ok">aucune erreur</span>':n+' erreur'+(n>1?'s':'')}
/* petit dessin du plan : pièces, bouts de cloison, noms */
function mini(N){var P=[];(N||[]).forEach(function(n){P=P.concat(n.pieces||[])});if(!P.length)return '<div class="mu">Rien</div>';
 var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;P.forEach(function(p){p.points.forEach(function(q){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])})});
 var m=.4,f=Math.max(.32,Math.min(.55,(x1-x0)/26)),s='';
 P.forEach(function(p){s+='<polygon points="'+p.points.map(function(q){return q.join(',')}).join(' ')+'" fill="rgba(184,146,79,.12)" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/>';
  (p.cloisons||[]).forEach(function(c){s+='<polyline points="'+c.points.map(function(q){return q.join(',')}).join(' ')+'" fill="none" stroke="#b8924f" stroke-width="4" vector-effect="non-scaling-stroke"/>'})});
 P.forEach(function(p){var cx=0,cy=0;p.points.forEach(function(q){cx+=q[0];cy+=q[1]});cx/=p.points.length;cy/=p.points.length;
  s+='<text x="'+cx+'" y="'+cy+'" font-size="'+f+'" text-anchor="middle" fill="currentColor">'+esc(p.nom.length>22?p.nom.slice(0,21)+'…':p.nom)+'</text>'});
 return '<svg viewBox="'+(x0-m)+' '+(y0-m)+' '+(x1-x0+2*m)+' '+(y1-y0+2*m)+'" style="width:100%;max-height:200px;display:block">'+s+'</svg>'}
function photo(f){return new Promise(function(ok,ko){var r=new FileReader();r.onerror=function(){ko(new Error('Photo illisible'))};
 if(f.type==='application/pdf'){r.onload=function(){var u=r.result;ok(u.slice(u.indexOf(',')+1))};r.readAsDataURL(f);return}
 r.onload=function(){var im=new Image();im.onload=function(){try{var s=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);var u=c.toDataURL('image/jpeg',.86);ok(u.slice(u.indexOf(',')+1))}catch(e){ko(new Error('Photo illisible'))}};im.onerror=function(){ko(new Error('Photo illisible'))};im.src=r.result};r.readAsDataURL(f)})}

function banc(){var Z=$('#banc');if(!Z)return;if(!D)Z.innerHTML='<div class="card mu">Chargement du banc d\'essai…</div>';
 api('/admin/banc').then(function(j){D=j;rendre()},function(e){Z.innerHTML='<div class="card"><h2>Banc d\'essai</h2><p class="err">'+esc(e.message)+'</p></div>'})}
function rendre(){var Z=$('#banc'),j=D,avec=j.plans.filter(function(p){return p.photo});
 var h=CSS+'<div class="card"><h2>Banc d\'essai des plans</h2><p class="mu" style="margin:0">De vrais plans avec leur bonne réponse. « Lancer le banc » fait relire chaque photo par Cliky et compte ses erreurs. Après chaque retouche de sa consigne, relancez : vous voyez l\'avant/après.</p>';
 if(!j.cle)h+='<p class="err">La clé de Cliky n\'est pas posée dans Cloudflare : le banc ne peut pas tourner.</p>';
 if(!j.coffre)h+='<p class="err">Le coffre R2 n\'est pas branché : impossible de garder les photos du banc.</p>';
 if(j.versions.length)h+='<div class="res"><b>Erreurs par version de la consigne</b>'+j.versions.map(function(v,i){return '<div class="bc-v"><span>'+(v.version===j.version?'<b>Consigne actuelle</b>':'Consigne d\'avant')+'<br><small class="mu">lue le '+esc(jour(v.le))+' · '+v.plans+' plan'+(v.plans>1?'s':'')+(v.parfaits?', '+v.parfaits+' sans faute':'')+'</small></span><span class="bc-n">'+erreurs(v.erreurs)+'</span></div>'}).join('')+'</div>';
 else h+='<div class="res mu">Pas encore lancé. Déposez la photo de chaque plan ci-dessous, puis lancez.</div>';
 h+='<button class="btn go" type="button" id="bc-tout" style="width:100%;margin-top:12px"'+(!avec.length||!j.cle||EN?' disabled':'')+'>'+(EN?'Cliky lit…':'Lancer le banc ('+avec.length+' plan'+(avec.length>1?'s':'')+')')+'</button>'+
  '<p class="mu" style="margin:6px 0 0;font-size:13px">Cliky lit chaque plan avec soin : comptez quelques minutes par plan. Gardez la page ouverte.</p><div id="bc-et" class="mu"></div></div>';
 h+=j.plans.map(function(p){var e=p.essais[0],av=p.essais.filter(function(x){return e&&x.version!==e.version})[0];
  return '<div class="card" id="bc-'+esc(p.id)+'"><h2>'+esc(p.nom)+' <small class="mu">'+esc(p.genre)+'</small></h2>'+(p.note?'<p class="mu" style="margin:0">'+esc(p.note)+'</p>':'')+
   '<div class="row" style="margin-top:8px">'+(p.photo?'<button class="btn sm" type="button" data-voir="'+esc(p.id)+'">Voir la photo</button>':'')+
   '<label class="btn sm'+(p.photo?'':' go')+'" style="cursor:pointer">'+(p.photo?'Changer la photo':'Déposer la photo')+'<input type="file" accept="image/*,application/pdf" data-ph="'+esc(p.id)+'" hidden></label>'+
   (p.photo&&j.cle?'<button class="btn sm" type="button" data-un="'+esc(p.id)+'"'+(EN?' disabled':'')+'>Relire ce plan</button>':'')+'</div><div data-img="'+esc(p.id)+'"></div>'+
   '<div class="bc-g" style="margin-top:10px"><div><div class="mu">Bonne réponse</div>'+mini(p.attendu)+'</div><div><div class="mu">'+(e?'Lu par Cliky · '+esc(jour(e.le)):'Pas encore lu')+'</div>'+(e?mini(e.lu):'')+'</div></div>'+
   (e?'<p style="margin:10px 0 0"><b>'+erreurs(e.nb)+'</b>'+(av?' <span class="mu">· avant : '+erreurs(av.nb)+'</span>':'')+(e.duree_s?' <small class="mu">(lu en '+e.duree_s+' s)</small>':'')+'</p>'+
    (e.ecarts.length?'<ul class="bc-ul">'+e.ecarts.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'')+
    (e.a_verifier&&e.a_verifier.length?'<details style="margin-top:8px"><summary class="mu" style="cursor:pointer">Ce que Cliky a mis « à vérifier » ('+e.a_verifier.length+')</summary><ul class="bc-ul">'+e.a_verifier.map(function(v){return '<li>'+(v.piece?'<b>'+esc(v.piece)+'</b> : ':'')+esc(v.texte)+'</li>'}).join('')+'</ul></details>':''):'')+'</div>'}).join('');
 Z.innerHTML=h;
 var T=$('#bc-tout');if(T)T.onclick=function(){tout(avec.map(function(p){return p.id}))};
 [].forEach.call(Z.querySelectorAll('[data-un]'),function(b){b.onclick=function(){tout([b.dataset.un])}});
 [].forEach.call(Z.querySelectorAll('[data-ph]'),function(i){i.onchange=function(){var f=i.files&&i.files[0];if(!f)return;toast('Envoi de la photo…');
  photo(f).then(function(d){return api('/admin/banc/photo',{method:'POST',body:{id:i.dataset.ph,fichier:d}})}).then(function(){toast('Photo déposée');banc()},function(e){toast(e.message)})}});
 [].forEach.call(Z.querySelectorAll('[data-voir]'),function(b){b.onclick=function(){var W=Z.querySelector('[data-img="'+b.dataset.voir+'"]');if(W.innerHTML){W.innerHTML='';return}W.innerHTML='<p class="mu">Chargement…</p>';
  api('/admin/banc/photo?id='+encodeURIComponent(b.dataset.voir)).then(function(j){W.innerHTML=j.mime==='application/pdf'?'<p class="mu">PDF déposé.</p>':'<img class="bc-ph" alt="Photo du plan" src="data:'+esc(j.mime)+';base64,'+j.data+'">'},function(e){W.innerHTML='<p class="err">'+esc(e.message)+'</p>'})}})}
function tout(ids){if(EN||!ids.length)return;EN=true;rendre();var i=0,err=[];
 function suivant(){var E=$('#bc-et');if(i>=ids.length){EN=false;toast(err.length?err.length+' plan(s) non lus':'Banc terminé');banc();return}
  var p=D.plans.filter(function(x){return x.id===ids[i]})[0];if(E)E.textContent='Plan '+(i+1)+' sur '+ids.length+' : '+(p?p.nom:'')+'…';
  api('/admin/banc/lancer',{method:'POST',body:{id:ids[i]}}).then(function(j){if(p)p.essais.unshift(j.essai)},function(e){err.push(e.message);toast(e.message)}).then(function(){i++;suivant()})}
 suivant()}
window.PCBANC=banc;
})();
