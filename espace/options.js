/* Espace ProClik : les options de l'abonnement (Cliky, Réservation, SMS, Avis Google, Mise en service).
   window.PCOPT.actif('cliky') dit si l'option est prise ; window.PCTAG('cliky') donne le bandeau à poser en haut d'un bloc
   (icône + nom bien visibles), pour que l'artisan voie tout de suite ce qui vient d'une option.
   Source : la connexion de l'Espace (artisan.options, renvoyé par le service ProClik). Sans réponse du service, Cliky compte
   comme pris (démo et compte BRS) et les autres options sont affichées « Option » sans dire si elles sont prises. */
(function(){
var I=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
var O={
 cliky:{n:'Cliky',i:I('<rect x="5" y="8" width="14" height="11" rx="4"/><path d="M12 4.8V8"/><circle cx="12" cy="3.6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9.5" cy="13.4" r="1.25" fill="currentColor" stroke="none"/><circle cx="14.5" cy="13.4" r="1.25" fill="currentColor" stroke="none"/>')},
 reservation:{n:'Réservation',i:I('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="m9 15 2 2 4-4"/>')},
 sms:{n:'SMS',i:I('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/>')},
 avis:{n:'Avis Google',i:I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>')},
 service:{n:'Mise en service',i:I('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>')}
};
var lit=function(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
function actif(k){var a=lit('pc-vrai-artisan');if(a&&a.options&&a.options[k]!=null)return !!a.options[k];
 if(k==='cliky'){var v=lit('pc-cliky');return v==null?true:!!v}return null}
window.PCOPT={actif:actif,liste:O,get cliky(){return actif('cliky')}};
/* Bandeau d'option : PCTAG('cliky') ou PCTAG('cliky','a préparé ce pré-devis') */
window.PCTAG=function(k,dit){var o=O[k];if(!o)return '';var on=actif(k);
 return '<div class="opt-tag'+(on===false?' off':'')+'"><span class="opt-i">'+o.i+'</span><b>'+o.n+'</b><span class="opt-s">'+(dit||(on?'Option incluse':on===false?'Option à ajouter':'Option'))+'</span></div>'};
var st=document.createElement('style');
st.textContent='.opt-tag{display:flex;align-items:center;gap:9px;margin:0 0 10px;padding:0;font:inherit;line-height:1.2}'+
 '.opt-tag .opt-i{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;color:var(--accx,#A8823F);background:var(--cx,var(--bg));box-shadow:var(--in,inset 2px 2px 4px rgba(0,0,0,.12));border:1px solid color-mix(in srgb,var(--accx,#A8823F) 45%,transparent)}'+
 '.opt-tag .opt-i svg{width:19px!important;height:19px!important}'+
 '.opt-tag b{font-size:15px;font-weight:800;color:var(--accx,#A8823F);letter-spacing:.01em}'+
 '.opt-tag .opt-s{font-size:12px;font-weight:700;color:var(--muted);margin-left:auto;text-align:right}'+
 '.opt-tag.off b,.opt-tag.off .opt-i{color:var(--muted);border-color:var(--line)}';
document.head.appendChild(st);
})();
