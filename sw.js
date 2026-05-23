// ================================================
// SERVICE WORKER — Blind Test PTG
// Stratégie : Network First
// → Toujours essayer le réseau en premier
// → Cache uniquement si hors ligne
// ================================================

const CACHE_NAME = 'blindtest-ptg-v4.6';
const CACHE_FILES = [
    './',
    './GRAND_FINAL_BLIND_TEST_OK.html',
    './MusicBlindTest.mp3',
    './MusicPodium.mp3',
    './logo.png',
];

// Installation : mettre en cache les fichiers de base
self.addEventListener('install', event => {
    self.skipWaiting(); // Active immédiatement sans attendre
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_FILES.filter(f => !f.includes('.mp3'))); // MP3 en cache optionnel
        }).catch(() => {})
    );
});

// Activation : supprimer les anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Suppression ancien cache:', key);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim()) // Prend le contrôle immédiatement
    );
});

// Fetch : Network First
self.addEventListener('fetch', event => {
    // Ignorer les requêtes non-HTTP et Firebase
    if (!event.request.url.startsWith('http')) return;
    if (event.request.url.includes('firebase') ||
        event.request.url.includes('firebaseio') ||
        event.request.url.includes('googleapis')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Réseau OK → mettre en cache et retourner
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Réseau KO → fallback sur le cache
                return caches.match(event.request);
            })
    );
});

// Message de mise à jour : forcer le rechargement sur tous les clients
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
