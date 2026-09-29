// Firebase configuration for Suresh Enterprises
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is configured with real keys
const PLACEHOLDER_KEYS = ['', 'your_firebase_api_key', 'your_api_key', 'undefined'];

export const isFirebaseConfigured = () => {
  const key = firebaseConfig.apiKey?.trim().toLowerCase();
  return !!(
    key &&
    !PLACEHOLDER_KEYS.includes(key) &&
    firebaseConfig.projectId &&
    !PLACEHOLDER_KEYS.includes(firebaseConfig.projectId.trim().toLowerCase()) &&
    firebaseConfig.appId &&
    !PLACEHOLDER_KEYS.includes(firebaseConfig.appId.trim().toLowerCase())
  );
};

let app = null;
let auth = null;
let db = null;

// Only initialize Firebase if real credentials are provided
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.info('Firebase not configured. Please add credentials to .env file.');
}

export { auth, db };
export default app;
