/* Fiki 오프라인 담당: 한 번 받은 파일은 폰에 저장해 두고, 와이파이 없이도 그걸로 연다.
   새 버전은 열 때 뒤에서 몰래 받아 두고, 다음에 열 때 바뀐다. */
const V = 'fiki-v1.8';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('fiki-') && k !== V && k !== 'fiki-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('fiki-fonts').then(c => c.match(r).then(hit => hit || fetch(r).then(res => { c.put(r, res.clone()); return res; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  const key = r.mode === 'navigate' ? './index.html' : r;
  e.respondWith(caches.open(V).then(c => c.match(key, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) c.put(key, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })));
});
