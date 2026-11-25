/* Espace ProClik : reçoit les notifications du service (proclik-cliky, push.js) et les affiche, même Espace fermé.
   Rien n'est mis en cache ici : l'Espace se charge toujours comme avant. (Cyril 25/11, notifications iPhone/iPad/Android) */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

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
