/**
 * Register Service Worker for PWA support across Android, iOS, Windows, macOS, Linux
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Vérifier immédiatement si une mise à jour existe
          registration.update();

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Nouveau contenu disponible, activer immédiatement
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                    console.log('[PWA] Nouvelle version installée et activée.');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });

      // Recharger automatiquement la vue dès que le nouveau Service Worker prend le contrôle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}
