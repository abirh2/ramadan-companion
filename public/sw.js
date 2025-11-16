// Service Worker for Ramadan Companion PWA
// Version 1.0 - Basic caching + foundation for future notifications

const CACHE_VERSION = 'v1';
const CACHES = {
  static: `static-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
  pages: `pages-${CACHE_VERSION}`,
};

// Critical pages to cache for offline access
const PAGES_TO_CACHE = [
  '/',
  '/times',
  '/quran-hadith',
  '/zikr',
  '/charity',
  '/favorites',
  '/about',
  '/profile',
];

// API routes to cache with Network-First strategy
const API_ROUTES = [
  '/api/prayertimes',
  '/api/quran',
  '/api/hadith',
  '/api/hijri',
  '/api/qibla',
];

// Static assets patterns to cache
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHES.static).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(CACHES.pages).then((cache) => {
        console.log('[SW] Caching critical pages');
        return cache.addAll(PAGES_TO_CACHE);
      }),
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (!Object.values(CACHES).includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API routes with Network-First strategy
  if (isApiRoute(url.pathname)) {
    event.respondWith(networkFirstStrategy(request, CACHES.api));
    return;
  }

  // Handle static assets with Cache-First strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, CACHES.static));
    return;
  }

  // Handle HTML pages with Network-First strategy
  if (isHtmlPage(url.pathname) || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, CACHES.pages));
    return;
  }

  // Handle Next.js static files (_next) with Cache-First
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(cacheFirstStrategy(request, CACHES.static));
    return;
  }

  // Default: Network-First for everything else
  event.respondWith(networkFirstStrategy(request, CACHES.pages));
});

// Network-First Strategy: Try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If both network and cache fail, return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Cache-First Strategy: Try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {
      // Silently fail background update
    });
    
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first strategy failed:', request.url);
    throw error;
  }
}

// Helper: Check if URL is an API route
function isApiRoute(pathname) {
  return API_ROUTES.some((route) => pathname.startsWith(route));
}

// Helper: Check if URL is a static asset
function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname) || 
         pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|css)$/);
}

// Helper: Check if URL is an HTML page
function isHtmlPage(pathname) {
  return PAGES_TO_CACHE.includes(pathname) || 
         pathname.match(/^\/[^.]*$/) || // Paths without extensions (likely pages)
         pathname.endsWith('/');
}

// Message event - for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle notification scheduling messages
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    console.log('[SW] Scheduling notification:', event.data.prayer);
    // Notification scheduling is handled by the main app using setTimeout
    // Service worker just shows notifications when triggered
  }
});

// Push event for Web Push notifications (prayer time reminders)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data?.json() || {};
  const title = data.title || 'Prayer Time Reminder';
  const options = {
    body: data.body || 'Time for prayer',
    icon: '/icon-192.png',
    badge: '/icon-192-maskable.png',
    tag: data.tag || 'prayer-notification',
    requireInteraction: false,
    silent: false,
    data: data.data || { url: '/times' },
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - navigate to prayer times page
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  // Close the notification
  event.notification.close();
  
  // Get the URL from notification data, default to /times
  const urlToOpen = event.notification.data?.url || '/times';
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service worker loaded');

