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

// Canal de diffusion interne temps réel inter-onglets du même navigateur
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
          console.error('[SyncChannel cb error]:', err);
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
            console.error('[StorageEvent cb error]:', err);
          }
        });
      } catch {
        // silent internal catch
      }
    }
  });
}

/**
 * Charge les données partagées du serveur multi-appareils (Phones, Tablettes, PC)
 */
export async function fetchServerData() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/api/data?_=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const db = await res.json();
        ['clients', 'agents', 'admins', 'passages', 'complaints'].forEach(sliceKey => {
          if (Array.isArray(db[sliceKey])) {
            setStoredData(sliceKey, db[sliceKey]);
            listeners.forEach(cb => {
              try {
                cb({ sliceKey, data: db[sliceKey], timestamp: db.lastUpdated || Date.now() });
              } catch (err) {
                console.error(err);
              }
            });
          }
        });
        return db;
      }
    }
  } catch (err) {
    // Mode local si serveur temporairement inaccessible
    console.debug('[fetchServerData notice]:', err.message);
  }
  return null;
}

// Connexion temps réel SSE multi-appareils (Push direct instantané)
let eventSource = null;
let reconnectTimer = null;

export function setupRealtimeStream() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

  try {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'INIT' && parsed.payload) {
          const db = parsed.payload;
          ['clients', 'agents', 'admins', 'passages', 'complaints'].forEach(sliceKey => {
            if (Array.isArray(db[sliceKey])) {
              setStoredData(sliceKey, db[sliceKey]);
              listeners.forEach(cb => {
                try {
                  cb({ sliceKey, data: db[sliceKey], timestamp: db.lastUpdated });
                } catch (e) {
                  console.error(e);
                }
              });
            }
          });
        } else if (parsed.type === 'SYNC_STATE' && parsed.payload) {
          const { sliceKey, data, timestamp } = parsed.payload;
          if (sliceKey && Array.isArray(data)) {
            setStoredData(sliceKey, data);
            listeners.forEach(cb => {
              try {
                cb({ sliceKey, data, timestamp });
              } catch (e) {
                console.error(e);
              }
            });
          }
        }
      } catch (err) {
        console.error('[SSE Error parsing]:', err);
      }
    };

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      // Tentative de reconnexion après 3 secondes
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          setupRealtimeStream();
        }, 3000);
      }
    };
  } catch (e) {
    console.warn('[SSE Init error]:', e);
  }
}

// Gestion intelligente du cycle de vie des téléphones mobiles (veille / déverrouillage / retour onglet)
if (typeof window !== 'undefined') {
  // 1. Initialisation initiale
  fetchServerData();
  setupRealtimeStream();

  // 2. Synchronisation automatique au réveil du téléphone ou focus sur l'écran
  window.addEventListener('focus', () => {
    fetchServerData();
    if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
      setupRealtimeStream();
    }
  });

  window.addEventListener('online', () => {
    fetchServerData();
    setupRealtimeStream();
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchServerData();
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
          setupRealtimeStream();
        }
      }
    });
  }

  // 3. Polling de secours toutes les 3 secondes pour garantir la cohérence en arrière-plan
  setInterval(() => {
    fetchServerData();
  }, 3000);
}

/**
 * Sauvegarde et diffuse en temps réel les modifications de données entre tous les téléphones et appareils
 */
export async function broadcastStateUpdate(sliceKey, data) {
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

  // 3. Envoi au serveur partagé pour mise à jour de db.json et diffusion push SSE à tous les autres téléphones
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ sliceKey, data })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[Sync to Server failed, data preserved in localStorage]:', err);
    }
  }

  return { success: true, localOnly: true };
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
  const isSSEConnected = eventSource && eventSource.readyState === EventSource.OPEN;
  return {
    isConnected: true,
    realtimeActive: Boolean(isSSEConnected),
    engine: 'EcoClean Multi-Device Realtime Cloud Engine'
  };
}
