/* ================================================================================================
   ESPACE D'EXEMPLE réglé sur le métier de l'entreprise invitée (Cyril 19/11).
   S'ouvre depuis la page de l'entreprise invitée : index.html?exemple=<icône métier>&nom=<entreprise>&m=<métier>
   - au nom de l'entreprise, avec son icône de métier ;
   - le contenu d'exemple suit son métier (électricien, plombier, peintre ; plaquiste = l'exemple de base) ;
   - rien n'est gardé : les données de l'exemple sont effacées à chaque ouverture (entreprise.js) ;
   - un bandeau « Exemple » avec un seul bouton « Je veux le mien ».
   Les montants restent des chiffres d'exemple, jamais de vrais prix.
   ================================================================================================ */
(function(){
var q=new URLSearchParams(location.search),k=q.get('exemple');if(!k)return;
var nom=(q.get('nom')||'').trim().slice(0,60)||'Votre entreprise',met=(q.get('m')||'').trim().slice(0,40);
document.documentElement.classList.add('pc-ex');

/* Remplacements du contenu d'exemple (base = plaquiste). Clé : texte de l'exemple de base → texte du métier.
   Les plus longs passent d'abord ; la version en minuscule est ajoutée toute seule. */
var R={
 elec:{
  'Ossature':'Tableau','Isolation':'Appareillage','commandes@placo-dauphine.example':'commandes@elec-dauphine.example',
  'Faux plafond sur ossature métallique, plaques BA13':'Rénovation électrique : saignées, gaines et câbles',
  'Bandes et joints, prêt à peindre (2 faces)':'Appareillage posé et raccordé',
  'Bandes et joints, prêt à peindre':'Appareillage posé et raccordé',
  'Faux plafond 32 m² · local professionnel':'Rénovation électrique · local professionnel',
  'Faux plafond 32 m²':'Rénovation électrique 32 m²',
  'Faux plafond : dalles 60 × 60 blanches, validé avec le client.':'Spots LED encastrés blancs, validés avec le client.',
  'Faux plafond du fournil':'Tableau électrique du fournil',
  'Faux plafond de bureau':'Éclairage de bureau','Faux plafond de cuisine':'Prises de cuisine','Faux plafond du salon':'Éclairage du salon',
  'Faux plafond':'Éclairage',
  'Cloison de salle de bain · plaques hydro':'Électricité de salle de bain · mise aux normes',
  'Cloison de salle de bain':'Électricité de salle de bain',
  'Cloisons du séjour':'Prises et éclairage du séjour',
  'Doublage des chambres':'Prises des chambres','Doublage du garage':'Éclairage du garage',
  'Doublage isolant des deux chambres, plaques et bandes, prêt à peindre':'Prises et éclairage des deux chambres, posés et raccordés',
  'Isolation des combles perdus, isolant soufflé, trappe isolée':'Tableau électrique neuf, mise aux normes NF C 15-100',
  'Isolation des combles':'Tableau électrique neuf',
  '2 fenêtres PVC':'2 volets roulants motorisés',
  'Fenêtre PVC 2 vantaux 120 × 135':'Moteur de volet roulant filaire',
  'Menuiseries des Alpes':'Volets & Motorisations Alpes','Fenêtres, portes-fenêtres':'Volets, moteurs, automatismes',
  'Placo Dauphiné':'Élec Dauphiné Distribution','Plaques, rails, enduits':'Câbles, tableaux, appareillage',
  'Isolants, quincaillerie':'Quincaillerie, chevilles',
  'Protection et ossature':'Saignées et gaines','Pose des plaques':'Passage des câbles','Bandes et joints':'Appareillage et raccordement',
  'Nettoyage et réception':'Essais et réception','Porte et finitions':'Tableau et finitions','Pose de l\'isolant':'Pose du tableau',
  'Trappe et finitions':'Essais et étiquetage',
  'Plaques BA13 hydro (complément)':'Câble R2V 3G2,5 (complément)','Plaques BA13 hydro':'Câble R2V 3G1,5',
  'Plaque BA13 hydro 120 × 250':'Câble R2V 3G1,5 · couronne 100 m','Plaque BA13 standard 120 × 250':'Câble R2V 3G2,5 · couronne 100 m',
  'Plaques BA13 · 1,20 × 2,50 m':'Câble R2V 3G2,5 · 100 m','Plaque BA13 standard':'Câble R2V 3G2,5','Plaque BA13 phonique':'Câble R2V 5G6',
  'Plaques BA13':'Câble R2V 3G2,5','Plaque BA13':'Câble R2V',
  'Fourrures F530 (3 m)':'Gaine ICTA 20 (100 m)','Fourrures F530 · 3,00 m':'Gaine ICTA 20 · 100 m','Fourrure F530':'Gaine ICTA 20',
  'Suspentes':'Boîtes d\'encastrement','Suspente':'Boîte d\'encastrement',
  'Vis TTPC 25 · boîte de 1 000':'Bornes de connexion · boîte de 100','Vis TTPC 25':'Bornes de connexion',
  'Bande à joint · rouleau 150 m':'Spot LED encastrable · lot de 10','Bande à joint':'Spots LED encastrables',
  'Enduit à joint · sac de 25 kg':'Plâtre de rebouchage · sac de 5 kg','Enduit à joint':'Plâtre de rebouchage',
  'Laine minérale 45 mm':'Prises 2P+T','Bande armée d\'angle':'Interrupteurs va-et-vient',
  'Rail R48 · 3 m':'Disjoncteur 16 A','Rail R48':'Disjoncteur 16 A','Montant M48 · 3 m':'Interrupteur différentiel 30 mA','Montant M48':'Interrupteur différentiel 30 mA',
  'Laine soufflée':'Tableau 3 rangées équipé',
  'Plaques et cloisons':'Câbles et gaines','Enduits et bandes':'Éclairage','Visserie et fixations':'Connexion et fixations',
  'Ossature terminée':'Saignées terminées','Plaques posées':'Câbles passés','Bandes, côté fenêtre':'Appareillage, côté fenêtre',
  'Plafond couvert à 100 %. Trappe de visite non visible : à vérifier.':'Câbles passés à 100 %. Repérage des circuits : à vérifier.',
  'Joints faits sur environ 40 % de la surface.':'Prises posées sur environ 40 % de la surface.',
  'Entraxe régulier, environ 60 cm. Rien d\'anormal.':'Saignées droites, gaines bien fixées. Rien d\'anormal.',
  'Fissure d\'angle possible : bande armée conseillée.':'Angle nord : prévoir un va-et-vient.',
  'Angle nord : prévoir une bande armée.':'Angle nord : prévoir un va-et-vient.',
  'Un faux plafond dans la salle d\'attente, 32 m² environ.':'Refaire l\'électricité de la salle d\'attente, 32 m² environ.',
  'Hauteur sous plafond 2,70 m, réseau électrique à reprendre par l\'électricien.':'Tableau ancien sans différentiel : à remplacer.',
  'Une cloison dans mon séjour pour faire un bureau, avec une porte.':'Des prises et un éclairage pour faire un coin bureau dans mon séjour.',
  'Séparer ma salle de bain avec une cloison et une porte.':'Mettre l\'électricité de ma salle de bain aux normes.',
  'Pièce humide : plaques hydrofuges proposées.':'Pièce d\'eau : volumes de sécurité à respecter.',
  'Pièce humide : plaques hydrofuges. Porte de 73 cm côté couloir.':'Pièce d\'eau : volumes à respecter. Interrupteur côté couloir.',
  'Refaire toutes les cloisons de l\'étage, environ 60 m².':'Refaire toute l\'électricité de l\'étage, environ 60 m².',
  'Isolant posé sur toute la surface, trappe refermée.':'Tableau posé, circuits repérés, essais faits.','Isolant posé sur toute la surface.':'Tableau posé, circuits repérés.',
  'Combles terminés':'Tableau terminé',
  'Il me manque 6 plaques et 2 rails pour Alpes Kiné.':'Il me manque 2 couronnes de câble et 6 boîtes pour Alpes Kiné.',
  'Le BA13 passe à 2,79 euros chez Placo Dauphiné.':'Le câble 3G2,5 passe à 89 euros chez Élec Dauphiné Distribution.',
  'Chercher : BA13, vis, laine…':'Chercher : câble, prise, spot…','Tapez : ba13, rail, laine…':'Tapez : câble, prise, spot…',
  'Chercher : cloison, pose…':'Chercher : prise, tableau…','Tapez : pose, cloison, joints…':'Tapez : prise, tableau, spot…',
  'ossature':'saignées','plaques':'câblage','bandes et joints':'appareillage'
 },
 plomb:{
  'Ossature':'Évacuation','Isolation':'Chauffe-eau','commandes@placo-dauphine.example':'commandes@plomberie-dauphine.example',
  'Faux plafond sur ossature métallique, plaques BA13':'Réseau d\'eau en multicouche, alimentation et évacuation',
  'Bandes et joints, prêt à peindre (2 faces)':'Appareils posés et raccordés',
  'Bandes et joints, prêt à peindre':'Appareils posés et raccordés',
  'Faux plafond 32 m² · local professionnel':'Sanitaires · local professionnel',
  'Faux plafond 32 m²':'Sanitaires du cabinet',
  'Faux plafond : dalles 60 × 60 blanches, validé avec le client.':'Lavabos blancs suspendus, validés avec le client.',
  'Faux plafond du fournil':'Chauffe-eau du fournil',
  'Faux plafond de bureau':'Point d\'eau de bureau','Faux plafond de cuisine':'Évier de cuisine','Faux plafond du salon':'Radiateurs du salon',
  'Faux plafond':'Sanitaires',
  'Cloison de salle de bain · plaques hydro':'Salle de bain · douche à l\'italienne',
  'Cloison de salle de bain':'Douche de salle de bain',
  'Cloisons du séjour':'Radiateurs du séjour',
  'Doublage des chambres':'Radiateurs des chambres','Doublage du garage':'Point d\'eau du garage',
  'Doublage isolant des deux chambres, plaques et bandes, prêt à peindre':'Deux radiateurs neufs posés et raccordés',
  'Isolation des combles perdus, isolant soufflé, trappe isolée':'Chauffe-eau thermodynamique 200 L posé et raccordé',
  'Isolation des combles':'Chauffe-eau neuf',
  '2 fenêtres PVC':'2 WC suspendus','Fenêtre PVC 2 vantaux 120 × 135':'Bâti-support WC suspendu',
  'Menuiseries des Alpes':'Sanitaires des Alpes','Fenêtres, portes-fenêtres':'WC, lavabos, douches',
  'Placo Dauphiné':'Plomberie Dauphiné Distribution','Plaques, rails, enduits':'Tubes, raccords, robinetterie',
  'Isolants, quincaillerie':'Quincaillerie, joints',
  'Protection et ossature':'Dépose et protection','Pose des plaques':'Alimentation et évacuation','Bandes et joints':'Pose des appareils',
  'Nettoyage et réception':'Mise en eau et réception','Porte et finitions':'Raccordements et finitions','Pose de l\'isolant':'Pose du chauffe-eau',
  'Trappe et finitions':'Mise en service',
  'Plaques BA13 hydro (complément)':'Tube multicouche 16 (complément)','Plaques BA13 hydro':'Tube multicouche 16',
  'Plaque BA13 hydro 120 × 250':'Tube multicouche 16 · couronne 50 m','Plaque BA13 standard 120 × 250':'Tube multicouche 20 · couronne 50 m',
  'Plaques BA13 · 1,20 × 2,50 m':'Tube multicouche 20 · 50 m','Plaque BA13 standard':'Tube multicouche 20','Plaque BA13 phonique':'Tube PVC 100',
  'Plaques BA13':'Tube multicouche 20','Plaque BA13':'Tube multicouche',
  'Fourrures F530 (3 m)':'Tube PVC 40 (2 m)','Fourrures F530 · 3,00 m':'Tube PVC 40 · 2,00 m','Fourrure F530':'Tube PVC 40',
  'Suspentes':'Raccords à sertir','Suspente':'Raccord à sertir',
  'Vis TTPC 25 · boîte de 1 000':'Colliers de fixation · boîte de 100','Vis TTPC 25':'Colliers de fixation',
  'Bande à joint · rouleau 150 m':'Siphon de lavabo · lot de 2','Bande à joint':'Siphons',
  'Enduit à joint · sac de 25 kg':'Colle PVC · pot de 250 ml','Enduit à joint':'Colle PVC',
  'Laine minérale 45 mm':'Lavabo suspendu','Bande armée d\'angle':'Robinets d\'arrêt',
  'Rail R48 · 3 m':'Mitigeur de lavabo','Rail R48':'Mitigeur de lavabo','Montant M48 · 3 m':'Bonde de douche','Montant M48':'Bonde de douche',
  'Laine soufflée':'Chauffe-eau thermodynamique 200 L',
  'Plaques et cloisons':'Tubes et raccords','Enduits et bandes':'Sanitaires','Visserie et fixations':'Fixations et joints',
  'Ossature terminée':'Dépose terminée','Plaques posées':'Réseau posé','Bandes, côté fenêtre':'Lavabos, côté fenêtre',
  'Plafond couvert à 100 %. Trappe de visite non visible : à vérifier.':'Réseau posé à 100 %. Essai de pression : à faire.',
  'Joints faits sur environ 40 % de la surface.':'Appareils posés à environ 40 %.',
  'Entraxe régulier, environ 60 cm. Rien d\'anormal.':'Anciens tuyaux retirés. Rien d\'anormal.',
  'Fissure d\'angle possible : bande armée conseillée.':'Angle nord : prévoir un robinet d\'arrêt.',
  'Angle nord : prévoir une bande armée.':'Angle nord : prévoir un robinet d\'arrêt.',
  'Un faux plafond dans la salle d\'attente, 32 m² environ.':'Refaire les sanitaires du cabinet : 2 lavabos et un WC.',
  'Hauteur sous plafond 2,70 m, réseau électrique à reprendre par l\'électricien.':'Anciens tuyaux en acier : à remplacer.',
  'Une cloison dans mon séjour pour faire un bureau, avec une porte.':'Changer les radiateurs de mon séjour.',
  'Séparer ma salle de bain avec une cloison et une porte.':'Remplacer ma baignoire par une douche à l\'italienne.',
  'Pièce humide : plaques hydrofuges proposées.':'Évacuation à vérifier : pente suffisante ?',
  'Pièce humide : plaques hydrofuges. Porte de 73 cm côté couloir.':'Évacuation au sol possible. Arrivée d\'eau côté couloir.',
  'Refaire toutes les cloisons de l\'étage, environ 60 m².':'Refaire toute la plomberie de l\'étage.',
  'Isolant posé sur toute la surface, trappe refermée.':'Chauffe-eau posé, mis en eau, réglé.','Isolant posé sur toute la surface.':'Chauffe-eau posé et mis en eau.',
  'Combles terminés':'Chauffe-eau terminé',
  'Il me manque 6 plaques et 2 rails pour Alpes Kiné.':'Il me manque 2 couronnes de tube et 6 raccords pour Alpes Kiné.',
  'Le BA13 passe à 2,79 euros chez Placo Dauphiné.':'Le tube multicouche passe à 72 euros chez Plomberie Dauphiné Distribution.',
  'Chercher : BA13, vis, laine…':'Chercher : tube, raccord, mitigeur…','Tapez : ba13, rail, laine…':'Tapez : tube, raccord, mitigeur…',
  'Chercher : cloison, pose…':'Chercher : douche, pose…','Tapez : pose, cloison, joints…':'Tapez : pose, douche, WC…',
  'ossature':'dépose','plaques':'réseau','bandes et joints':'pose des appareils'
 },
 peint:{
  'Ossature':'Préparation','Isolation':'Façade','commandes@placo-dauphine.example':'commandes@peintures-dauphine.example',
  'Faux plafond sur ossature métallique, plaques BA13':'Peinture des murs et plafonds, 2 couches, finition velours',
  'Bandes et joints, prêt à peindre (2 faces)':'Enduit de lissage et ponçage',
  'Bandes et joints, prêt à peindre':'Enduit de lissage et ponçage',
  'Faux plafond 32 m² · local professionnel':'Peinture 32 m² · local professionnel',
  'Faux plafond 32 m²':'Peinture 32 m²',
  'Faux plafond : dalles 60 × 60 blanches, validé avec le client.':'Blanc cassé velours, validé avec le client.',
  'Faux plafond du fournil':'Peinture du fournil',
  'Faux plafond de bureau':'Peinture de bureau','Faux plafond de cuisine':'Peinture de cuisine','Faux plafond du salon':'Peinture du salon',
  'Faux plafond':'Peinture',
  'Cloison de salle de bain · plaques hydro':'Salle de bain · peinture spéciale pièces humides',
  'Cloison de salle de bain':'Peinture de salle de bain',
  'Cloisons du séjour':'Peinture du séjour',
  'Doublage des chambres':'Papier peint des chambres','Doublage du garage':'Sol du garage',
  'Doublage isolant des deux chambres, plaques et bandes, prêt à peindre':'Papier peint intissé des deux chambres, posé',
  'Isolation des combles perdus, isolant soufflé, trappe isolée':'Ravalement de façade, nettoyage et 2 couches',
  'Isolation des combles':'Ravalement de façade',
  '2 fenêtres PVC':'2 volets bois à repeindre','Fenêtre PVC 2 vantaux 120 × 135':'Lasure bois volets',
  'Menuiseries des Alpes':'Couleurs des Alpes','Fenêtres, portes-fenêtres':'Lasures, vernis, papiers peints',
  'Placo Dauphiné':'Peintures Dauphiné','Plaques, rails, enduits':'Peintures, enduits, outillage',
  'Isolants, quincaillerie':'Bâches, rubans, outillage',
  'Protection et ossature':'Protection et préparation','Pose des plaques':'Enduit et ponçage','Bandes et joints':'Peinture 2 couches',
  'Nettoyage et réception':'Nettoyage et réception','Porte et finitions':'Boiseries et finitions','Pose de l\'isolant':'Nettoyage de la façade',
  'Trappe et finitions':'Retouches et finitions',
  'Plaques BA13 hydro (complément)':'Peinture pièces humides (complément)','Plaques BA13 hydro':'Peinture pièces humides',
  'Plaque BA13 hydro 120 × 250':'Peinture pièces humides · pot de 10 L','Plaque BA13 standard 120 × 250':'Peinture velours blanc · pot de 10 L',
  'Plaques BA13 · 1,20 × 2,50 m':'Peinture velours · 10 L','Plaque BA13 standard':'Peinture velours blanc','Plaque BA13 phonique':'Peinture plafond mat',
  'Plaques BA13':'Peinture velours','Plaque BA13':'Peinture',
  'Fourrures F530 (3 m)':'Sous-couche (10 L)','Fourrures F530 · 3,00 m':'Sous-couche · 10 L','Fourrure F530':'Sous-couche',
  'Suspentes':'Rouleaux','Suspente':'Rouleau',
  'Vis TTPC 25 · boîte de 1 000':'Ruban de masquage · lot de 10','Vis TTPC 25':'Ruban de masquage',
  'Bande à joint · rouleau 150 m':'Bâche de protection · 4 × 5 m','Bande à joint':'Bâches de protection',
  'Enduit à joint · sac de 25 kg':'Enduit de lissage · sac de 25 kg','Enduit à joint':'Enduit de lissage',
  'Laine minérale 45 mm':'Papier de ponçage','Bande armée d\'angle':'Mastic acrylique',
  'Rail R48 · 3 m':'Pinceau à rechampir','Rail R48':'Pinceau à rechampir','Montant M48 · 3 m':'Manchon de rouleau','Montant M48':'Manchon de rouleau',
  'Laine soufflée':'Peinture de façade',
  'Plaques et cloisons':'Peintures','Enduits et bandes':'Enduits','Visserie et fixations':'Protection et outillage',
  'Ossature terminée':'Préparation terminée','Plaques posées':'Enduit fait','Bandes, côté fenêtre':'Peinture, côté fenêtre',
  'Plafond couvert à 100 %. Trappe de visite non visible : à vérifier.':'Enduit fait à 100 %. Ponçage de l\'angle : à vérifier.',
  'Joints faits sur environ 40 % de la surface.':'Première couche sur environ 40 % de la surface.',
  'Entraxe régulier, environ 60 cm. Rien d\'anormal.':'Sols et meubles protégés. Rien d\'anormal.',
  'Fissure d\'angle possible : bande armée conseillée.':'Fissure d\'angle : à reboucher avant peinture.',
  'Angle nord : prévoir une bande armée.':'Angle nord : reboucher la fissure.',
  'Un faux plafond dans la salle d\'attente, 32 m² environ.':'Repeindre la salle d\'attente, 32 m² environ.',
  'Hauteur sous plafond 2,70 m, réseau électrique à reprendre par l\'électricien.':'Hauteur sous plafond 2,70 m, anciennes traces d\'humidité.',
  'Une cloison dans mon séjour pour faire un bureau, avec une porte.':'Repeindre mon séjour, murs et plafond.',
  'Séparer ma salle de bain avec une cloison et une porte.':'Repeindre ma salle de bain.',
  'Pièce humide : plaques hydrofuges proposées.':'Pièce humide : peinture spéciale proposée.',
  'Pièce humide : plaques hydrofuges. Porte de 73 cm côté couloir.':'Pièce humide : peinture spéciale. Porte côté couloir à laquer.',
  'Refaire toutes les cloisons de l\'étage, environ 60 m².':'Repeindre tout l\'étage, environ 60 m².',
  'Isolant posé sur toute la surface, trappe refermée.':'Façade finie, échafaudage démonté.','Isolant posé sur toute la surface.':'Façade finie.',
  'Combles terminés':'Façade terminée',
  'Il me manque 6 plaques et 2 rails pour Alpes Kiné.':'Il me manque 2 pots de velours et 6 rouleaux pour Alpes Kiné.',
  'Le BA13 passe à 2,79 euros chez Placo Dauphiné.':'Le velours blanc passe à 79 euros chez Peintures Dauphiné.',
  'Chercher : BA13, vis, laine…':'Chercher : peinture, enduit, rouleau…','Tapez : ba13, rail, laine…':'Tapez : peinture, enduit, rouleau…',
  'Chercher : cloison, pose…':'Chercher : peinture, enduit…','Tapez : pose, cloison, joints…':'Tapez : peinture, enduit, papier…',
  'ossature':'préparation','plaques':'enduit','bandes et joints':'peinture'
 }
};
var MET={elec:'<path d="M13 3 6 13.5h5L10 21l7-10.5h-5z"/>',plomb:'<path d="M12 3.5s5.5 6.2 5.5 10.2A5.5 5.5 0 0 1 6.5 13.7C6.5 9.7 12 3.5 12 3.5z"/>',
 placo:'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M10 4v16M14 4v16"/>',autre:'<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16v4h4l5.5-5.5a4 4 0 0 0 5-5L16 12l-4-4z"/>',
 carre:'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 12h16M12 4v16"/>',peint:'<rect x="4" y="4" width="13" height="6" rx="1.5"/><path d="M17 7h2.5v5H11v3"/><rect x="9.5" y="15" width="3" height="6" rx="1"/>',
 menu:'<path d="M6 21V4h12v17M3.5 21h17"/><circle cx="14.8" cy="12.5" r=".9" fill="currentColor"/>'};
var D=R[k]||{},L=[];
function minu(s){return s.charAt(0).toLowerCase()+s.slice(1)}
Object.keys(D).forEach(function(a){L.push([a,D[a]]);var la=minu(a);if(la!==a&&!D[la])L.push([la,minu(D[a])])});
L.push(['Bonjour Julien','Bonjour'],['ProClik Test',nom]);
L.sort(function(x,y){return y[0].length-x[0].length});
window.PC_EX={k:k,nom:nom,m:met,R:L,ic:MET[k]||MET.autre,adapte:!!R[k]||k==='placo'};

/* Bandeau « Exemple » + un seul bouton */
var css='html.pc-ex #vco{display:none!important}'+
 '.pcx-b{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:10px;padding:8px 12px;padding-top:calc(8px + env(safe-area-inset-top,0px));background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);font:600 13px/1.3 Manrope,system-ui,sans-serif}'+
 '.pcx-b .i{width:30px;height:30px;border-radius:50%;flex:none;display:grid;place-items:center;color:var(--n1-laiton,#A8823F);background:rgba(255,255,255,.1)}'+
 '.pcx-b .i svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'+
 '.pcx-b .t{flex:1;min-width:0}.pcx-b .t b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pcx-b .t small{display:block;font-weight:500;font-size:11.5px;opacity:.75}'+
 '.pcx-b button{flex:none;border:0;border-radius:999px;padding:9px 13px;font:800 12.5px Manrope,system-ui,sans-serif;background:var(--n1-laiton,#A8823F);color:#fff;cursor:pointer}';
function pose(){if(document.querySelector('.pcx-b'))return;var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var b=document.createElement('div');b.className='pcx-b';b.setAttribute('role','note');
 b.innerHTML='<span class="i"><svg viewBox="0 0 24 24" aria-hidden="true">'+window.PC_EX.ic+'</svg></span><span class="t"><b></b><small>Exemple'+(met?' d\'Espace de '+esc(met.toLowerCase()):'')+' · rien n\'est enregistré</small></span><button type="button">Je veux le mien</button>';
 b.querySelector('b').textContent='Espace de '+nom;
 b.querySelector('button').addEventListener('click',function(){var x=b.querySelector('small');x.textContent='Merci ! Cyril vous rappelle pour ouvrir le vôtre (démo).';var bt=b.querySelector('button');bt.disabled=true;bt.textContent='C\'est noté ✓'});
 document.body.insertBefore(b,document.body.firstChild)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
if(document.body)pose();else document.addEventListener('DOMContentLoaded',pose);
})();
