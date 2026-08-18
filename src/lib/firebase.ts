import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let db: Firestore;
try {
  const config = firebaseConfig as any;
  if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, config.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  console.warn('Initializing default firestore fallback:', e);
  db = getFirestore(app);
}

export { app, db, firebaseConfig };
