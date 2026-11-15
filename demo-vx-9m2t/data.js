/* Démo ProClik « Espace menuiserie » pour un négoce de matériaux : données d'exemple partagées entre l'Espace et la prise de cotes.
   Tout est fictif (Valcroix Matériaux, clients, poseurs, montants) et reste dans ce navigateur (aucun envoi). */
(function(){
  var VX=window.VX={};
  VX.NEGOCE='Valcroix Matériaux';
  VX.AGENCE='Agence de Voiron';
  VX.ROLES={agence:'Agence',com:'Commercial',adv:'ADV',poseur:'Poseur'};
  VX.NOMS={agence:'Philippe',com:'Julien',adv:'Nadia',poseur:'Karim'};
  VX.FONCT={agence:'Responsable menuiserie',com:'Commercial menuiserie',adv:'Administration des ventes',poseur:'KB Pose · sous-traitant'};
  VX.ETAPES=['Métré','Devis','Signé','Commande','Livraison','Pose','Terminé'];
  VX.JOURS=['Lun 16','Mar 17','Mer 18','Jeu 19','Ven 20'];
  VX.JL=['Lundi 16','Mardi 17','Mercredi 18','Jeudi 19','Vendredi 20'];
  /* commerciaux */
  VX.COMS={julien:{n:'Julien',nom:'Julien Morel',tel:'06 00 00 00 11'},sarah:{n:'Sarah',nom:'Sarah Pons',tel:'06 00 00 00 12'}};
  /* poseurs sous-traitants (un poseur peut aussi faire le métré : jour 'm:id dossier') : papiers = URSSAF (vigilance), décennale, Kbis ; jours = 'libre' | id dossier | 'ail' (autre agence) | 'off' */
  VX.POSEURS={
    kb:{n:'KB Pose',qui:'Karim B.',nb:2,tel:'06 00 00 00 21',c:'a',pap:{urssaf:['ok','valable jusqu\'au 12/04/2027'],dec:['ok','valable jusqu\'au 31/12/2026'],kbis:['ok','moins de 3 mois']},poses:9,reserves:1},
    duval:{n:'Pose Alpes',qui:'Équipe Duval',nb:3,tel:'06 00 00 00 22',c:'b',pap:{urssaf:['ok','valable jusqu\'au 02/03/2027'],dec:['warn','expire le 28/11/2026'],kbis:['ok','moins de 3 mois']},poses:12,reserves:0},
    tl:{n:'TL Menuiseries',qui:'Thomas L.',nb:1,tel:'06 00 00 00 23',c:'c',pap:{urssaf:['alert','expirée depuis le 05/11/2026'],dec:['ok','valable jusqu\'au 30/06/2027'],kbis:['ok','moins de 3 mois']},poses:4,reserves:2}
  };
  VX.PLANNING0={kb:['petit','m:tessier','libre','garcia','garcia'],duval:['roux','roux','ail','ail','libre'],tl:['off','off','off','off','off']};
  /* dossiers clients : e = étape (index VX.ETAPES) */
  VX.DOSSIERS=[
    {id:'durand',att:0,cl:'M. et Mme Durand',v:'Voiron',com:'julien',e:0,fab:'Millet',nbm:6,quoi:'5 fenêtres et 1 porte d\'entrée, PVC',rdv:'Lundi 16 · 10 h 00',suite:'Métré chez le client à 10 h',tel:'06 00 00 01 01',x:118,y:96},
    {id:'blanc',att:8,cl:'M. Blanc',v:'Moirans',com:'julien',e:1,fab:'Minco',nbm:4,quoi:'4 fenêtres bois-alu',mt:'6 850 €',suite:'Devis envoyé il y a 8 jours, sans réponse',relance:true,tel:'06 00 00 01 02',x:86,y:132},
    {id:'lopez',att:1,cl:'SCI Lopez',v:'Tullins',com:'sarah',e:2,fab:'K·LINE',nbm:7,quoi:'7 menuiseries alu, bureaux',mt:'18 900 €',suite:'Signé hier : commande à passer',tel:'06 00 00 01 03',x:40,y:150},
    {id:'martin',att:0,cl:'Mme Martin',v:'Coublevie',com:'julien',e:3,fab:'K·LINE',nbm:3,quoi:'2 fenêtres et 1 porte-fenêtre alu',mt:'7 420 €',suite:'ARC reçu ce matin : à contrôler',arc:true,tel:'06 00 00 01 04',x:132,y:72},
    {id:'moreau',att:2,cl:'M. Moreau',v:'Saint-Égrève',com:'sarah',e:3,fab:'Bouvet',nbm:2,quoi:'2 baies coulissantes alu',mt:'9 300 €',suite:'Fabrication : livraison annoncée semaine 48',liv:'Semaine 48',tel:'06 00 00 01 05',x:214,y:170},
    {id:'garcia',cl:'M. Garcia',v:'Saint-Jean-de-Moirans',com:'julien',e:4,fab:'Millet',nbm:5,quoi:'5 fenêtres PVC + volets roulants',mt:'8 760 €',suite:'Livré à l\'agence · pose jeudi et vendredi par KB Pose',pose:'kb',tel:'06 00 00 01 06',x:98,y:112},
    {id:'bernard',att:3,cl:'M. Bernard',v:'Grenoble',com:'sarah',e:4,fab:'Tryba',nbm:4,quoi:'4 fenêtres PVC',mt:'5 980 €',suite:'Livré à l\'agence · pose à caler',acaler:true,tel:'06 00 00 01 07',x:250,y:196},
    {id:'roux',cl:'Famille Roux',v:'Voreppe',com:'julien',e:5,fab:'Tryba',nbm:3,quoi:'1 porte d\'entrée alu + 2 baies',mt:'11 240 €',suite:'Pose en cours (lundi et mardi) · Pose Alpes',pose:'duval',tel:'06 00 00 01 08',x:170,y:130},
    {id:'chabert',att:0,cl:'Mme Chabert',v:'Voiron',com:'sarah',e:3,fab:'Millet',nbm:6,quoi:'6 fenêtres PVC + 2 volets roulants',mt:'9 870 €',suite:'ARC confirmé : arrivée jeudi 19 à l\'agence',tel:'06 00 00 01 10',x:120,y:100},
    {id:'tessier',att:0,cl:'Mme Tessier',v:'Réaumont',com:'julien',e:0,fab:'Millet',nbm:3,quoi:'3 fenêtres PVC',rdv:'Mardi 17 · 14 h 00',metre:'kb',suite:'Métré confié à Karim (KB Pose) · mardi 14 h',tel:'06 00 00 01 11',x:150,y:60},
    {id:'petit',att:5,cl:'M. Petit',v:'Rives',com:'julien',e:6,fab:'Millet',nbm:4,quoi:'4 fenêtres PVC',mt:'5 120 €',suite:'Posé · 1 réserve : volet de la chambre à régler lundi',sav:true,pose:'kb',tel:'06 00 00 01 09',x:60,y:70}
  ];
  /* anciens dossiers terminés (pour voir la liste tenir avec beaucoup de clients) : noms et villes fictifs */
  (function(){var N=['M. Arnaud','Mme Barbier','M. Benoit','Mme Bertrand','M. Blanchard','Mme Bonnet','M. Boyer','Mme Brun','M. Carpentier','Mme Caron','M. Clément','Mme Colin','M. Dupuis','Mme Fabre','M. Faure','Mme Fleury','M. Fontaine','Mme Gauthier','M. Gérard','Mme Giraud','M. Guérin','Mme Henry','M. Joly','Mme Lacroix','M. Lambert','Mme Lefèvre','M. Lemaire','Mme Mallet','M. Masson','Mme Mercier','M. Meyer','Mme Michaud','M. Noël','Mme Perrin','M. Picard','Mme Renaud','M. Rolland','Mme Vidal'],
    V=['Voiron','Moirans','Rives','Coublevie','Voreppe','Tullins','Saint-Égrève','Grenoble','Réaumont','La Buisse'],F=['Millet','Minco','K·LINE','Tryba','Bouvet'],
    Q=['fenêtres PVC','fenêtres bois-alu','menuiseries alu','fenêtres PVC + volets roulants','porte d\'entrée alu'],M=['octobre','septembre','août','juillet','juin','mai'];
    N.forEach(function(n,i){var nb=2+(i*7)%6;VX.DOSSIERS.push({id:'a'+i,old:1,cl:n,v:V[(i*3)%V.length],com:i%2?'sarah':'julien',e:6,fab:F[i%F.length],nbm:nb,quoi:nb+' '+Q[i%Q.length],
      mt:(3+(i*13)%15)+' '+String(100+(i*37)%900)+' €',suite:'Posé en '+M[i%M.length]+' · PV signé',tel:'06 00 00 0'+(2+i%7)+' '+String(10+i).slice(-2)})})})();
  /* menuiseries de chaque dossier pour la fiche de cotes (le dossier Durand garde l'exemple complet de la prise de cotes) */
  VX.MEN={
    blanc:[['Séjour','Fenêtre',1180,1350,'2'],['Cuisine','Fenêtre',1000,1250,'1'],['Chambre','Fenêtre',1200,1350,'2'],['Salle de bain','Fenêtre',600,800,'1']],
    lopez:[['Accueil','Porte d\'entrée',1100,2200,'1'],['Bureau 1','Fenêtre',1400,1350,'2'],['Bureau 2','Fenêtre',1400,1350,'2'],['Bureau 3','Fenêtre',1400,1350,'2'],['Salle de réunion','Baie coulissante',2400,2150,'2'],['Sanitaires','Fenêtre',600,600,'1'],['Cuisine','Fenêtre',1000,1250,'1']],
    martin:[['Séjour','Fenêtre',1180,1350,'2'],['Séjour','Porte-fenêtre',1400,2150,'2'],['Bureau','Fenêtre',800,1000,'1']],
    moreau:[['Séjour','Baie coulissante',2400,2150,'2'],['Chambre','Baie coulissante',1800,2150,'2']],
    garcia:[['Séjour','Fenêtre',1200,1350,'2'],['Cuisine','Fenêtre',1000,1250,'1'],['Chambre 1','Fenêtre',1200,1350,'2'],['Chambre 2','Fenêtre',1000,1250,'2'],['Salle de bain','Fenêtre',600,800,'1']],
    bernard:[['Séjour','Fenêtre',1200,1350,'2'],['Cuisine','Fenêtre',1000,1250,'1'],['Chambre','Fenêtre',1000,1250,'2'],['WC','Fenêtre',500,600,'1']],
    roux:[['Entrée','Porte d\'entrée',900,2150,'1'],['Séjour','Baie coulissante',2400,2150,'2'],['Chambre','Baie coulissante',1800,2150,'2']],
    petit:[['Séjour','Fenêtre',1200,1350,'2'],['Cuisine','Fenêtre',1000,1250,'1'],['Chambre','Fenêtre',1200,1350,'2'],['Salle de bain','Fenêtre',600,800,'1']]
  };
  /* métré confié au poseur : l'agence connaît seulement les pièces, Karim mesure tout */
  VX.MEN.tessier=[['Séjour','Fenêtre'],['Chambre','Fenêtre'],['Salle de bain','Fenêtre']];
  /* ARC Martin : cotes prises / ARC du fabricant (l'écart ressort) */
  VX.MEN.chabert=[['Séjour','Fenêtre',1200,1350,'2'],['Cuisine','Fenêtre',1000,1250,'1'],['Chambre 1','Fenêtre',1200,1350,'2'],['Chambre 2','Fenêtre',1000,1250,'2'],['Bureau','Fenêtre',800,1000,'1'],['Salle de bain','Fenêtre',600,800,'1']];
  /* délais habituels par fabricant (exemples, à remplacer par ceux d'ERAL) */
  VX.DELAIS={'Millet':'5 sem.','Minco':'6 sem.','K·LINE':'7 sem.','Tryba':'4 sem.','Bouvet':'6 sem.'};
  VX.ARC=[
    {no:1,t:'Fenêtre 2 vantaux',l:[['Haut × Larg','1350 × 1180','1350 × 1180'],['Ouverture','Oscillo-battant','Oscillo-battant'],['Teinte ext.','Gris 7016','Gris 7016']]},
    {no:2,t:'Porte-fenêtre 2 vantaux',l:[['Haut × Larg','2150 × 1400','2150 × 1400'],['Vantail de service','Droite (vue int.)','Gauche (vue int.)'],['Seuil','Seuil PMR','Seuil PMR']]},
    {no:3,t:'Fenêtre 1 vantail',l:[['Haut × Larg','1000 × 800','1100 × 800'],['Ouverture','Oscillo-battant','Oscillo-battant'],['Vitrage','Dépoli','Dépoli']]}
  ];
  /* plans du logement (même format que le plan du formulaire) : pièces en rectangles [nom,x,y,larg,prof] en mètres,
     ouvertures [pièce, mur (0 haut,1 droite,2 bas,3 gauche), type, larg, haut, matériau] posées au milieu du mur */
  VX.PLANS={
    durand:{p:[['Entrée',0,0,2,4],['Séjour',2,0,5,4],['Cuisine',7,0,3,4],['Chambre 1',2,4,4,3.5],['Chambre 2',6,4,4,3.5]],o:[[0,3,'porte',.9,2.15],[1,0,'fenetre',1.2,1.35,1.2],[1,0,'fenetre',1.2,1.35,3],[2,1,'fenetre',1,1.25],[3,2,'fenetre',1.2,1.35],[4,2,'fenetre',1,1.25]],m:'PVC'},
    garcia:{p:[['Séjour',0,0,5,4.5],['Cuisine',5,0,3.5,4.5],['Chambre 1',0,4.5,3.5,3.5],['Chambre 2',3.5,4.5,3,3.5],['Salle de bain',6.5,4.5,2,3.5]],o:[[0,0,'fenetre',1.2,1.35],[1,0,'fenetre',1,1.25],[2,2,'fenetre',1.2,1.35],[3,2,'fenetre',1,1.25],[4,1,'fenetre',.6,.8]],m:'PVC'},
    martin:{p:[['Séjour',0,0,6,4],['Bureau',6,0,3,4],['Cuisine',0,4,4,3]],o:[[0,0,'fenetre',1.18,1.35],[0,2,'pf',1.4,2.15,1],[1,1,'fenetre',.8,1]],m:'Aluminium'},
    roux:{p:[['Entrée',0,0,2,5],['Séjour',2,0,6,5],['Chambre',8,0,3.5,5]],o:[[0,3,'porte',.9,2.15],[1,2,'pf',2.4,2.15,0,1],[2,2,'pf',1.8,2.15,0,1]],m:'Aluminium'},
    petit:{p:[['Séjour',0,0,5,4],['Cuisine',5,0,3,4],['Chambre',0,4,4,3.5],['Salle de bain',4,4,2.5,3.5]],o:[[0,0,'fenetre',1.2,1.35],[1,0,'fenetre',1,1.25],[2,2,'fenetre',1.2,1.35],[3,2,'fenetre',.6,.8]],m:'PVC'},
    chabert:{p:[['Séjour',0,0,5,4.5],['Cuisine',5,0,3.5,4.5],['Bureau',8.5,0,3,4.5],['Chambre 1',0,4.5,3.5,3.5],['Chambre 2',3.5,4.5,3,3.5],['Salle de bain',6.5,4.5,2,3.5]],o:[[0,0,'fenetre',1.2,1.35],[1,0,'fenetre',1,1.25],[2,1,'fenetre',.8,1],[3,2,'fenetre',1.2,1.35],[4,2,'fenetre',1,1.25],[5,2,'fenetre',.6,.8]],m:'PVC'}
  };
  /* plan au format du formulaire (proclik-plan-load) */
  VX.planJSON=function(id){var P=VX.PLANS[id];if(!P)return null;
    var pieces=P.p.map(function(r,ri){var x=r[1],y=r[2],w=r[3],h=r[4],pts=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
      return {nom:r[0],points:pts,murs:pts.map(function(a,i){var b=pts[(i+1)%4],L=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);
        return {ouvertures:P.o.filter(function(o){return o[0]===ri&&o[1]===i}).map(function(o){var pf=o[2]!=='fenetre';
          return {k:o[2],w:o[3],h:o[4],p:o[5]!=null&&o[5]>0?o[5]:+((L-o[3])/2).toFixed(2),al:pf?0:(o[4]<1?1.2:.9),a_changer:'Oui, à changer',materiau:o[2]==='porte'?null:P.m,ouv:o[6]?'Coulissant':null}})}})}});
    return {floors:[{nom:'Rez-de-chaussée',hauteur_m:2.5,pieces:pieces}]}};
  VX.CHIF={julien:{cours:14,dev:6,sig:3,ca:'28 400 €',tx:'38 %'},sarah:{cours:11,dev:5,sig:4,ca:'31 200 €',tx:'44 %'}};
  VX.dos=function(id){return VX.DOSSIERS.filter(function(d){return d.id===id})[0]};
  /* état partagé (étapes qui avancent, planning, fil d'activité) */
  VX.etat0=function(){return {role:'com',et:{},pl:JSON.parse(JSON.stringify(VX.PLANNING0)),fil:[],cotes:{},arcOk:null,poseOk:{},relance:{},livOk:false,options:{}}};
})();
