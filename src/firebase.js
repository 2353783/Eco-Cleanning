import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

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

// ---------------------------------------------------------
// 1. DUAL-ENGINE: CONFIGURATION & INITIALISATION FIREBASE
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "",
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "",
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "",
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "",
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "",
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || ""
};

let firebaseApp = null;
let firestoreDb = null;
let isFirebaseActive = false;

// Initialiser Firebase si des identifiants valides sont fournis dans l'environnement
if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    firestoreDb = getFirestore(firebaseApp);
    isFirebaseActive = true;
    console.log('[Firebase Cloud] Initialisé et connecté à Firestore.');
  } catch (err) {
    console.warn('[Firebase] Erreur lors de l\'initialisation, bascule sur le moteur local:', err.message);
    isFirebaseActive = false;
  }
}

// ---------------------------------------------------------
// 2. CANAUX DE DIFFUSION LOCALE ET INTER-ONGLETS
// ---------------------------------------------------------
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
        // silent
      }
    }
  });
}

// ---------------------------------------------------------
// 3. CHARGEMENT INITIAL DES DONNÉES SERVEUR / CLOUD
// ---------------------------------------------------------
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
    console.debug('[fetchServerData notice]:', err.message);
  }
  return null;
}

// ---------------------------------------------------------
// 4. CONNEXION TEMPS RÉEL MULTI-APPAREILS (SSE & FIRESTORE)
// ---------------------------------------------------------
let eventSource = null;
let reconnectTimer = null;

export function setupRealtimeStream() {
  if (typeof window === 'undefined') return;

  // Si Firebase Firestore est actif, souscrire aux documents en direct
  if (isFirebaseActive && firestoreDb) {
    const collections = ['clients', 'agents', 'admins', 'passages', 'complaints'];
    collections.forEach(sliceKey => {
      try {
        const docRef = doc(firestoreDb, "appState", sliceKey);
        onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const remoteData = snapshot.data();
            if (remoteData && Array.isArray(remoteData.data)) {
              setStoredData(sliceKey, remoteData.data);
              listeners.forEach(cb => {
                try {
                  cb({ sliceKey, data: remoteData.data, timestamp: remoteData.timestamp || Date.now() });
                } catch (e) {
                  console.error(e);
                }
              });
            }
          }
        }, (err) => {
          console.warn(`[Firebase Snapshot warning on ${sliceKey}]:`, err.message);
        });
      } catch (err) {
        console.warn(`[Firebase attach error on ${sliceKey}]:`, err);
      }
    });
    return;
  }

  // Sinon, utiliser le moteur temps réel natif Eco Clean via Server-Sent Events (SSE)
  if (typeof EventSource === 'undefined') return;

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

// Gestion intelligente du cycle de vie des téléphones mobiles (veille / réveil / reprise)
if (typeof window !== 'undefined') {
  fetchServerData();
  setupRealtimeStream();

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

  // Polling doux de secours
  setInterval(() => {
    fetchServerData();
  }, 4000);
}

// ---------------------------------------------------------
// 5. DIFFUSION ET SAUVEGARDE DES MODIFICATIONS
// ---------------------------------------------------------
export async function broadcastStateUpdate(sliceKey, data) {
  // 1. Sauvegarde locale synchrone immédiate
  setStoredData(sliceKey, data);

  const payload = { sliceKey, data, timestamp: Date.now() };

  // 2. Notification locale instantanée
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

  // 3. Diffusion Firebase Firestore si actif
  if (isFirebaseActive && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "appState", sliceKey);
      setDoc(docRef, { data, timestamp: payload.timestamp }, { merge: true }).catch(err => {
        console.warn('[Firebase setDoc warning]:', err.message);
      });
    } catch (err) {
      console.warn('[Firebase setDoc sync error]:', err);
    }
  }

  // 4. Envoi au serveur partagé multi-appareils (Express / Vite)
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
    } catch {
      // Données préservées en LocalStorage
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
 * Statut complet de la synchronisation et de Firebase
 */
export function getFirebaseStatus() {
  const isSSEConnected = eventSource && eventSource.readyState === EventSource.OPEN;
  return {
    isConnected: true,
    realtimeActive: Boolean(isSSEConnected || isFirebaseActive),
    isFirebaseConfigured: Boolean(isFirebaseActive),
    engine: isFirebaseActive 
      ? 'Google Firebase Firestore (Cloud Direct)' 
      : 'Moteur Multi-Appareils Eco Clean (SSE + REST + LocalStorage)',
    statusLabel: isFirebaseActive 
      ? '🟢 Connecté à Firebase Firestore' 
      : '🟢 Synchronisation Temps Réel Active (Moteur Multi-Écrans Eco Clean)',
    description: isFirebaseActive
      ? 'Les données sont synchronisées directement avec la base de données Google Cloud Firestore.'
      : 'Synchronisation instantanée multi-téléphones active via le serveur Eco Clean & SSE. Pour relier un compte Firebase externe, renseignez vos clés VITE_FIREBASE_* dans le fichier .env.'
  };
}
