let CACHE_NAME = 'identify-cache-' + randomString();
const urlsToCache = [
  '/img/identify.svg',
  '/img/identify-white.svg',
  '/img/home-background.svg',
];

self.addEventListener('install', async (event) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urlsToCache);
  self.skipWaiting();
});

self.addEventListener('fetch', async (event) => {
  const req = event.request;
  if (/.*(json)$/.test(req.url)) {
    return fetch(req);
  } else {
    event.respondWith(cacheFirst(req));
  }
});

self.addEventListener('activate', (event) => {
  var cachesToKeep = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (cachesToKeep.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(req);
  return cachedResponse || fetch(req);
}

function randomString() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
