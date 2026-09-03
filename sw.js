# Service worker for offline caching & instant loading
/**
 * Media Literacy & Critical Discourse Analysis Web App
 * Offline Service Worker & Asset Caching Engine
 */

const CACHE_NAME = 'media-literacy-app-v1';

// Essential core assets required for full offline operation
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/data.js',
  './js/matrix-tool.js',
  './js/slide-viewer.js',
  './data/lessons.json',
  
  // Third-party CDN Fallbacks
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',

  // Media Source Cards - Week 1
  './media/images/week1/WEBSITE_SAMPLE_CARD_1.png',
  './media/images/week1/WEBSITE_SAMPLE_CARD_2.png',
  './media/images/week1/WEBSITE_SAMPLE_CARD_3.png',
  './media/images/week1/WEBSITE_SAMPLE_CARD_4.png',

  // Media Source Cards - Week 2
  './media/images/week2/SOURCE_CARD_1.png',
  './media/images/week2/SOURCE_CARD_2.png',
  './media/images/week2/SOURCE_CARD_3.png',
  './media/images/week2/SOURCE_CARD_4.png',

  // Media Source Cards - Week 3
  './media/images/week3/MEDIA_SAMPLE_CARD_1.png',
  './media/images/week3/MEDIA_SAMPLE_CARD_2.png',
  './media/images/week3/MEDIA_SAMPLE_CARD_3.png',
  './media/images/week3/MEDIA_SAMPLE_CARD_4.png',

  // Media Source Cards - Week 4
  './media/images/week4/ARTICLE_CARD_1A.png',
  './media/images/week4/ARTICLE_CARD_1B.png',
  './media/images/week4/ARTICLE_CARD_2A.png',
  './media/images/week4/ARTICLE_CARD_2B.png',

  // Media Source Cards - Week 5
  './media/images/week5/CASE_CARD_1_COMMERCIAL.jpeg',
  './media/images/week5/CASE_CARD_2_PUBLIC_HEALTH.jpg',
  './media/images/week5/CASE_CARD_3_TECH_NEWS.png',
  './media/images/week5/CASE_CARD_4_ECO_PROJECT.png'
];

// Install Event: Cache all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core application assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache version:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache First, Network Fallback strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Dynamically cache valid new requests
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});