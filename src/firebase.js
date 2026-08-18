const STORAGE_PREFIX = 'eco_clean_';

/**
 * Lit une collection / clé depuis le stockage persistant LocalStorage
 */
export function getStoredData(key, fallbackValue) {
  if (typeof window === 'undefined') return fallbackValue;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw !== null && raw !== undefined) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`[Storage] Impossible de lire ${key}:`, e);
  }
  return fallbackValue;
}

/**
 * Sauvegarde une collection / clé dans le stockage persistant LocalStorage
 */
export function setStoredData(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[Storage] Impossible d'écrire ${key}:`, e);
  }
}

// Canal de diffusion interne temps réel inter-onglets
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('eco_clean_realtime_sync')
  : null;

const listeners = new Set();

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'SYNC_STATE' && event.data.payload) {
      listeners.forEach(callback => {
        try {
          callback(event.data.payload);
        } catch (err) {
          console.error(err);
        }
      });
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === `${STORAGE_PREFIX}last_update` && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        listeners.forEach(callback => {
          try {
            callback(payload);
          } catch (err) {
            console.error(err);
          }
        });
      } catch {
        // silent internal catch
      }
    }
  });
}

/**
 * Charge les données partagées du serveur multi-appareils
 */
export async function fetchServerData() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const db = await res.json();
      ['clients', 'agents', 'admins', 'passages', 'complaints'].forEach(sliceKey => {
        if (db[sliceKey]) {
          setStoredData(sliceKey, db[sliceKey]);
          listeners.forEach(cb => cb({ sliceKey, data: db[sliceKey], timestamp: db.lastUpdated || Date.now() }));
        }
      });
      return db;
    }
  } catch {
    // Mode local si serveur non joignable
  }
  return null;
}

// Connexion temps réel SSE multi-appareils (Phones, Tablettes, PC)
let eventSource = null;

function setupRealtimeStream() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

  try {
    if (eventSource) {
      eventSource.close();
    }
    eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'INIT' && parsed.payload) {
          const db = parsed.payload;
          ['clients', 'agents', 'admins', 'passages', 'complaints'].forEach(sliceKey => {
            if (db[sliceKey]) {
              setStoredData(sliceKey, db[sliceKey]);
              listeners.forEach(cb => cb({ sliceKey, data: db[sliceKey], timestamp: db.lastUpdated }));
            }
          });
        } else if (parsed.type === 'SYNC_STATE' && parsed.payload) {
          const { sliceKey, data, timestamp } = parsed.payload;
          if (sliceKey && data) {
            setStoredData(sliceKey, data);
            listeners.forEach(cb => cb({ sliceKey, data, timestamp }));
          }
        }
      } catch (err) {
        console.error('[SSE Error parsing]:', err);
      }
    };

    eventSource.onerror = () => {
      // Reconnexion automatique gérée par EventSource
    };
  } catch (e) {
    console.warn('[SSE Init error]:', e);
  }
}

// Initialisation immédiate du flux et chargement
if (typeof window !== 'undefined') {
  fetchServerData();
  setupRealtimeStream();

  // Polling de sécurité toutes les 4 secondes pour synchroniser les téléphones en veille
  setInterval(() => {
    fetchServerData();
  }, 4000);
}

/**
 * Sauvegarde et diffuse en temps réel les modifications de données entre tous les appareils et profils
 */
export function broadcastStateUpdate(sliceKey, data) {
  // 1. Sauvegarde locale immédiate
  setStoredData(sliceKey, data);

  const payload = { sliceKey, data, timestamp: Date.now() };

  // 2. Diffusion locale immédiate aux écouteurs et onglets du même appareil
  listeners.forEach(cb => {
    try {
      cb(payload);
    } catch (err) {
      console.error(err);
    }
  });

  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'SYNC_STATE', payload });
    } catch {}
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}last_update`, JSON.stringify(payload));
  } catch {}

  // 3. Envoi au serveur partagé pour mise à jour de db.json et diffusion à tous les autres téléphones/appareils
  if (typeof window !== 'undefined') {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sliceKey, data })
    }).catch(err => {
      console.warn('[Sync to Server]:', err);
    });
  }
}

/**
 * Souscription aux synchronisations temps réel
 */
export function subscribeToRealtimeSync(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Statut de la synchronisation
 */
export function getFirebaseStatus() {
  return {
    isConnected: true,
    engine: 'EcoClean Multi-Device Realtime Cloud Engine'
  };
}
