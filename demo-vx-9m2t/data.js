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
  /* poseurs sous-traitants : papiers = URSSAF (vigilance), décennale, Kbis ; jours = 'libre' | id dossier | 'ail' (autre agence) | 'off' */
  VX.POSEURS={
    kb:{n:'KB Pose',qui:'Karim B.',nb:2,tel:'06 00 00 00 21',c:'a',pap:{urssaf:['ok','valable jusqu\'au 12/04/2027'],dec:['ok','valable jusqu\'au 31/12/2026'],kbis:['ok','moins de 3 mois']},poses:9,reserves:1},
    duval:{n:'Pose Alpes',qui:'Équipe Duval',nb:3,tel:'06 00 00 00 22',c:'b',pap:{urssaf:['ok','valable jusqu\'au 02/03/2027'],dec:['warn','expire le 28/11/2026'],kbis:['ok','moins de 3 mois']},poses:12,reserves:0},
    tl:{n:'TL Menuiseries',qui:'Thomas L.',nb:1,tel:'06 00 00 00 23',c:'c',pap:{urssaf:['alert','expirée depuis le 05/11/2026'],dec:['ok','valable jusqu\'au 30/06/2027'],kbis:['ok','moins de 3 mois']},poses:4,reserves:2}
  };
  VX.PLANNING0={kb:['petit','libre','libre','garcia','garcia'],duval:['roux','roux','ail','ail','libre'],tl:['off','off','off','off','off']};
  /* dossiers clients : e = étape (index VX.ETAPES) */
  VX.DOSSIERS=[
    {id:'durand',cl:'M. et Mme Durand',v:'Voiron',com:'julien',e:0,fab:'Millet',nbm:6,quoi:'5 fenêtres et 1 porte d\'entrée, PVC',rdv:'Lundi 16 · 10 h 00',suite:'Métré chez le client à 10 h',tel:'06 00 00 01 01',x:118,y:96},
    {id:'blanc',cl:'M. Blanc',v:'Moirans',com:'julien',e:1,fab:'Minco',nbm:4,quoi:'4 fenêtres bois-alu',mt:'6 850 €',suite:'Devis envoyé il y a 8 jours, sans réponse',relance:true,tel:'06 00 00 01 02',x:86,y:132},
    {id:'lopez',cl:'SCI Lopez',v:'Tullins',com:'sarah',e:2,fab:'K·LINE',nbm:7,quoi:'7 menuiseries alu, bureaux',mt:'18 900 €',suite:'Signé hier : commande à passer',tel:'06 00 00 01 03',x:40,y:150},
    {id:'martin',cl:'Mme Martin',v:'Coublevie',com:'julien',e:3,fab:'K·LINE',nbm:3,quoi:'2 fenêtres et 1 porte-fenêtre alu',mt:'7 420 €',suite:'ARC reçu ce matin : à contrôler',arc:true,tel:'06 00 00 01 04',x:132,y:72},
    {id:'moreau',cl:'M. Moreau',v:'Saint-Égrève',com:'sarah',e:3,fab:'Bouvet',nbm:2,quoi:'2 baies coulissantes alu',mt:'9 300 €',suite:'Fabrication : livraison annoncée semaine 48',liv:'Semaine 48',tel:'06 00 00 01 05',x:214,y:170},
    {id:'garcia',cl:'M. Garcia',v:'Saint-Jean-de-Moirans',com:'julien',e:4,fab:'Millet',nbm:5,quoi:'5 fenêtres PVC + volets roulants',mt:'8 760 €',suite:'Livré à l\'agence · pose jeudi et vendredi par KB Pose',pose:'kb',tel:'06 00 00 01 06',x:98,y:112},
    {id:'bernard',cl:'M. Bernard',v:'Grenoble',com:'sarah',e:4,fab:'Tryba',nbm:4,quoi:'4 fenêtres PVC',mt:'5 980 €',suite:'Livré à l\'agence · pose à caler',acaler:true,tel:'06 00 00 01 07',x:250,y:196},
    {id:'roux',cl:'Famille Roux',v:'Voreppe',com:'julien',e:5,fab:'Tryba',nbm:3,quoi:'1 porte d\'entrée alu + 2 baies',mt:'11 240 €',suite:'Pose en cours (lundi et mardi) · Pose Alpes',pose:'duval',tel:'06 00 00 01 08',x:170,y:130},
    {id:'petit',cl:'M. Petit',v:'Rives',com:'julien',e:6,fab:'Millet',nbm:4,quoi:'4 fenêtres PVC',mt:'5 120 €',suite:'Posé · 1 réserve : volet de la chambre à régler lundi',sav:true,pose:'kb',tel:'06 00 00 01 09',x:60,y:70}
  ];
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
  /* ARC Martin : cotes prises / ARC du fabricant (l'écart ressort) */
  VX.ARC=[
    {no:1,t:'Fenêtre 2 vantaux',l:[['Haut × Larg','1350 × 1180','1350 × 1180'],['Ouverture','Oscillo-battant','Oscillo-battant'],['Teinte ext.','Gris 7016','Gris 7016']]},
    {no:2,t:'Porte-fenêtre 2 vantaux',l:[['Haut × Larg','2150 × 1400','2150 × 1400'],['Vantail de service','Droite (vue int.)','Gauche (vue int.)'],['Seuil','Seuil PMR','Seuil PMR']]},
    {no:3,t:'Fenêtre 1 vantail',l:[['Haut × Larg','1000 × 800','1100 × 800'],['Ouverture','Oscillo-battant','Oscillo-battant'],['Vitrage','Dépoli','Dépoli']]}
  ];
  VX.CHIF={julien:{cours:14,dev:6,sig:3,ca:'28 400 €',tx:'38 %'},sarah:{cours:11,dev:5,sig:4,ca:'31 200 €',tx:'44 %'}};
  VX.dos=function(id){return VX.DOSSIERS.filter(function(d){return d.id===id})[0]};
  /* état partagé (étapes qui avancent, planning, fil d'activité) */
  VX.etat0=function(){return {role:'com',et:{},pl:JSON.parse(JSON.stringify(VX.PLANNING0)),fil:[],cotes:{},arcOk:null,poseOk:{},relance:{},livOk:false,options:{}}};
})();
