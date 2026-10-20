// Service Worker minimalista para habilitar instalação PWA completa
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Pass-through padrão para respeitar conexões dinâmicas do Supabase e Next.js
  event.respondWith(fetch(event.request))
})
