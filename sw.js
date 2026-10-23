/* ============================================================
   SYNOVA México · Service Worker
   Estrategia: network-first con respaldo de caché.
   - Siempre intenta traer la versión más reciente desde la red.
   - Si no hay conexión, sirve lo último que se guardó en caché.
   - NUNCA intercepta otros orígenes (Firebase, Stripe, fuentes, CDNs):
     esas peticiones van directo a la red para no romper pagos ni datos.
   Sube este archivo a la raíz del repositorio, junto a los demás HTML.
   ============================================================ */

var CACHE = 'synova-vip-pro-v77-email-audit';

// Al instalar, activarse de inmediato (sin esperar a que se cierren pestañas viejas)
self.addEventListener('install', function (e) {
  self.skipWaiting();
});

// Al activar, tomar control de las pestañas y limpiar cachés viejas
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) { if (k !== CACHE) return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  // Solo manejamos GET
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Solo cacheamos recursos del mismo origen (la propia app).
  // Firebase, Stripe, Google Fonts, etc. quedan intactos y van siempre a la red.
  if (url.origin !== self.location.origin) return;

  // Para documentos y código, evita que la caché HTTP del navegador entregue
  // una versión anterior. La Cache API queda únicamente como respaldo offline.
  var esCodigo = req.mode === 'navigate' || /\.(?:html|js|css)$/.test(url.pathname);
  var peticionRed = esCodigo ? new Request(req, { cache: 'no-store' }) : req;

  // network-first: intenta la red; si falla, usa la caché
  e.respondWith(
    fetch(peticionRed).then(function (res) {
      try {
        var copy = res.clone();
        if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(req, copy); });
      } catch (err) { /* ignorar errores de caché */ }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        return cached || caches.match('vip-auth.html') || caches.match('./');
      });
    })
  );
});

// Notificaciones web push enviadas por el backend de SYNOVA. El sistema
// operativo puede mostrarlas aunque el panel no esté abierto.
self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (err) { data = { body: event.data ? event.data.text() : '' }; }
  var title = String(data.title || 'SYNOVA');
  var url = String(data.url || '/vip-panel.html#inicio');
  var actionLabel = String(data.action || 'Abrir SYNOVA');
  event.waitUntil(self.registration.showNotification(title, {
    body: String(data.body || ''),
    icon: String(data.icon || '/assets/img/synova-icon-192.png'),
    badge: String(data.badge || '/assets/img/synova-icon-192.png'),
    tag: String(data.tag || 'synova'),
    renotify: false,
    data: { url: url, templateId: String(data.templateId || '') },
    actions: [{ action: 'open', title: actionLabel }]
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var raw = event.notification && event.notification.data && event.notification.data.url || '/vip-panel.html#inicio';
  var target;
  try { target = new URL(raw, self.location.origin); }
  catch (err) { target = new URL('/vip-panel.html#inicio', self.location.origin); }
  if (target.origin !== self.location.origin) target = new URL('/vip-panel.html#inicio', self.location.origin);
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windows) {
    for (var index = 0; index < windows.length; index += 1) {
      if (new URL(windows[index].url).origin === self.location.origin) {
        return windows[index].focus().then(function (client) {
          if (client.navigate) return client.navigate(target.href);
          return client;
        });
      }
    }
    return self.clients.openWindow(target.href);
  }));
});
