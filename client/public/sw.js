const CACHE_NAME = 'work-diary-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
  // если вы точно знаете имена своих JS/CSS ассетов после сборки, можно добавить и их,
  // но для простоты мы закэшируем только главные файлы
];

self.addEventListener('install', event => {
    event.waitUntil(
    caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
    caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});