// ============================================
//  Van Sales - Service Worker
//  Version: v2
// ============================================

const CACHE_NAME = 'van-sales-cache-v2';

// الملفات الأساسية اللي لازم تتخزن في الكاش
const ASSETS_TO_CACHE = [
  './',
  './van-sales-mobile-app.html',
  './qrcode-generator.min.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ============ Install ============
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        // نستخدم addAll بشكل آمن: لو ملف واحد فشل، مايفشلش كل الملفات
        return Promise.all(
          ASSETS_TO_CACHE.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Failed to cache:', url, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ============ Activate ============
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ============ Fetch ============
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // تجاهل الطلبات غير GET
  if (req.method !== 'GET') return;

  // تجاهل الطلبات اللي خارج نطاق الموقع
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // استراتيجية: Cache First ثم Network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // نحدّث الكاش في الخلفية (Stale-While-Revalidate)
        fetch(req).then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, res));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        // خزّن النسخة الجديدة في الكاش
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => {
        // لو مفيش نت ومفيش كاش — نرجع الصفحة الرئيسية لو الطلب HTML
        if (req.mode === 'navigate') {
          return caches.match('./van-sales-mobile-app.html');
        }
      });
    })
  );
});

// ============ Messages ============
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});