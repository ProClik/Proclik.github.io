// ProClik : icônes laiton des réponses (formulaire + plan), Cyril 11/11.
// Icônes des réponses (Cyril 11/11 18h) : petit dessin laiton, trait fin, devant chaque réponse.
const CI={
 oui:'<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.6 2.6L16 9.5"/>',
 non:'<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
 rien:'<circle cx="12" cy="12" r="8.5"/><path d="M6 18 18 6"/>',
 maison:'<path d="M4 11 12 4.5 20 11"/><path d="M6 9.5V19.5h12V9.5"/><path d="M10 19.5v-5h4v5"/>',
 immeuble:'<rect x="6" y="3.5" width="12" height="16.5" rx="1"/><path d="M9.5 7h1M13.5 7h1M9.5 10.5h1M13.5 10.5h1M9.5 14h1M13.5 14h1M11 20v-2.5h2V20"/>',
 boutique:'<path d="M4 9.5 5.5 5h13L20 9.5"/><path d="M4 9.5c0 1.5 1.3 2.5 2.7 2.5S9.3 11 9.3 9.5c0 1.5 1.3 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.3 2.5 2.6 2.5S20 11 20 9.5"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>',
 agglo:'<rect x="3.5" y="7" width="17" height="10" rx="1"/><rect x="6.5" y="9.5" width="4" height="5" rx=".5"/><rect x="13.5" y="9.5" width="4" height="5" rx=".5"/>',
 brique:'<rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M3.5 9.7h17M3.5 14.3h17M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
 pierre:'<path d="M4 19.5h16"/><path d="M5 19.5c-.8-2.5.3-4.5 2.7-4.8 2.3-.3 3.3 1.8 3 4.8"/><path d="M11.5 19.5c-.2-3 1.2-4.6 3.4-4.6 2.5 0 3.8 2 3.1 4.6"/><path d="M8 14.6c-.7-2.6.8-4.6 3.3-4.6s3.8 2.1 3.3 4.9"/>',
 laine:'<rect x="4" y="4" width="4" height="16" rx=".6"/><path d="M11 5c2 1.5-2 3 0 4.5s-2 3 0 4.5-2 3 0 4.5M15 5c2 1.5-2 3 0 4.5s-2 3 0 4.5-2 3 0 4.5"/><path d="M19.5 4v16"/>',
 polystyrene:'<rect x="4" y="4" width="4" height="16" rx=".6"/><rect x="10" y="4" width="8" height="16" rx=".6"/><path d="M12 8h.01M15.5 10h.01M12.5 13h.01M15 16h.01M12 17.5h.01"/>',
 isolation:'<path d="M4 20V4M20 20V4"/><path d="M8 5c2.5 1.6-2.5 3.2 0 4.8s-2.5 3.2 0 4.8-2.5 3.2 0 4.8M13.5 5c2.5 1.6-2.5 3.2 0 4.8s-2.5 3.2 0 4.8-2.5 3.2 0 4.8"/>',
 renforce:'<path d="M3.5 20V4M20.5 20V4"/><path d="M7 5c2 1.6-2 3.2 0 4.8s-2 3.2 0 4.8-2 3.2 0 4.8M11.2 5c2 1.6-2 3.2 0 4.8s-2 3.2 0 4.8-2 3.2 0 4.8M15.4 5c2 1.6-2 3.2 0 4.8s-2 3.2 0 4.8-2 3.2 0 4.8"/>',
 montants:'<path d="M5 4v16M12 4v16M19 4v16M3.5 4.5h17M3.5 19.5h17"/>',
 ouvert:'<rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M12 5v3.5M12 15.5V19" stroke-dasharray="2 2"/><path d="m9 12 3 0M12 12h3"/>',
 rdc:'<path d="M3.5 20h17"/><path d="M6 20v-8l6-4.5 6 4.5v8"/><rect x="9.5" y="14" width="5" height="6" fill="currentColor" fill-opacity=".18"/>',
 etage:'<path d="M3.5 20h17"/><path d="M6 20V9l6-4.5L18 9v11M6 13.5h12"/><rect x="9.5" y="8.5" width="5" height="5" fill="currentColor" fill-opacity=".18"/>',
 soussol:'<path d="M3.5 12h17"/><path d="M6 12V7.5L12 4l6 3.5V12M6 12v8h12v-8"/><rect x="9.5" y="14.5" width="5" height="4" fill="currentColor" fill-opacity=".18"/>',
 combles:'<path d="M3.5 20h17"/><path d="M5 12 12 5l7 7M7 12v8M17 12v8"/><path d="M8.5 12h7l-3.5-3.5z" fill="currentColor" fill-opacity=".18"/>',
 vite:'<path d="M13 3 5.5 13.5H12L10.5 21 18.5 10H12z"/>',
 mois:'<rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="M8 13.5h2v2H8z" fill="currentColor"/>',
 trois:'<rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
 calme:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 euro:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.6a4 4 0 1 0 0 6.8M7.5 11h6M7.5 13.3h6"/>',
 secret:'<rect x="5" y="10.5" width="14" height="9.5" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
 sejour:'<path d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3.5 13a1.5 1.5 0 0 1 3 0v1.5h11V13a1.5 1.5 0 0 1 3 0v4.5h-17zM6 17.5V19M18 17.5V19"/>',
 cuisine:'<path d="M5 11h14v2.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/><path d="M3.5 11h17M9 8c0-1.2 1-1.2 1-2.4M13 8c0-1.2 1-1.2 1-2.4"/>',
 chambre:'<path d="M3.5 18.5V6M3.5 14h17v4.5M20.5 14v-2a2.5 2.5 0 0 0-2.5-2.5h-7V14"/><circle cx="7.5" cy="11.2" r="1.7"/>',
 sdb:'<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 3.6-1.2M8 19l-1 1.5M16 19l1 1.5"/>',
 couloir:'<rect x="6.5" y="3.5" width="11" height="17" rx="1"/><path d="M14.5 12.5h.01"/><path d="M3.5 20.5h17"/>',
 bureau:'<rect x="4" y="4.5" width="16" height="10.5" rx="1.2"/><path d="M9 19.5h6M12 15v4.5"/>',
 garage:'<path d="M3.5 10 12 4.5 20.5 10V20H3.5z"/><path d="M7 20v-7.5h10V20M7 15h10M7 17.5h10"/>',
 tout:'<path d="M4 11 12 4.5 20 11"/><path d="M6 9.5V19.5h12V9.5"/><path d="M9 12.5h6v4H9z" fill="currentColor" fill-opacity=".18"/>',
 surface:'<rect x="4.5" y="4.5" width="15" height="15" rx="1"/><path d="M4.5 9.5h15M4.5 14.5h15M9.5 4.5v15M14.5 4.5v15" stroke-opacity=".45"/>',
 battant:'<rect x="5" y="3.5" width="14" height="17" rx="1"/><path d="M5 3.5 13 6v15.5L5 20.5"/><path d="M11 12.5h.01"/>',
 coulisse:'<rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M12 5v14"/><path d="M6 12h4M8.5 10.3 10 12l-1.5 1.7"/>',
 fixe:'<rect x="5" y="3.5" width="14" height="17" rx="1"/><rect x="7.5" y="6" width="9" height="12" rx=".5"/><path d="m10 9.5 3.5-2M10 13l5-3" stroke-opacity=".5"/>',
 fenetre:'<rect x="5" y="3.5" width="14" height="17" rx="1"/><path d="M12 3.5v17M5 12h14"/>',
 pfen:'<rect x="5.5" y="2.5" width="13" height="19" rx="1"/><path d="M12 2.5v19M5.5 9h13"/>',
 pvc:'<path d="M12 3.5 19.5 7.5v9L12 20.5 4.5 16.5v-9z"/><path d="M4.5 7.5 12 11.5l7.5-4M12 11.5v9"/>',
 alu:'<path d="M4 8h16M4 12h16M4 16h16" /><path d="M6 5.5h12M6 18.5h12" stroke-opacity=".5"/>',
 bois:'<rect x="4" y="4.5" width="16" height="15" rx="1.2"/><path d="M4 9c4-1.5 6 1.5 9 0s5-1 7 0M4 14c3-1 5 1.5 8 .3s5.5-1 8 .2"/><ellipse cx="14.5" cy="11.7" rx="1.6" ry="1"/>',
 metal:'<path d="M5 20 9 4M15 20 19 4M7 12h10M6 16h10M8 8h10"/>',
 beton:'<path d="M4 7.5 7 4h13v12.5L17 20H4z"/><path d="M4 7.5h13V20M17 7.5 20 4"/><path d="M8 12h.01M11.5 15h.01M13 11h.01M7.5 16.5h.01"/>',
 aucunvolet:'<rect x="5" y="4" width="14" height="16" rx="1"/><path d="M5 20 19 4"/>',
 manuel:'<rect x="4" y="3.5" width="16" height="4" rx="1"/><path d="M5.5 7.5h13M5.5 10.5h13M5.5 13.5h13"/><path d="M15 13.5v3.2a2 2 0 0 0 4 0"/>',
 moteur:'<rect x="4" y="3.5" width="16" height="4" rx="1"/><path d="M5.5 7.5h13M5.5 10.5h13"/><path d="m12.5 12.5-2.5 4h3l-1.5 4"/>',
 cadre:'<rect x="4.5" y="3.5" width="15" height="17" rx="1"/><rect x="7.5" y="6.5" width="9" height="11" rx=".5" stroke-dasharray="2 1.6"/>',
 depose:'<rect x="4.5" y="3.5" width="9" height="17" rx="1"/><path d="M16 9.5 20 13.5M20 9.5 16 13.5"/><path d="M11 12h.01"/>',
 droit:'<path d="M3.5 7.5h17M3.5 16.5h17M7 7.5v9M17 7.5v9"/><path d="m10 12 2-1.6v3.2z" fill="currentColor"/>',
 abime:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="m12 4-2 4.5 3 2.5-2.5 4 1.5 5"/>',
 humide:'<path d="M12 3.5c3.2 4.1 5.5 7.2 5.5 10a5.5 5.5 0 0 1-11 0c0-2.8 2.3-5.9 5.5-10z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
 baisser:'<path d="M3.5 5h17M3.5 12h17" stroke-opacity=".45"/><path d="M12 6v9.5M8.5 12.5 12 16l3.5-3.5"/><path d="M3.5 19.5h17"/>',
 poutre:'<path d="M3.5 6h17M3.5 9.5h17"/><path d="M6 9.5V20M12 9.5V20M18 9.5V20" stroke-opacity=".55"/>',
 platre:'<path d="M3.5 6.5h17v4h-17z"/><path d="M6 10.5v2.5M10 10.5v4M14.5 10.5v2M18 10.5v3"/><path d="M3.5 20h17" stroke-opacity=".45"/>',
 trappe:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 8h8v8H8z" fill="currentColor" fill-opacity=".18"/><path d="M8 8l8 8"/>',
 escalier:'<path d="M4 20h4v-4h4v-4h4V8h4V4"/>',
 bloque:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 20 20 4"/>',
 ancien:'<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4.5h4.5M12 8v4l2.5 2"/>',
 neuf:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
 aides:'<path d="M3.5 15.5h3l3.5 2h4.5a1.5 1.5 0 0 0 0-3H11"/><path d="M6.5 15.5V20M14 14.5l4.4-2.2a1.6 1.6 0 0 1 1.8 2.6L15 19H8"/><circle cx="15" cy="7.5" r="3.2"/>',
 standard:'<rect x="6" y="3.5" width="12" height="17" rx="1"/><path d="M15 12h.01"/>',
 bruit:'<rect x="4" y="3.5" width="10" height="17" rx="1"/><path d="M11 12h.01M17 8.5c1.3 1 1.3 6 0 7M19.8 6.5c2.3 2 2.3 9 0 11"/>',
 gauche:'<rect x="7" y="3.5" width="11" height="17" rx="1"/><path d="M7 8.5h-.01M7 15.5h-.01" stroke-width="3"/><path d="M15 12h-5M11.8 9.8 9.6 12l2.2 2.2"/>',
 droite:'<rect x="6" y="3.5" width="11" height="17" rx="1"/><path d="M17 8.5h.01M17 15.5h.01" stroke-width="3"/><path d="M9 12h5M12.2 9.8 14.4 12l-2.2 2.2"/>',
 rouleau:'<rect x="4" y="3.5" width="13" height="5" rx="1.5"/><path d="M17 6h2.5v5H11v3"/><rect x="9.5" y="14" width="3" height="6.5" rx="1"/>',
 bandes:'<path d="M4 7h16M4 12h16M4 17h16" stroke-opacity=".4"/><path d="M8.5 4v16M15.5 4v16" stroke-width="2.6" stroke-opacity=".75"/>',
 finition:'<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
 plaques:'<rect x="4" y="4" width="7" height="16" rx=".6"/><rect x="13" y="4" width="7" height="16" rx=".6"/><path d="M7.5 9h.01M16.5 9h.01M7.5 15h.01M16.5 15h.01"/>',
 carrelage:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>',
 parquet:'<path d="M4 4h16v16H4z"/><path d="M4 8h16M4 12h16M4 16h16M10 4v4M15 8v4M8 12v4M14 16v4"/>',
 stratifie:'<path d="M4 4h16v16H4z"/><path d="M4 9.3h16M4 14.6h16M13 4v5.3M7 9.3v5.3M16 14.6V20"/>',
 vinyle:'<path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5H20v13.5c0 1.4-1.1 2.5-2.5 2.5H4z"/><path d="M4 6.5c0 1.4 1.1 2.5 2.5 2.5H16"/>',
 moquette:'<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M6.5 9c1-1 2 1 3 0s2 1 3 0 2 1 3 0 2 1 2.5 0M6.5 13c1-1 2 1 3 0s2 1 3 0 2 1 3 0 2 1 2.5 0"/>',
 quart:'<path d="M4 20h7v-4M4 16h3v-4M4 12h3V4"/><path d="M11 16h4v-4h4V8" stroke-opacity=".7"/>',
 deuxq:'<path d="M4 20h5v-4h4v4h7"/><path d="M9 16V9h4v7M4 9h5M13 9h4V4" stroke-opacity=".7"/>',
 colima:'<circle cx="12" cy="12" r="1.6"/><path d="M12 12 12 3.5M12 12l6 6M12 12l-8.5 0M12 12l-6 6M12 12l6-6"/><circle cx="12" cy="12" r="8.5" stroke-opacity=".45"/>',
 creer:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
 remplacer:'<path d="M5 9h12.5M14.5 6l3 3-3 3"/><path d="M19 15H6.5M9.5 12l-3 3 3 3"/>',
 renover:'<path d="M14 4.5 19.5 10 11 18.5H5.5V13z"/><path d="m11.5 7 5.5 5.5"/>',
 regle:'<rect x="3" y="8" width="18" height="8" rx="1" transform="rotate(-30 12 12)"/><path d="m8.2 9.5 1 1.7M11 7.9l1.6 2.8M13.9 6.3l1 1.7" />',
 autre:'<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>',
 pente1:'<path d="M3.5 20h17M5 20V9.5L19 5.5V20"/>',
 pente2:'<path d="M3.5 20h17M5 20v-7.5L12 6l7 6.5V20"/>',
 grenier:'<path d="M3.5 18h17M5 18 12 6l7 12"/><path d="M8.5 15.5c1-.8 2 .8 3 0s2 .8 3 0" stroke-opacity=".7"/>',
 amenage:'<path d="M3.5 19.5h17M5 19.5 12 6l7 13.5"/><path d="M9 19.5v-3.5h4.5v3.5M10 13h4"/>'
};
// Couleurs et essences : une pastille de la vraie teinte.
const CSW={"Blanc":"#F7F6F2","Gris anthracite":"#3A3F46","Chêne clair":"#D9B98A","Chêne doré":"#C08A47","Chêne foncé":"#6E4A2C","Noyer":"#5A3B26","Pin":"#E3C58E","Bois exotique":"#8E4B2E","Bois peint":"#E8E2D6"};
const CIR=[[/^Oui, (de quelques|nettement)/,"baisser"],[/^Oui( |$)|^Déjà en place$/,"oui"],[/^Non$/,"non"],[/^(Aucun|Aucune)$|^Pas d'isolation$/,"rien"],[/^Maison$/,"maison"],[/^Appartement$/,"immeuble"],[/^Local/,"boutique"],[/^Agglos$/,"agglo"],[/^Brique/,"brique"],[/^Mur en pierre$/,"pierre"],[/^Laine/,"laine"],[/polystyrène/,"polystyrene"],[/^BA13/,"montants"],[/^Pas de cloison$/,"ouvert"],[/^Rez-de/,"rdc"],[/^Étage/,"etage"],[/^Sous-sol$/,"soussol"],[/^Combles$/,"combles"],[/^Dès que/,"vite"],[/^Dans le mois$/,"mois"],[/^Dans les 3/,"trois"],[/^Pas pressé$/,"calme"],[/ €$/,"euro"],[/^Je préfère ne pas dire$/,"secret"],[/^Séjour$/,"sejour"],[/^Cuisine$/,"cuisine"],[/^Chambre/,"chambre"],[/^Salle de bain/,"sdb"],[/^Entrée/,"couloir"],[/^Bureau$/,"bureau"],[/^Garage$/,"garage"],[/^Tout le logement$/,"tout"],[/m²$/,"surface"],[/^Battant$/,"battant"],[/^Coulissante$/,"coulisse"],[/^Fixe$/,"fixe"],[/^Porte-fenêtre/,"pfen"],[/^\d+ × \d+/,"fenetre"],[/^PVC$/,"pvc"],[/^Aluminium$/,"alu"],[/^Bois \(poutres\)$/,"poutre"],[/^Bois$/,"bois"],[/^Métal$/,"metal"],[/^Béton/,"beton"],[/^Manuel$/,"manuel"],[/^Motorisé$/,"moteur"],[/^Sur l'ancien cadre$/,"cadre"],[/^Dépose/,"depose"],[/^Bon, bien droit$/,"droit"],[/^Abîmé/,"abime"],[/^Humide$/,"humide"],[/^Ancien plâtre$/,"platre"],[/^Trappe$/,"trappe"],[/^Escalier$/,"escalier"],[/^Pas d'accès$/,"bloque"],[/^Oui, ancien/,"ancien"],[/^Isolation standard$|^Standard$/,"isolation"],[/^Isolation renforcée$|^Renforcée$/,"renforce"],[/^Avoir droit aux aides$/,"aides"],[/^Plus isolante/,"bruit"],[/^Poussant à gauche$/,"gauche"],[/^Poussant à droite$/,"droite"],[/^Prêt[e]? à peindre$/,"rouleau"],[/^Bandes seules/,"bandes"],[/^Fin de chantier/,"finition"],[/^Isolation \+ plaques/,"plaques"],[/^Isolation seule$/,"isolation"],[/^Carrelage$/,"carrelage"],[/^Parquet$/,"parquet"],[/^Stratifié$/,"stratifie"],[/^(Vinyle|Lino)/,"vinyle"],[/^Moquette$/,"moquette"],[/^Droit$/,"escalier"],[/^Quart tournant$/,"quart"],[/^Deux quarts/,"deuxq"],[/^Colimaçon$/,"colima"],[/^Créer|^À créer$|^Dans une cloison neuve$/,"creer"],[/^Remplacer|^À changer$/,"remplacer"],[/^Rénover/,"renover"],[/^\d+([,.]\d+)? (cm|m)$/,"regle"],[/^Autre/,"autre"],[/^1 pente$/,"pente1"],[/^2 pentes$/,"pente2"],[/^Perdus/,"grenier"],[/^Aménagés/,"amenage"]];

CI.wc='<path d="M6 4.5h5v6H6z"/><path d="M5 10.5h14a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6zM9 16v3.5h6V16"/>';
CI.dk='<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.7M12 16.8h.01"/>';
CI.feu='<path d="M12 3.5c1 3 4.5 4.8 4.5 9a4.5 4.5 0 0 1-9 0c0-2 1-3.3 2-4.3.3 1.5 1 2.3 2 2.6-.4-2.7-.1-5.1.5-7.3z"/>';
CI.plaque1='<rect x="8" y="4" width="8" height="16" rx=".6"/><path d="M12 9h.01M12 15h.01"/>';
CI.fR='<path d="M4 6h16v12H4z"/>';CI.fL='<path d="M4 4h7v8h9v8H4z"/>';CI.fT='<path d="M4 4h16v6h-5v10H9V10H4z"/>';CI.fU='<path d="M4 4h5v9h6V4h5v16H4z"/>';
CI.fleche='<path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5"/>';
CI.soleil='<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>';
CI.prise='<circle cx="12" cy="12" r="8.5"/><path d="M9.5 10v2.5M14.5 10v2.5M12 15.5h.01"/>';
CI.inter='<rect x="6" y="3.5" width="12" height="17" rx="2"/><rect x="9.5" y="8" width="5" height="8" rx="1"/><path d="M9.5 12h5"/>';
CI.radiateur='<path d="M5 6v13M9 6v13M13 6v13M17 6v13M3.5 9h17M3.5 16h17"/>';
CI.spot='<path d="M3.5 6h17"/><path d="M8.5 6v2a3.5 3.5 0 0 0 7 0V6"/><path d="M9 14.5 7.5 18M12 15v4M15 14.5l1.5 3.5" stroke-opacity=".6"/>';
CI.benne='<path d="M3.5 9h17l-2 10h-13z"/><path d="M8 9 9.5 5.5h5L16 9"/>';
CI.tS='<rect x="9" y="9" width="6" height="6" rx=".8"/><rect x="4" y="4" width="16" height="16" rx="1.2" stroke-opacity=".3"/>';
CI.tM='<rect x="6.5" y="6.5" width="11" height="11" rx=".8"/><rect x="4" y="4" width="16" height="16" rx="1.2" stroke-opacity=".3"/>';
CI.tL='<rect x="4" y="4" width="16" height="16" rx="1.2"/><path d="M8 8h8v8H8z" stroke-opacity=".3"/>';
CI.vmc='<circle cx="12" cy="12" r="8.5"/><path d="M12 12c0-3 1.5-4.5 3.5-4.5M12 12c3 0 4.5 1.5 4.5 3.5M12 12c0 3-1.5 4.5-3.5 4.5M12 12c-3 0-4.5-1.5-4.5-3.5"/>';
CI.seuil='<path d="M3.5 18h17"/><path d="M6 18V5h12v13"/><path d="M5 15.5h14" stroke-width="2.4"/>';
CI.placard='<rect x="4" y="3.5" width="16" height="17" rx="1"/><path d="M12 3.5v17M10 12h.01M14 12h.01"/>';
CIR.push([/^À droite$/,"fleche",0],[/^(À gauche)$/,"fleche",180],[/^Au-dessus$/,"fleche",-90],[/^En dessous$/,"fleche",90],
 [/^(Rien à faire|Rien|Sans)$/,"rien"],[/^À refaire$|^Rénover l'existant$/,"renover"],[/^Isoler/,"isolation"],[/^Créer/,"creer"],[/^Plain-pied$/,"rdc"],[/^\d étages?$/,"etage"],
 [/^Fenêtre$/,"fenetre"],[/^Porte-fenêtre$/,"pfen"],[/^Châssis fixe$/,"fixe"],[/^(Baie coulissante|Coulissant|Châssis galandage|Galandage)/,"coulisse"],[/^(Bloc-porte|Porte de service)$/,"standard"],[/^Porte d'entrée$/,"couloir"],[/^Porte de garage$/,"garage"],
 [/^Roulant/,"manuel"],[/^Volets battants$/,"battant"],[/^(Radio|Filaire)/,"moteur"],[/^Solaire$/,"soleil"],[/^(Lino \/ PVC|Sol souple)$/,"vinyle"],[/^(Contrecollé|Massif)$/,"parquet"],
 [/^WC$/,"wc"],[/^Buanderie$/,"humide"],[/^Couloir$|^Entrée$/,"couloir"],[/^Placard$/,"placard"],[/^Prise/,"prise"],[/^Interrupteur/,"inter"],[/^(Radiateur|Chauffage au sol)/,"radiateur"],[/^Spots/,"spot"],[/^Évacuation des gravats$/,"benne"],[/^Meubles/,"sejour"],
 [/^(Fissure|Mur abîmé|Sol pas plat)/,"abime"],[/^(Mur humide|Humidité|Pièce humide)/,"humide"],[/^Accès difficile$/,"bloque"],[/^Trappe/,"trappe"],[/^VMC/,"vmc"],[/^Seuil/,"seuil"],[/^Gaine/,"prise"],[/^Plinthes/,"bandes"],[/^Écran/,"combles"],
 [/^Petites?( |$)/,"tS"],[/^Moyennes?( |$)/,"tM"],[/^Grandes?( |$)/,"tL"],[/^Aménageables$/,"amenage"],[/^Construction neuve$|^Neuf$/,"neuf"],[/^En fin de chantier$/,"finition"],[/^À la création de la cloison$/,"creer"],[/^Phonique$/,"bruit"],[/^(Doublage|Isolation des murs)$/,"isolation"],[/^Cloisons?$/,"montants"],[/^Faux plafond$/,"baisser"],[/^Fenêtres et portes$/,"fenetre"],[/^Ancienne laine/,"ancien"],[/^Au sol/,"grenier"],[/^En rampant$/,"amenage"],[/^(Charpente|Fermettes)/,"combles"],[/^(Applique|En tableau|Feuillure|Sur appuis|Sur façade|Tunnel)/,"cadre"],[/^Hydro$/,"humide"],[/^Feu$/,"feu"],[/^(Doublés|2 peaux|OSB|CTBH)$/,"plaques"],[/^(Simples|1 peau)$/,"plaque1"],[/^(Collée|Clouée|Flottante)$/,"parquet"],[/^(Droite|Diagonale|Décalée)$/,"carrelage"],[/^La pente$|^\d+°$/,"pente2"],[/^Les hauteurs$/,"regle"],[/^Rectangle$/,"fR"],[/^En L$/,"fL"],[/^En T$/,"fT"],[/^En U$/,"fU"],[/^M\d+$/,"montants"]);
Object.assign(CSW,{"RAL 9016":"#F1F0EA","RAL 7016":"#383E42","RAL 7035":"#CBD0CC","RAL 8019":"#3D3635","RAL 9005":"#141414","RAL 1015":"#E6D2B5","Beige":"#E6D2B5","Marron":"#5B3A29","Noir":"#141414","Gris clair":"#CBD0CC"});
const NOI=/^(Je ne sais pas|\+ |\d+$)/;
function icoOf(t,dk){t=(t||"").trim();if(dk&&/^Je ne sais pas$/.test(t))return`<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CI.dk}</svg>`;if(!t||NOI.test(t))return"";const k=Object.keys(CSW).find(c=>t===c||t.startsWith(c+" "));if(k)return`<i class="ci sw" style="background:${CSW[k]}"></i>`;const r=CIR.find(([re])=>re.test(t));if(!r||!CI[r[1]])return"";return`<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${r[2]?` style="transform:rotate(${r[2]}deg)"`:""}>${CI[r[1]]}</svg>`}
// Pose les icônes sur toutes les réponses (boutons .chip et .qk), y compris après chaque mise à jour de l'écran.
function icoDeco(root){(root||document).querySelectorAll(".chips .chip:not(.dk):not([data-cnt]):not([data-noico]),.qk>button:not([data-noico])").forEach(b=>{if(b.querySelector(".ci"))return;const h=icoOf(b.textContent,b.parentElement.classList.contains("qk"));if(h){b.insertAdjacentHTML("afterbegin",h);b.classList.add("hasci")}})}
(function(){let q=0;const run=()=>{q=0;icoDeco()};const mo=new MutationObserver(()=>{if(!q)q=requestAnimationFrame(run)});const go=()=>{icoDeco();mo.observe(document.body,{childList:true,subtree:true})};if(document.body)go();else addEventListener("DOMContentLoaded",go)})();
(function(){const s=document.createElement('style');s.textContent='\n/* Icônes des réponses */\n.ci{width:1.3em;height:1.3em;flex:none;color:var(--mint-ink,#8A6A2F);vertical-align:-.3em;margin-right:.5em;display:inline-block}\n.ci.sw{border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.22),0 1px 2px rgba(0,0,0,.12);width:1.1em;height:1.1em;vertical-align:-.18em}\n';document.head.appendChild(s)})();
