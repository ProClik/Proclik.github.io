/* Menu du bas sur téléphone (demande de Cyril, 31/10) : barre en relief avec une encoche au centre.
   À gauche Accueil puis Clients, à droite Planning puis Devis. Le gros galet du milieu ouvre le menu :
   l'encoche se bombe, le galet monte, le micro sort au centre et le reste de l'Espace s'ouvre en éventail.
   Les boutons de la barre appuient sur les vrais onglets (#nb-…) : tout le fonctionnement existant est gardé.
   Tablette et ordinateur : rien ne change (menu sur le côté). */
(function(){
  "use strict";
  var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  if($("#pb")||!$("#nb-accueil"))return;
  var mq=matchMedia("(max-width:899px)"),reduit=matchMedia("(prefers-reduced-motion: reduce)");
  var BAS=["accueil","clients","planning","devis"];
  var EVENTAIL=["factures","depenses","chantiers","prix","produits","reglages"];
  var ICO_REGL='<svg viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>';
  var ICO_MIC='<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  function info(v){
    if(v==="reglages")return {ico:ICO_REGL,nom:"Réglages"};
    var b=$("#nb-"+v);if(!b)return null;
    var ico=$(".ico",b),nom="";
    [].forEach.call(b.childNodes,function(n){if(n.nodeType===3)nom+=n.nodeValue});
    return {ico:ico?ico.innerHTML:"",nom:nom.trim()||v};
  }
  function bouton(v,cls){
    var i=info(v);if(!i)return "";
    return '<button type="button" class="'+cls+'" data-pb="'+v+'"><span class="pb-g" aria-hidden="true">'+i.ico+'</span><span class="pb-n">'+i.nom+'</span>'+
      (v==="devis"?'<span class="badge pb-b" data-src="#badge" hidden></span>':v==="factures"?'<span class="badge pb-b" data-src="#badge-f" hidden></span>':v==="depenses"?'<span class="badge pb-b" data-src="#badge-d" hidden></span>':"")+'</button>';
  }

  /* ---------- construction ---------- */
  var pb=d.createElement("div");pb.className="pb";pb.id="pb";
  pb.innerHTML='<svg class="pb-fond" aria-hidden="true"><path/></svg>'+
    '<nav class="pb-l" aria-label="Menu principal">'+bouton("accueil","pb-i")+bouton("clients","pb-i")+'<span class="pb-trou"></span>'+bouton("planning","pb-i")+bouton("devis","pb-i")+'</nav>'+
    '<button type="button" class="pb-c" id="pb-c" aria-expanded="false" aria-controls="pb-menu" aria-label="Ouvrir le menu">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="l1" d="M5 7h14"/><path class="l2" d="M5 12h14"/><path class="l3" d="M5 17h14"/></svg>'+
      '<span class="badge pb-bc" hidden></span></button>';
  var scrim=d.createElement("div");scrim.className="pb-scrim";scrim.id="pb-scrim";
  var menu=d.createElement("div");menu.className="pb-menu";menu.id="pb-menu";menu.setAttribute("aria-hidden","true");
  menu.innerHTML='<button type="button" class="pb-mic" data-pb="micro" aria-label="Parler à ProClik (dictée)" tabindex="-1"><span class="pb-g" aria-hidden="true">'+ICO_MIC+'</span></button>'+
    EVENTAIL.map(function(v,i){return bouton(v,"pb-e").replace('class="pb-e"','class="pb-e" tabindex="-1" style="--i:'+i+'"')}).join("");
  d.body.appendChild(scrim);d.body.appendChild(menu);d.body.appendChild(pb);
  var path=$(".pb-fond path",pb),svg=$(".pb-fond",pb),centre=$("#pb-c");

  /* ---------- forme de la barre : encoche (t=0) qui se bombe (t=1) ---------- */
  var H=68,R=34,W=0,t=0,anim=0;
  function forme(t){
    var c=W/2,s=1-2.2*t,y=function(v){return (v*s).toFixed(2)};
    return "M"+R+",0 L"+(c-55)+",0 C"+(c-43)+",0 "+(c-37)+","+y(4)+" "+(c-35)+","+y(14)+
      " C"+(c-29.9)+","+y(28.9)+" "+(c-15.8)+","+y(39)+" "+c+","+y(39)+
      " C"+(c+15.8)+","+y(39)+" "+(c+29.9)+","+y(28.9)+" "+(c+35)+","+y(14)+
      " C"+(c+37)+","+y(4)+" "+(c+43)+",0 "+(c+55)+",0"+
      " L"+(W-R)+",0 A"+R+" "+R+" 0 0 1 "+(W-R)+","+H+" L"+R+","+H+" A"+R+" "+R+" 0 0 1 "+R+",0 Z";
  }
  function dessine(){path.setAttribute("d",forme(t))}
  function mesure(){
    W=pb.getBoundingClientRect().width;if(!W)return;
    svg.setAttribute("width",W);svg.setAttribute("height",H);svg.setAttribute("viewBox","0 0 "+W+" "+H);dessine();
    /* éventail : demi-cercle autour du galet central, adapté à la largeur du téléphone */
    var rx=Math.min(168,(innerWidth-60)/2),ry=160,n=EVENTAIL.length;
    $$(".pb-e",menu).forEach(function(b,i){
      var a=(165-i*(150/(n-1)))*Math.PI/180;
      b.style.setProperty("--x",(Math.cos(a)*rx).toFixed(1)+"px");
      b.style.setProperty("--y",(-Math.sin(a)*ry).toFixed(1)+"px");
    });
  }
  function vers(cible,duree){
    cancelAnimationFrame(anim);
    if(reduit.matches||!duree){t=cible;dessine();return}
    var t0=t,debut=performance.now();
    (function pas(now){
      var k=Math.min(1,(now-debut)/duree),e=cible>t0?1-Math.pow(1-k,4):k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      t=t0+(cible-t0)*e;dessine();if(k<1)anim=requestAnimationFrame(pas);
    })(performance.now());
  }

  /* ---------- ouvrir / fermer ---------- */
  var ouvert=false;
  function ouvre(){
    if(ouvert)return;ouvert=true;
    d.documentElement.classList.add("pb-ouvert");centre.setAttribute("aria-expanded","true");centre.setAttribute("aria-label","Fermer le menu");
    menu.setAttribute("aria-hidden","false");$$("button",menu).forEach(function(b){b.tabIndex=0});
    vers(1,520);try{if(navigator.vibrate)navigator.vibrate(10)}catch(_){}
  }
  function ferme(){
    if(!ouvert)return;ouvert=false;
    d.documentElement.classList.remove("pb-ouvert");centre.setAttribute("aria-expanded","false");centre.setAttribute("aria-label","Ouvrir le menu");
    menu.setAttribute("aria-hidden","true");$$("button",menu).forEach(function(b){b.tabIndex=-1});
    vers(0,380);
  }
  centre.addEventListener("click",function(){ouvert?ferme():ouvre()});
  scrim.addEventListener("click",ferme);
  d.addEventListener("keydown",function(e){if(e.key==="Escape"&&ouvert){ferme();centre.focus()}});
  function agit(v){
    if(v==="micro"){var m=$("#speak");if(m)m.click();return}
    if(v==="reglages"){var r=$("#menu");if(r)r.click();return}
    var b=$("#nb-"+v);if(b)b.click();
  }
  pb.addEventListener("click",function(e){var b=e.target.closest("[data-pb]");if(!b)return;ferme();agit(b.dataset.pb)});
  menu.addEventListener("click",function(e){var b=e.target.closest("[data-pb]");if(!b)return;ferme();setTimeout(function(){agit(b.dataset.pb)},b.dataset.pb==="micro"?0:180)});

  /* ---------- onglet en cours et pastilles, recopiés des vrais boutons ---------- */
  function suit(){
    var cur=($("nav.nav [aria-selected=true]")||{dataset:{}}).dataset.v;
    $$("[data-pb]").forEach(function(b){var on=b.dataset.pb===cur;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
    centre.classList.toggle("on",EVENTAIL.indexOf(cur)>=0);
    var tot=0;
    $$(".pb-b").forEach(function(x){var s=$(x.dataset.src),n=s&&!s.hidden?+(s.textContent||0)||0:0;x.textContent=n;x.hidden=!n;if(x.closest(".pb-menu"))tot+=n});
    var bc=$(".pb-bc",pb);bc.textContent=tot;bc.hidden=!tot;
  }
  var nav=$("nav.nav");
  if(nav)new MutationObserver(suit).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected","hidden"],childList:true,characterData:true});
  suit();

  mesure();addEventListener("resize",mesure);
  if(mq.addEventListener)mq.addEventListener("change",function(){ferme();mesure()});
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(mesure);
})();
