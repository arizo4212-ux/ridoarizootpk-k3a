import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Inisialisasi Firebase App
export const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore dengan Database ID khusus dari konfigurasi
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Inisialisasi Firebase Authentication
export const auth = getAuth(app);
