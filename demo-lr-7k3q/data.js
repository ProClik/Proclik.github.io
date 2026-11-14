/* Démo ProClik « rénovation clé en main » : données d'exemple partagées entre le site, le formulaire, l'Espace et le plan.
   Tout est fictif et reste dans ce navigateur (aucun envoi). */
(function(){
  var RT=window.RT={};
  RT.NOMS={chef:'Antoine',bureau:'Claire',ouvrier:'Lucas',client:'Mme Rey'};
  RT.ROLES={chef:'Direction',bureau:'Bureau',ouvrier:'Terrain',client:'Client'};
  /* --- Plan du chantier Rey (appartement T3, Grenoble) : cotes en cm, pièces dans le sens des aiguilles d'une montre --- */
  RT.HAUT=250;
  RT.PIECES=[
    {id:'sej',n:'Séjour + cuisine',p:[[0,0],[520,0],[520,420],[0,420]],lb:[260,230]},
    {id:'ch1',n:'Chambre 1',p:[[520,0],[900,0],[900,360],[520,360]],lb:[710,190]},
    {id:'ch2',n:'Chambre 2',p:[[600,360],[900,360],[900,700],[600,700]],lb:[750,540]},
    {id:'sdb',n:'Salle de bain',p:[[0,420],[260,420],[260,700],[0,700]],lb:[130,560]},
    {id:'wc',n:'WC',p:[[260,580],[380,580],[380,700],[260,700]],lb:[320,640]},
    {id:'ent',n:'Entrée',p:[[260,420],[520,420],[520,360],[600,360],[600,700],[380,700],[380,580],[260,580]],lb:[470,520]}];
  /* ouvertures (coordonnées du plan, posées sur l'axe du mur) */
  RT.OUV=[
    {t:'fen',n:'Fenêtre',a:[80,0],b:[200,0],h:125,al:95},
    {t:'pf',n:'Porte-fenêtre',a:[300,0],b:[460,0],h:215,al:0},
    {t:'fen',n:'Fenêtre',a:[650,0],b:[790,0],h:135,al:90},
    {t:'fen',n:'Fenêtre',a:[900,480],b:[900,600],h:125,al:95},
    {t:'fen',n:'Fenêtre',a:[0,560],b:[0,620],h:60,al:140},
    {t:'por',n:'Porte',a:[400,420],b:[490,420],h:204,al:0},
    {t:'por',n:'Porte',a:[523,360],b:[596,360],h:204,al:0},
    {t:'por',n:'Porte',a:[600,440],b:[600,523],h:204,al:0},
    {t:'por',n:'Porte',a:[260,440],b:[260,513],h:204,al:0},
    {t:'por',n:'Porte',a:[380,600],b:[380,663],h:204,al:0},
    {t:'pe',n:'Porte d\'entrée',a:[430,700],b:[520,700],h:215,al:0}];
  /* types d'éléments du mur : nom, hauteur conseillée (milieu), famille, largeur et hauteur s'il a une taille */
  RT.TYPES={
    pc:{n:'Prise 16 A',h:30,f:'el'},pc2:{n:'Prise double',h:30,f:'el'},p32:{n:'Prise 32 A (plaque)',h:15,f:'el'},
    tv:{n:'Prise TV',h:30,f:'el'},rj:{n:'Prise internet (RJ45)',h:30,f:'el'},
    int:{n:'Interrupteur',h:110,f:'el'},vv:{n:'Va-et-vient',h:110,f:'el'},pl:{n:'Applique (point lumineux)',h:180,f:'el'},
    iph:{n:'Interphone',h:150,f:'el'},tab:{n:'Tableau électrique',h:160,f:'el',w:60,hh:80},
    ef:{n:'Arrivée eau froide',h:55,f:'eau'},ec:{n:'Arrivée eau chaude',h:55,f:'eau'},ev:{n:'Évacuation',h:40,f:'eau'},
    rad:{n:'Radiateur',h:45,f:'ch',w:80,hh:55},ss:{n:'Sèche-serviettes',h:110,f:'ch',w:50,hh:120},vmc:{n:'Bouche VMC',h:220,f:'air'}};
  /* éléments : pièce, mur (n° du côté de la pièce), x = depuis l'angle gauche quand on regarde le mur, h = hauteur du milieu */
  function elems(){return [
    {r:'sej',m:0,t:'pc2',x:30,h:110},{r:'sej',m:0,t:'ef',x:118,h:52},{r:'sej',m:0,t:'ec',x:162,h:52},{r:'sej',m:0,t:'ev',x:140,h:35},{r:'sej',m:0,t:'pc',x:235,h:30},
    {r:'sej',m:1,t:'pl',x:100,h:180},{r:'sej',m:1,t:'pc2',x:175,h:30},{r:'sej',m:1,t:'tv',x:215,h:30},{r:'sej',m:1,t:'rj',x:245,h:30},{r:'sej',m:1,t:'pc',x:360,h:30},
    {r:'sej',m:2,t:'vv',x:135,h:110},{r:'sej',m:2,t:'pc',x:250,h:30},{r:'sej',m:2,t:'rad',x:340,h:45},
    {r:'sej',m:3,t:'pc2',x:255,h:110},{r:'sej',m:3,t:'p32',x:330,h:15},{r:'sej',m:3,t:'pc',x:380,h:200},
    {r:'ch1',m:0,t:'pc',x:60,h:30},{r:'ch1',m:0,t:'rad',x:200,h:45},{r:'ch1',m:0,t:'pc',x:330,h:30},
    {r:'ch1',m:1,t:'pc2',x:70,h:70},{r:'ch1',m:1,t:'pl',x:95,h:150},{r:'ch1',m:1,t:'rj',x:180,h:30},{r:'ch1',m:1,t:'pl',x:265,h:150},{r:'ch1',m:1,t:'pc2',x:290,h:70},
    {r:'ch1',m:2,t:'pc',x:150,h:30},{r:'ch1',m:2,t:'int',x:285,h:110},
    {r:'ch1',m:3,t:'pc2',x:150,h:30},{r:'ch1',m:3,t:'tv',x:185,h:30},
    {r:'ch2',m:0,t:'pc',x:50,h:30},{r:'ch2',m:0,t:'pc',x:250,h:30},
    {r:'ch2',m:1,t:'rad',x:180,h:45},{r:'ch2',m:2,t:'pc2',x:150,h:70},
    {r:'ch2',m:3,t:'pc',x:80,h:30},{r:'ch2',m:3,t:'int',x:275,h:110},
    {r:'sdb',m:0,t:'ss',x:130,h:110},
    {r:'sdb',m:1,t:'int',x:108,h:110},{r:'sdb',m:1,t:'ef',x:180,h:55},{r:'sdb',m:1,t:'ec',x:205,h:55},{r:'sdb',m:1,t:'ev',x:192,h:45},{r:'sdb',m:1,t:'pl',x:192,h:200},{r:'sdb',m:1,t:'pc',x:245,h:120},
    {r:'sdb',m:2,t:'ef',x:62,h:110},{r:'sdb',m:2,t:'ec',x:78,h:110},{r:'sdb',m:2,t:'ev',x:70,h:8},{r:'sdb',m:2,t:'pc',x:185,h:100},{r:'sdb',m:2,t:'ef',x:205,h:90},{r:'sdb',m:2,t:'ev',x:225,h:70},
    {r:'sdb',m:3,t:'vmc',x:220,h:220},
    {r:'wc',m:1,t:'int',x:95,h:110},{r:'wc',m:2,t:'ef',x:80,h:15},{r:'wc',m:2,t:'ev',x:60,h:10},{r:'wc',m:3,t:'vmc',x:60,h:220},
    {r:'ent',m:0,t:'int',x:245,h:110},{r:'ent',m:4,t:'iph',x:60,h:150},{r:'ent',m:4,t:'int',x:185,h:110},{r:'ent',m:3,t:'tab',x:250,h:160}];}

  /* --- Métiers : chacun se coche à la création du compte, l'Espace prend la forme des métiers cochés --- */
  RT.METIERS={
    elec:{n:'Électricité',ic:'idea',qui:'électricien',types:['pc','pc2','p32','tv','rj','int','vv','pl','iph','tab'],
      mat:['Gaine ICTA 20 mm, 100 m','Boîtes d\'encastrement × 50','Câble 2,5 mm², 100 m','Câble 1,5 mm², 100 m','Disjoncteurs 20 A × 4','Prises et interrupteurs × 10'],
      taches:['Saignées et gaines','Boîtes d\'encastrement','Tirage des câbles','Raccordement du tableau','Attestation de conformité'],
      vue:'Prises, interrupteurs, points lumineux et tableau sur chaque mur',ck:'Combien de prises dans une chambre ?',
      rep:'La norme NF C 15-100 demande au moins 3 prises dans une chambre. Sur le plan de Mme Rey, la chambre 1 a 6 emplacements de prises, dont 3 doubles : c\'est bon.'},
    plomb:{n:'Plomberie',ic:'wrench',qui:'plombier',types:['ef','ec','ev'],
      mat:['Tube multicouche 16 mm, 50 m','Raccords à sertir × 20','Tube PVC Ø 40, 4 m','Tube PVC Ø 100, 4 m','Vannes d\'arrêt × 4'],
      taches:['Dépose de l\'ancienne plomberie','Alimentations eau froide et chaude','Évacuations','Mise en eau et test de pression','Pose des appareils'],
      vue:'Arrivées d\'eau et évacuations, avec leurs hauteurs',ck:'Quelle hauteur pour l\'évacuation du lavabo ?',
      rep:'Sur le plan de Mme Rey, l\'évacuation du lavabo est à 45 cm du sol, entre l\'eau froide et l\'eau chaude à 55 cm. Pensez à la pente : environ 1 à 3 cm par mètre.'},
    clim:{n:'Chauffage et clim',ic:'sun',qui:'chauffagiste',types:['rad','ss','vmc'],
      mat:['Liaison frigorifique 1/4 - 3/8, 5 m','Support mural d\'unité extérieure','Goulotte 60 × 45','Sèche-serviettes 500 W'],
      taches:['Pose de l\'unité intérieure','Pose de l\'unité extérieure','Liaisons et tirage au vide','Mise en service'],
      vue:'Radiateurs, sèche-serviettes et bouches de ventilation',ck:'Quelle puissance de clim pour le séjour ?',
      rep:'Le séjour fait 21,8 m² sous 2,50 m. En ordre de grandeur, une unité d\'environ 2,5 kW. À confirmer selon l\'exposition et l\'isolation.'},
    placo:{n:'Placo et isolation',ic:'stock',qui:'plaquiste',types:[],
      mat:['Plaques BA13 × 20','Rails 48 mm × 3 m × 10','Montants 48 mm × 3 m × 20','Laine minérale 45 mm, 1 rouleau','Bandes et enduit'],
      taches:['Ossature','Isolation','Pose des plaques','Bandes et enduit'],
      vue:'Surface de chaque mur et nombre de plaques',ck:'Combien de plaques pour la chambre 2 ?',
      rep:'Murs de la chambre 2 sans les ouvertures : environ 29 m². Avec des plaques de 1,20 × 2,50 m (3 m²) et 10 % de chute, prévoyez 11 plaques.'},
    carre:{n:'Carrelage et sols',ic:'plan',qui:'carreleur',types:[],
      mat:['Colle carrelage C2, 25 kg × 4','Croisillons 2 mm','Joint gris, 5 kg','Sous-couche parquet, 15 m²','Plinthes × 10'],
      taches:['Ragréage','Pose','Joints','Plinthes'],
      vue:'Surface au sol de chaque pièce, chute comprise',ck:'Combien de carrelage pour la salle de bain ?',
      rep:'La salle de bain fait 7,3 m² au sol. Avec 10 % de chute, commandez 8 m².'},
    peint:{n:'Peinture',ic:'image',qui:'peintre',types:[],
      mat:['Impression, 15 L','Peinture mate blanche, 15 L','Enduit de lissage, 25 kg','Rouleaux, bâches et ruban'],
      taches:['Protection','Enduit et ponçage','Impression','Deux couches de finition'],
      vue:'Surface à peindre de chaque mur et litres de peinture',ck:'Combien de peinture pour le séjour ?',
      rep:'Murs du séjour sans les ouvertures : environ 40 m². Pour deux couches à environ 10 m² par litre, comptez 8 litres, plus le plafond.'},
    menu:{n:'Menuiserie',ic:'hammer',qui:'menuisier',types:[],
      mat:['Bloc-porte 73 × 204','Bloc-porte 83 × 204','Huisseries × 2','Quincaillerie'],
      taches:['Dépose','Pose des huisseries','Pose des portes','Réglages'],
      vue:'Portes et fenêtres avec largeur, hauteur et allège',ck:'Quelles portes pour les chambres ?',
      rep:'Chambre 1 : passage de 73 × 204. Chambre 2 : 83 × 204. Ce sont les cotes du plan validé par Antoine.'},
    maco:{n:'Petite maçonnerie',ic:'box',qui:'maçon',types:[],
      mat:['Ciment, 35 kg × 5','Sable, 1 big bag','Parpaings × 20'],
      taches:['Ouverture ou rebouchage','Chape','Reprises'],
      vue:'Ouvertures à créer ou à reboucher',ck:'Faut-il un IPN pour ouvrir ce mur ?',
      rep:'Je ne peux pas le dire sans savoir si le mur est porteur. Demandez à Antoine : s\'il l\'est, il faut l\'avis d\'un bureau d\'études.'}};
  RT.ORDRE=['elec','plomb','clim','placo','carre','peint','menu','maco'];
  RT.metiersOn=function(){var m=RT.S.metiers||{};return RT.ORDRE.filter(function(k){return m[k]})};
  RT.typeOn=function(t){var on=RT.metiersOn();return on.some(function(k){return RT.METIERS[k].types.indexOf(t)>=0})};
  /* --- Données de l'entreprise (exemple) --- */
  function base(){return {
    role:'chef',v:1,
    metiers:{elec:1,plomb:1,clim:1,placo:1,carre:1,peint:1,menu:1,maco:1},
    mesMet:{Lucas:['placo','peint'],Mathieu:['elec','plomb']},
    plan:{el:elems(),verrou:true,hist:[]},
    feed:[
      {q:'ouvrier',qui:'Mathieu',t:'Photo de fin de journée · Rey, Grenoble',h:'hier 17 h 12',k:'image'},
      {q:'bureau',qui:'Claire',t:'Situation n°1 encaissée · Faure, Revel',h:'hier 11 h 40',k:'euro'}],
    jour:[ /* journal visible par le client Rey */
      {d:'Mardi',t:'Cloisons des chambres montées, gaines électriques passées dans les rails.',ph:2},
      {d:'Lundi',t:'Plomberie de la salle de bain posée et testée sous pression. Aucune fuite.',ph:3},
      {d:'Vendredi',t:'Dépose terminée, appartement vidé et protégé.',ph:2}],
    av:[],         /* avenants : {id,txt,lignes,tot,etat:'chef'|'client'|'signe'} */
    mat:[{id:1,ch:'Rey, Grenoble',t:'Plaques de plâtre BA13 × 42',etat:'cmd',liv:'jeudi'}],
    conges:[],
    alerte:[],     /* erreurs de cote signalées par un ouvrier */
    dem:[
      {id:'d1',nom:'Mme Lopez',lieu:'Saint-Ismier',t:'Rénovation complète d\'une maison',det:'Maison de 1985, 110 m², deux niveaux. Tout refaire : électricité, salle de bain, sols, peinture.',bud:'60 000 à 90 000 €',quand:'Printemps',h:'ce matin 8 h 02',etat:'nouv'},
      {id:'d2',nom:'M. Blanc',lieu:'Gières',t:'Salle de bain',det:'Remplacer la baignoire par une douche à l\'italienne, salle de bain de 5 m².',bud:'10 000 à 15 000 €',quand:'Dès que possible',h:'hier 21 h 30',etat:'nouv'}],
    point:{arr:null,dep:null},
    acces:{bureau_marges:false,ref_prix:false,ouvrier_heures:true}
  };}
  RT.base=base;
  RT.S=PCD.load();
  if(!RT.S||RT.S.v!==1)RT.S=base();
  RT.save=function(){PCD.save(RT.S)};
  RT.reset=function(){RT.S=base();RT.save()};
  RT.evt=function(q,qui,t,k){RT.S.feed.unshift({q:q,qui:qui,t:t,h:'à l\'instant',k:k||'bell',neu:1});RT.save()};
  /* outils de géométrie du plan */
  RT.murs=function(p){ /* côtés d'une pièce : début, fin, direction, longueur */
    var P=p.p,out=[];for(var i=0;i<P.length;i++){var a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);out.push({a:a,b:b,d:[(b[0]-a[0])/L,(b[1]-a[1])/L],L:L,i:i})}return out};
  RT.piece=function(id){for(var i=0;i<RT.PIECES.length;i++)if(RT.PIECES[i].id===id)return RT.PIECES[i]};
  /* ouvertures vues sur un côté de pièce : x depuis l'angle gauche */
  RT.ouvMur=function(m){var r=[];RT.OUV.forEach(function(o){
    function proj(q){return [(q[0]-m.a[0])*m.d[0]+(q[1]-m.a[1])*m.d[1],Math.abs((q[0]-m.a[0])*m.d[1]-(q[1]-m.a[1])*m.d[0])]}
    var A=proj(o.a),B=proj(o.b);if(A[1]>2||B[1]>2)return;var x1=Math.min(A[0],B[0]),x2=Math.max(A[0],B[0]);
    if(x2<=1||x1>=m.L-1)return;r.push({o:o,x1:Math.max(0,x1),x2:Math.min(m.L,x2)})});
    return r.sort(function(a,b){return a.x1-b.x1})};
  RT.cm=function(v){v=Math.round(v);return v+' cm'};
  RT.m=function(v){return (v/100).toFixed(2).replace('.',',')+' m'};
})();
