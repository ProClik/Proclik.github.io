/* Prise de cotes menuiserie dans l'Espace (demande de Cyril, 14/11).
   L'onglet « Cotes » range les relevés par chantier ; un relevé s'ouvre en plein écran (cotes.html dans un cadre),
   une question à la fois, téléphone d'abord. Tout est gardé sur l'appareil (localStorage « pc-cotes »).
   « Faire le plan du logement » ferme les cotes et ouvre le plan : chaque fenêtre ou porte du plan propose
   « Reprendre une cote prise sur place » (largeur et hauteur au millimètre, type, ouverture, matière, volet).
   Réutilisable ailleurs (ex. démo fournisseur) : il suffit de cotes.html, voir l'en-tête de ce fichier. */
(function(){
"use strict";
var d=document,$=function(s,r){return (r||d).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var KEY='pc-cotes',V='1';
var v=$('#v-cotes');if(!v)return;

var S=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={metre:S('<circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2"/><path d="M17 15h4v3h-11"/>'),
 plus:S('<path d="M12 5v14M5 12h14"/>'),fl:S('<path d="M9 5l7 7-7 7"/>'),fen:S('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M12 3v18M5 12h14"/>')};

var css=d.createElement('style');css.textContent=[
'#v-cotes .ct-go{display:flex;align-items:center;gap:12px;width:100%;margin:14px 0 18px;padding:16px 18px;border:0;border-radius:18px;background:var(--nuit,#1B2440);color:var(--nuit-fg,#fff);font:800 16px var(--f,inherit);text-align:left;cursor:pointer;box-shadow:var(--n1-go-sh,0 8px 18px -6px rgba(14,19,34,.35))}',
'#v-cotes .ct-go svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}',
'#v-cotes .ct-go small{display:block;font-weight:600;font-size:12.5px;opacity:.8}',
'#v-cotes .ct-l{display:grid;gap:10px}',
'#v-cotes .ct-r{display:flex;align-items:center;gap:12px;width:100%;padding:14px;border:0;border-radius:16px;background:var(--n1-calme,var(--card));color:inherit;font:inherit;text-align:left;cursor:pointer;box-shadow:var(--n1-pk)}',
'#v-cotes .ct-r .i{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--n1-teinte,var(--bg))}',
'#v-cotes .ct-r svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
'#v-cotes .ct-r .t{flex:1;min-width:0}#v-cotes .ct-r b{display:block;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#v-cotes .ct-r small{display:block;color:var(--muted);font-size:12.5px}#v-cotes .ct-r em{font-style:normal;font-weight:800;font-size:12px;color:var(--n1-laiton,#A8823F)}',
'#v-cotes .ct-r em.ok{color:var(--n1-ok,#3E8E6A)}#v-cotes .ct-vide{color:var(--muted);text-align:center;padding:18px 6px}',
'.ctov{position:fixed;inset:0;z-index:9998;background:var(--n1-bg,var(--bg));display:flex}.ctov[hidden]{display:none!important}.ctov iframe{flex:1;border:0;width:100%;height:100%;background:var(--n1-bg,var(--bg))}',
'.ctnew{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(14,19,34,.35)}.ctnew[hidden]{display:none!important}',
'.ctnew>div{width:100%;max-width:520px;max-height:88dvh;overflow:auto;background:var(--n1-bg,var(--bg));border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));display:grid;gap:12px}',
'@media (min-width:600px){.ctnew{align-items:center}.ctnew>div{border-radius:22px}}',
'.ctnew h3{margin:0;font:800 19px var(--f,inherit)}.ctnew p{margin:0;color:var(--muted);font-size:13.5px}',
'.ctnew .ch{display:grid;gap:8px}.ctnew .ch button,.ctnew .row2 button{padding:13px 14px;border:0;border-radius:14px;background:var(--n1-calme,var(--card));color:inherit;font:700 15px var(--f,inherit);text-align:left;cursor:pointer;box-shadow:var(--n1-pk)}',
'.ctnew input{width:100%;padding:13px 14px;border:0;border-radius:14px;background:var(--n1-bg,var(--bg));box-shadow:var(--n1-in);color:inherit;font:600 16px var(--f,inherit)}',
'.ctnew .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ctnew .row2 .go{background:var(--nuit,#1B2440);color:var(--nuit-fg,#fff);text-align:center}.ctnew .row2 .an{text-align:center}'
].join('');d.head.appendChild(css);

function tous(){return lsG(KEY,{})||{}}
function resume(r){var it=r.items||[],ok=it.filter(function(x){return x.fini}).length;return {n:it.length,ok:ok}}
function quand(t){if(!t)return '';var x=new Date(t);return x.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}
function rendre(){var A=tous(),ids=Object.keys(A).sort(function(a,b){return (A[b].t||0)-(A[a].t||0)});
 v.innerHTML='<div class="row" style="margin-bottom:6px"><h2>Prise de cotes</h2></div>'+
  '<p class="lead">Fenêtres, portes et volets mesurés sur place, une question à la fois, le mètre dans une main.</p>'+
  '<button type="button" class="ct-go" data-ct-new>'+IC.metre+'<span>Nouvelle prise de cotes<small>Choisissez le chantier, puis mesurez</small></span></button>'+
  (ids.length?'<div class="ct-l">'+ids.map(function(id){var r=A[id],m=resume(r);
   return '<button type="button" class="ct-r" data-ct-open="'+esc(id)+'"><span class="i">'+IC.fen+'</span><span class="t"><b>'+esc(r.chantier||'Sans chantier')+'</b><small>'+(m.n?m.n+' menuiserie'+(m.n>1?'s':'')+' · ':'Rien de mesuré · ')+quand(r.t||r.t0)+'</small></span>'+
    (m.n?(m.ok===m.n?'<em class="ok">Prêt ✓</em>':'<em>'+(m.n-m.ok)+' à finir</em>'):'')+'</button>'}).join('')+'</div>'
   :'<p class="ct-vide">Aucune prise de cotes pour l\'instant.</p>')}

/* ---------- plein écran ---------- */
var ov=d.createElement('div');ov.className='ctov';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Prise de cotes');
ov.innerHTML='<iframe title="Prise de cotes" allow="camera; microphone"></iframe>';d.body.appendChild(ov);var fr=$('iframe',ov);
function ouvrir(id){var r=tous()[id]||{};var q='r='+encodeURIComponent(id)+'&embed=1&v='+V;
 if(!tous()[id]){var art=lsG('pc-vrai-artisan',{})||{};q+='&c='+encodeURIComponent(nouv.c||'Sans chantier')+(art.prenom?'&qui='+encodeURIComponent(art.prenom):'')}
 fr.src='cotes.html?'+q;ov.hidden=false;d.body.style.overflow='hidden'}
function fermer(){ov.hidden=true;d.body.style.overflow='';fr.src='about:blank';rendre()}
addEventListener('message',function(e){if(e.source!==fr.contentWindow)return;var m=e.data||{};
 if(m.type==='proclik-cotes-close')fermer();
 if(m.type==='proclik-cotes-plan'){fermer();var b=d.createElement('button');b.hidden=true;b.setAttribute('data-openplan','Plan · '+(m.c||'chantier'));d.body.appendChild(b);b.click();b.remove()}});

/* ---------- nouveau relevé : pour quel chantier ? ---------- */
var nouv={c:''};
var sh=d.createElement('div');sh.className='ctnew';sh.hidden=true;d.body.appendChild(sh);
function noms(){var L=(lsG('pc-vrai-liste',null)||{}).demandes||[],vu={},R=[];
 L.forEach(function(x){var n=(x.client||'').trim();if(n&&!vu[n]){vu[n]=1;R.push(n+(x.ville?' · '+x.ville:''))}});
 if(!R.length&&!d.documentElement.classList.contains('pcvrai'))R=['M. et Mme Durand · Voiron'];
 return R.slice(0,6)}
function choisir(){var N=noms();sh.innerHTML='<div><h3>Pour quel chantier ?</h3>'+
  (N.length?'<div class="ch">'+N.map(function(n){return '<button type="button" data-ct-c="'+esc(n)+'">'+esc(n)+'</button>'}).join('')+'</div><p>Ou écrivez le nom :</p>':'<p>Le nom du client et la ville :</p>')+
  '<input id="ct-nom" placeholder="ex. M. Martin · Voiron" autocomplete="off" enterkeyhint="go">'+
  '<div class="row2"><button type="button" class="an" data-ct-x>Annuler</button><button type="button" class="go" data-ct-ok>Commencer</button></div>'+
  '<button type="button" class="an" data-ct-c="" style="border:0;background:none;color:var(--muted);font:700 14px var(--f,inherit);cursor:pointer;padding:6px">Pas encore de chantier : je le range plus tard</button></div>';
 sh.hidden=false}
function demarre(n){nouv.c=n||'Sans chantier';sh.hidden=true;ouvrir('c'+Date.now().toString(36))}
sh.addEventListener('click',function(e){var b=e.target.closest('button');if(e.target===sh||b&&b.hasAttribute('data-ct-x')){sh.hidden=true;return}if(!b)return;
 if(b.hasAttribute('data-ct-c'))return demarre(b.getAttribute('data-ct-c'));
 if(b.hasAttribute('data-ct-ok')){var x=$('#ct-nom',sh).value.trim();if(!x){$('#ct-nom',sh).focus();return}demarre(x)}});
sh.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='ct-nom'){e.preventDefault();var x=e.target.value.trim();if(x)demarre(x)}});

v.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-ct-new'))return choisir();
 if(b.hasAttribute('data-ct-open'))return ouvrir(b.getAttribute('data-ct-open'))});
addEventListener('storage',function(e){if(e.key===KEY&&ov.hidden)rendre()});
rendre();
window.PCCOTES={ouvrir:ouvrir,nouveau:choisir,liste:tous};
})();
