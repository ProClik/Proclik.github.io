/* Espace ProClik : reçoit les notifications du service (proclik-cliky, push.js) et les affiche, même Espace fermé.
   (Cyril 25/11, notifications iPhone/iPad/Android)

   26/11 (Cyril, « go » pour la copie sur l'appareil) : quand l'iPad a fermé l'appli en arrière-plan, l'Espace se rechargeait
   entièrement par internet (~60 fichiers) → écran blanc de plusieurs secondes. Une copie des fichiers de l'Espace est gardée ici :
   - la page elle-même : d'abord internet (nouvelle version prise tout de suite), la copie seulement si internet tarde plus de 1,5 s ;
   - les fichiers avec ?v= : la copie directement (une nouvelle version change le ?v=, donc une nouvelle adresse) ;
   - les autres fichiers du site : la copie tout de suite, mise à jour en arrière-plan.
   Les données (service proclik-calcul, GHL, cartes…) ne passent JAMAIS par la copie : seulement les fichiers de ce site. */
var COPIE = 'pc-espace-1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (L) {
    return Promise.all(L.filter(function (k) { return k.indexOf('pc-espace-') === 0 && k !== COPIE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function garder(req, rep) {
  if (!rep || !rep.ok || rep.type !== 'basic') return;
  var u = new URL(req.url), cp = rep.clone();
  caches.open(COPIE).then(function (c) {
    /* une seule version par fichier : l'ancienne (autre ?v=) est retirée */
    return c.keys().then(function (L) {
      L.forEach(function (r) { var x = new URL(r.url); if (x.pathname === u.pathname && x.search !== u.search) c.delete(r); });
    }).then(function () { return c.put(req, cp); });
  }).catch(function () {});
}
function reseau(req) { return fetch(req).then(function (rep) { garder(req, rep); return rep; }); }

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin !== self.location.origin) return;            /* service, GHL, cartes, polices Google… : jamais en copie */
  if (/\.(json|webmanifest)$/.test(u.pathname) && !/[?&]v=/.test(u.search)) return;
  var page = req.mode === 'navigate';
  if (page) {
    /* la page : internet d'abord ; si internet tarde (1,5 s) ou manque, la copie */
    e.respondWith(new Promise(function (ok, ko) {
      var fini = false, net = reseau(req);
      var t = setTimeout(function () {
        caches.match(req, { ignoreSearch: true }).then(function (c) { if (c && !fini) { fini = true; ok(c); } });
      }, 1500);
      net.then(function (rep) { clearTimeout(t); if (!fini) { fini = true; ok(rep); } }, function (err) {
        clearTimeout(t);
        caches.match(req, { ignoreSearch: true }).then(function (c) { if (fini) return; fini = true; c ? ok(c) : ko(err); });
      });
    }));
    return;
  }
  if (/[?&]v=/.test(u.search)) {
    e.respondWith(caches.match(req).then(function (c) { return c || reseau(req); }));
    return;
  }
  /* autres fichiers du site : la copie tout de suite, mise à jour derrière */
  e.respondWith(caches.match(req).then(function (c) {
    var n = reseau(req).catch(function () { return c; });
    return c || n;
  }));
});

self.addEventListener('push', function (e) {
  var m = {};
  try { m = e.data ? e.data.json() : {}; } catch (x) { m = { titre: 'ProClik', texte: e.data ? e.data.text() : '' }; }
  var url = m.url || self.registration.scope;
  e.waitUntil(self.registration.showNotification(m.titre || 'ProClik', {
    body: m.texte || '', tag: m.tag || undefined, renotify: !!m.tag,
    icon: 'icone-192.png?v=4', badge: 'icone-192.png?v=4', data: { url: url }
  }));
});

/* toucher la notification : l'Espace s'ouvre (ou revient devant) à la bonne demande / au bon écran */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (L) {
    for (var i = 0; i < L.length; i++) {
      var c = L[i];
      if (c.url.indexOf(self.registration.scope) === 0) { c.postMessage({ pcUrl: url }); return c.focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
