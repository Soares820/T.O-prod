const CACHE = 'to-plataforma-v5';
const OFFLINE = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: pré-cache apenas assets estáticos (NÃO o index.html)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE)).then(() => self.skipWaiting())
  );
});

// Activate: limpa TODOS os caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API: sempre rede
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline', content: 'Você está offline.' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // HTML documents: network-first (sempre busca versão atualizada)
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
    );
    return;
  }

  // Assets (imagens, CSS, JS, ícones): cache-first com atualização em background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type !== 'opaque') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => null);

      return cached || networkFetch;
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  self.registration.showNotification(data.title || 'Software para Terapia ABA', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});
