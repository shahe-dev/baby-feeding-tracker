const CACHE_NAME = 'baby-feeding-tracker-v3';

// Local files
const localUrls = [
  './',
  './index.html',
  './baby-feeding-app.jsx',
  './manifest.json'
];

// CDN dependencies that must be cached for offline use
const cdnUrls = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/prop-types/prop-types.min.js',
  'https://unpkg.com/recharts@2.5.0/umd/Recharts.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

const urlsToCache = [...localUrls, ...cdnUrls];

// Trusted CDN origins for caching cross-origin responses
const trustedOrigins = [
  'https://unpkg.com',
  'https://cdn.tailwindcss.com'
];

function isTrustedOrigin(url) {
  return trustedOrigins.some(origin => url.startsWith(origin));
}

// Install event - cache all resources including CDN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching local files...');
        return cache.addAll(localUrls).then(() => {
          console.log('Caching CDN dependencies...');
          // Cache CDN resources individually so one failure doesn't block all
          return Promise.allSettled(
            cdnUrls.map(url =>
              fetch(url, { mode: 'cors' })
                .then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                })
                .catch(err => console.warn('Failed to cache:', url, err))
            )
          );
        });
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Only cache valid responses from local or trusted origins
          if (!response || response.status !== 200) {
            return response;
          }

          const url = event.request.url;
          const isLocal = response.type === 'basic';
          const isTrusted = isTrustedOrigin(url);

          if (isLocal || isTrusted) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch((error) => {
          console.log('Fetch failed; returning offline page instead.', error);
          return caches.match('./index.html');
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

// Listen for skip-waiting messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync stub
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-feeding-data') {
    event.waitUntil(
      console.log('Background sync triggered')
    );
  }
});

// Push notification stub
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">B</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">B</text></svg>',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Baby Feeding Tracker', options)
  );
});
