/* ================================================================================================
   ESPACE DE DÉPART ProClik : la fiche de l'entreprise. C'est le seul fichier à changer quand on duplique
   ce dossier pour un nouveau client (Cyril 15/11 : « un espace de départ avec toutes les fonctionnalités,
   qu'on duplique pour chaque client en ne mettant que ce dont il a besoin »).
   Cet exemplaire est au nom du sous-compte « ProClik Test ».
   ================================================================================================ */
window.PC_ENT={
 /* identifiant court, sans espace ni accent : il range les données de cet Espace à part sur l'appareil
    (deux Espaces ouverts sur le même iPad ne se mélangent jamais) */
 id:'proclik-test',
 sous_compte:'ProClik Test',
 /* les fonctions de l'Espace : true = présente, false = retirée pour ce client.
    Les options payantes (Cliky, Réservation, SMS…) restent réglées par l'abonnement, dans Mes options. */
 modules:{
  equipe:true,         /* planning de l'équipe : qui est sur quel chantier, chaque jour */
  conversation:true    /* conversation de chantier avec les entreprises invitées : option GRATUITE, à partir de 2 personnes (Cyril 19/11) */
 }
};
/* Rangement à part : chaque clé gardée sur l'appareil est préfixée par l'identifiant de l'entreprise. */
(function(){try{var P='pc@'+window.PC_ENT.id+':',S=Storage.prototype;if(S.__pcEnt)return;S.__pcEnt=1;
 var g=S.getItem,s=S.setItem,r=S.removeItem,k=S.key;
 S.getItem=function(x){return this===window.localStorage?g.call(this,P+x):g.call(this,x)};
 S.setItem=function(x,v){return this===window.localStorage?s.call(this,P+x,v):s.call(this,x,v)};
 S.removeItem=function(x){return this===window.localStorage?r.call(this,P+x):r.call(this,x)};
 S.key=function(i){if(this!==window.localStorage)return k.call(this,i);var L=[];for(var j=0;j<this.length;j++){var y=k.call(this,j);if(y&&y.indexOf(P)===0)L.push(y.slice(P.length))}return L[i]==null?null:L[i]};
}catch(e){}})();
