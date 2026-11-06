var CACHE = 'gully-score-v2';
var CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // app files: network first so updates arrive, cache when offline
    e.respondWith(fetch(e.request).then(function(r){ var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); return r; }).catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match('./index.html'); }); }));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // fonts: cache first
    e.respondWith(caches.match(e.request).then(function(r){ return r || fetch(e.request).then(function(n){ var cp = n.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, cp); }); return n; }); }));
  }
});
