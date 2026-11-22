/* « Votre couleur » (maquette figée du 21/11, choix-couleur.html) : la couleur des boutons et des actions de l'Espace.
   6 couleurs, l'aperçu Jour / Nuit change tout de suite, la couleur s'applique aussitôt (pc-couleur-espace, lue par accueil-forme.js).
   Dans la présentation (intro.js, juste avant « Comment préférez-vous l'affichage ? ») et dans Réglages, « Couleur de l'Espace ».
   Le formulaire client qui suit l'Espace est prévenu (PCFormCouleur.envoyer). ?forme=0 = rien. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,X=window.PCX,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var C=[["nuit","Bleu nuit","La couleur ProClik","#1B2440"],["sapin","Vert sapin","Calme, nature","#2F4A3E"],["canard","Bleu canard","Frais, moderne","#1F5560"],
  ["ardoise","Bleu ardoise","Doux","#3A5470"],["noyer","Noyer","Bois, artisan","#4A3A2E"],["encre","Encre","Sobre, sans couleur","#17181D"]];
var info=function(k){for(var i=0;i<C.length;i++)if(C[i][0]===k)return C[i];return C[0]};
var cle=function(){return info(lsG("pc-couleur-espace","nuit"))[0]};
var IMG=new URL("apc/",d.currentScript?d.currentScript.src:location.href).href;
function html(){var k=cle();
  return '<div class="ce"><div class="ce-ap"><figure><img data-ce-im="j" alt="Aperçu de jour" src="'+IMG+k+'-j.jpg"><figcaption>Jour</figcaption></figure>'+
    '<figure><img data-ce-im="n" alt="Aperçu de nuit" src="'+IMG+k+'-n.jpg"><figcaption>Nuit</figcaption></figure></div>'+
    '<div class="ce-r" role="radiogroup" aria-label="Couleur de l\'Espace">'+C.map(function(c){return '<button type="button" role="radio" data-ce="'+c[0]+'" aria-label="'+c[1]+'" aria-checked="'+(c[0]===k)+'" style="background:'+c[3]+'"></button>'}).join("")+'</div>'+
    '<p class="ce-nom"><b></b><span></span></p></div>'}
function maj(el){var k=cle(),c=info(k);
  $$("[data-ce]",el).forEach(function(b){b.setAttribute("aria-checked",String(b.getAttribute("data-ce")===k))});
  $$("[data-ce-im]",el).forEach(function(im){var s=IMG+k+"-"+im.getAttribute("data-ce-im")+".jpg";if(im.src!==s)im.src=s});
  var n=$(".ce-nom",el);if(n){$("b",n).textContent=c[1];$("span",n).textContent=c[2]}
  var l=$("#rg-ecoul small");if(l)l.textContent=c[1];var p=$("#rg-ecoul .ce-pt");if(p)p.style.background=c[3]}
function choisir(k){lsS("pc-couleur-espace",info(k)[0]);if(window.PCF2Couleur)window.PCF2Couleur();
  if(window.PCFormCouleur&&PCFormCouleur.envoyer)PCFormCouleur.envoyer()}
function lie(el){if(!el)return;maj(el);$$("[data-ce]",el).forEach(function(b){b.addEventListener("click",function(){choisir(b.getAttribute("data-ce"));maj(el)})});
  /* les 12 images d'aperçu arrivent d'avance, pour que le changement soit immédiat */
  C.forEach(function(c){["j","n"].forEach(function(t){var i=new Image();i.src=IMG+c[0]+"-"+t+".jpg"})})}
function ouvre(){if(!X||!X.xopen)return;
  X.xopen("Votre couleur","Réglages",html()+'<p class="hint ce-h">Touchez une couleur : l\'aperçu change tout de suite. Les boutons et les actions de l\'Espace prennent cette couleur, de jour comme de nuit.</p>');
  lie($("#x-in"))}
window.PCCouleur={html:html,lie:lie,ouvre:ouvre};
/* Réglages : « Couleur de l'Espace », juste avant « Couleur de mon formulaire » */
var menu=$("#menu");
if(menu&&X)menu.addEventListener("click",function(){setTimeout(function(){
  var c=$("#x-in .card.menu");if(!c||c.querySelector("#rg-ecoul"))return;
  var b=d.createElement("button");b.id="rg-ecoul";b.type="button";
  b.innerHTML='<span class="av"><span class="ce-pt" style="background:'+info(cle())[3]+'"></span></span><span class="tx"><b>Couleur de l\'Espace</b><small>'+info(cle())[1]+'</small></span><span class="go">›</span>';
  var f=$("#rg-fcoul",c);if(f)c.insertBefore(b,f);else c.appendChild(b);
  b.addEventListener("click",ouvre)},0)});
})();
