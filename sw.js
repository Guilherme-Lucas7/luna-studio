// Luna Studio — cache para abrir rápido e funcionar sem internet
const VER = 'luna-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './vendor/cm.min.js', './vendor/sql-wasm.js', './vendor/sql-wasm.wasm', './icons/icon-192.png', './icons/favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // API do GitHub e fontes passam direto
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isPage) { // rede primeiro (pega atualizações), cache se offline
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VER).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(VER).then(ca => ca.put(e.request, c)); } return r; })));
});
