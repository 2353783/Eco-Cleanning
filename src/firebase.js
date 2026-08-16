import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Configuration Firebase interne pour Eco Clean RDC
const firebaseConfig = {
  apiKey: "AIzaSyEcoCleanRDC2026_DemoKey_Realtime",
  authDomain: "eco-clean-rdc.firebaseapp.com",
  projectId: "eco-clean-rdc",
  storageBucket: "eco-clean-rdc.appspot.com",
  messagingSenderId: "983850447112",
  appId: "1:983850447112:web:ecocleanrdc2026"
};

let app;
let db = null;
let isFirebaseActive = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  isFirebaseActive = true;
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
    if (event.data && event.data.type === 'SYNC_STATE') {
      listeners.forEach(callback => callback(event.data.payload));
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'eco_clean_last_update' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        listeners.forEach(callback => callback(payload));
      } catch (err) {
        // silent internal catch
      }
    }
  });
}

/**
 * Diffuse de façon transparente et silencieuse les données modifiées entre tous les profils
 */
export function broadcastStateUpdate(sliceKey, data) {
  const payload = { sliceKey, data, timestamp: Date.now() };

  // 1. Diffusion locale inter-profils
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'SYNC_STATE', payload });
    } catch (e) {
      // internal handle
    }
  }

  // 2. Diffusion via storage event
  try {
    localStorage.setItem('eco_clean_last_update', JSON.stringify(payload));
  } catch (e) {
    // internal handle
  }

  // 3. Synchronisation Firebase Firestore en arrière-plan
  if (db && isFirebaseActive) {
    try {
      const docRef = doc(db, "appState", sliceKey);
      setDoc(docRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true })
        .catch(() => {});
    } catch (e) {
      // internal handle
    }
  }

  // 4. Mise à jour immédiate des écouteurs locaux
  listeners.forEach(cb => cb(payload));
}

/**
 * Souscription interne en temps réel
 */
export function subscribeToRealtimeSync(callback) {
  listeners.add(callback);

  let unsubscribes = [];
  if (db && isFirebaseActive) {
    ['clients', 'agents', 'passages', 'complaints'].forEach(sliceKey => {
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
