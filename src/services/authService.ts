import { 
  signInAnonymously, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { OperatorUser } from '../types';

export const DEMO_OPERATORS: {
  id: string;
  name: string;
  email: string;
  role: OperatorUser['role'];
  badgeNumber: string;
  desc: string;
  avatarColor: string;
}[] = [
  {
    id: 'demo-master',
    name: 'Capt. Budi Santoso',
    email: 'master@terminal-port.id',
    role: 'Yard Master',
    badgeNumber: 'YM-9901',
    desc: 'Kepala Operasional Lapangan & Alokasi Blok Peti Kemas',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'demo-crane',
    name: 'Hendra Wijaya',
    email: 'crane.operator@terminal-port.id',
    role: 'Crane Operator',
    badgeNumber: 'CO-4412',
    desc: 'Operator Quay Crane & Rubber Tyred Gantry (RTG)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'demo-surveyor',
    name: 'Siti Rahmawati, S.T.',
    email: 'surveyor.tally@terminal-port.id',
    role: 'Surveyor / Tally',
    badgeNumber: 'SV-7723',
    desc: 'Petugas Tally, Inspeksi Segel & Bea Cukai Karantina',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'demo-agent',
    name: 'Doni Kusuma',
    email: 'agent.expedisi@terminal-port.id',
    role: 'Shipping Agent',
    badgeNumber: 'SA-2281',
    desc: 'Perwakilan Pelayaran & Penerbitan EIR Gate In/Out',
    avatarColor: 'bg-indigo-600'
  }
];

// Document ID untuk sesi aktif di Firestore (Single Source of Truth, 0% localStorage)
const ACTIVE_SESSION_DOC = 'current_active_session';

// Listener status otentikasi (Real-time dari Firestore & Firebase Auth)
// TIDAK menggunakan localStorage, sepenuhnya dikelola oleh Cloud Firestore
export function subscribeToAuth(
  onUserChanged: (user: OperatorUser | null) => void,
  onError: (err: Error) => void
) {
  // Mendengarkan sesi aktif dari Firestore 'operatorProfiles/current_active_session'
  const sessionDocRef = doc(db, 'operatorProfiles', ACTIVE_SESSION_DOC);
  
  const unsubscribeFirestore = onSnapshot(
    sessionDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.active !== false && data.uid) {
          onUserChanged(data as OperatorUser);
          return;
        }
      }
      onUserChanged(null);
    },
    (error) => {
      console.warn('Firestore auth listener notice:', error);
      // Fallback ke Firebase Auth listener jika ada
      onError(error);
    }
  );

  return () => {
    unsubscribeFirestore();
  };
}

// Fungsi Login Cepat Demo (Bisa Login Semua)
export async function loginWithDemo(demoId: string): Promise<OperatorUser> {
  const demo = DEMO_OPERATORS.find((d) => d.id === demoId) || DEMO_OPERATORS[0];

  // Coba otentikasi Firebase Auth jika tersedia
  let userCred;
  try {
    userCred = await signInAnonymously(auth);
  } catch (err) {
    console.warn('Firebase Auth anonymous login notice (fallback to Firestore session):', err);
  }

  const uid = userCred?.user?.uid || `demo-${demo.id}`;
  const profile: OperatorUser = {
    uid: uid,
    name: demo.name,
    email: demo.email,
    role: demo.role,
    badgeNumber: demo.badgeNumber
  };

  // Simpan profil dan tandai sesi aktif di Cloud Firestore (Real Database Persisten)
  const sessionDocRef = doc(db, 'operatorProfiles', ACTIVE_SESSION_DOC);
  await setDoc(sessionDocRef, {
    ...profile,
    active: true,
    lastLogin: new Date().toISOString()
  });

  // Simpan juga ke koleksi operator terdaftar
  try {
    const profileRef = doc(db, 'operatorProfiles', uid);
    await setDoc(profileRef, {
      ...profile,
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error('Gagal menulis profil operator ke Firestore:', e);
  }

  return profile;
}

// Fungsi Login Kustom (Bisa login siapa saja dengan email/nama & password apa saja)
export async function loginCustomUser(
  identifier: string,
  _password?: string,
  customRole: OperatorUser['role'] = 'Operator Umum'
): Promise<OperatorUser> {
  const cleanName = identifier.includes('@') 
    ? identifier.split('@')[0].replace(/[._]/g, ' ') 
    : identifier;

  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const email = identifier.includes('@') ? identifier : `${identifier.toLowerCase().replace(/\s+/g, '')}@terminal-port.id`;

  let userCred;
  try {
    userCred = await signInAnonymously(auth);
  } catch (err) {
    console.warn('Firebase Auth notice (fallback to Firestore session):', err);
  }

  const uid = userCred?.user?.uid || `custom-${Date.now()}`;
  const profile: OperatorUser = {
    uid: uid,
    name: formattedName || 'Petugas Lapangan',
    email: email,
    role: customRole,
    badgeNumber: `OP-${Math.floor(1000 + Math.random() * 9000)}`
  };

  // Simpan ke sesi aktif di Cloud Firestore (Real Database Persisten)
  const sessionDocRef = doc(db, 'operatorProfiles', ACTIVE_SESSION_DOC);
  await setDoc(sessionDocRef, {
    ...profile,
    active: true,
    lastLogin: new Date().toISOString()
  });

  // Simpan juga di arsip profil
  try {
    const profileRef = doc(db, 'operatorProfiles', uid);
    await setDoc(profileRef, {
      ...profile,
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error('Gagal menulis custom operator ke Firestore:', e);
  }

  return profile;
}

// Logout dari Firebase & Firestore
export async function logoutOperator(): Promise<void> {
  try {
    // 1. Hapus / nonaktifkan sesi di Cloud Firestore
    const sessionDocRef = doc(db, 'operatorProfiles', ACTIVE_SESSION_DOC);
    await setDoc(sessionDocRef, { active: false, loggedOutAt: new Date().toISOString() });
    
    // 2. Sign out dari Firebase Auth jika terhubung
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Gagal logout Firebase:', err);
  }
}
