import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Firebase web config is public by design; access is enforced by Firestore rules.
const firebaseConfig = {
  apiKey: 'AIzaSyDl4lPsVRZ8gvAwyvs0LjDUZn6Je1bxw1s',
  authDomain: 'sureshenterprises.firebaseapp.com',
  projectId: 'sureshenterprises',
  storageBucket: 'sureshenterprises.firebasestorage.app',
  messagingSenderId: '1094048551373',
  appId: '1:1094048551373:web:2556e16ec5d469140df484',
  measurementId: 'G-V3SH2Q5BZ7',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Cache data locally so the app opens instantly and survives flaky connections.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
