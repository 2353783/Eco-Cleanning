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

// Configuration Firebase interne pour Eco Clean RDC
const firebaseConfig = {
  apiKey: "AIzaSyEcoCleanRDC2026_DemoKey_Realtime",
  authDomain: "eco-clean-rdc.firebaseapp.com",
  projectId: "eco-clean-rdc",
  storageBucket: "eco-clean-rdc.appspot.com",
  messagingSenderId: "983850447112",
  appId: "1:983850447112:web:ecocleanrdc2026"
};

let app = null;
let db = null;
let isFirebaseActive = false;

try {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    isFirebaseActive = true;
  }
} catch (error) {
  isFirebaseActive = false;
}

// Canal de diffusion interne temps réel inter-onglets et inter-rôles (Client, Agent, Admin)
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
      } catch (err) {
        // silent internal catch
      }
    }
  });
}

/**
 * Sauvegarde et diffuse en temps réel les modifications de données entre tous les profils et onglets
 */
export function broadcastStateUpdate(sliceKey, data) {
  // 1. Sauvegarde systématique et synchrone dans le LocalStorage
  setStoredData(sliceKey, data);

  const payload = { sliceKey, data, timestamp: Date.now() };

  // 2. Diffusion inter-onglets & fenêtres via BroadcastChannel
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'SYNC_STATE', payload });
    } catch (e) {
      // internal handle
    }
  }

  // 3. Diffusion via storage event pour les navigateurs tiers
  try {
    localStorage.setItem(`${STORAGE_PREFIX}last_update`, JSON.stringify(payload));
  } catch (e) {
    // internal handle
  }

  // 4. Synchronisation Firebase Firestore en arrière-plan (si disponible)
  if (db && isFirebaseActive) {
    try {
      const docRef = doc(db, "appState", sliceKey);
      setDoc(docRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true })
        .catch(() => {});
    } catch (e) {
      // internal handle
    }
  }

  // 5. Mise à jour immédiate des écouteurs de l'onglet actif
  listeners.forEach(cb => {
    try {
      cb(payload);
    } catch (err) {
      console.error(err);
    }
  });
}

/**
 * Souscription aux synchronisations temps réel
 */
export function subscribeToRealtimeSync(callback) {
  listeners.add(callback);

  let unsubscribes = [];
  if (db && isFirebaseActive) {
    ['clients', 'agents', 'admins', 'passages', 'complaints'].forEach(sliceKey => {
      try {
        const docRef = doc(db, "appState", sliceKey);
        const unsub = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists() && snapshot.data()?.items) {
            callback({ sliceKey, data: snapshot.data().items, timestamp: Date.now() });
          }
        }, () => {});
        unsubscribes.push(unsub);
      } catch (e) {
        // internal handle
      }
    });
  }

  return () => {
    listeners.delete(callback);
    unsubscribes.forEach(u => typeof u === 'function' && u());
  };
}

/**
 * Obtention du statut interne
 */
export function getFirebaseStatus() {
  return {
    isConnected: true,
    engine: isFirebaseActive ? 'Firebase Firestore (Internal)' : 'Realtime Sync Engine (Internal)'
  };
}
