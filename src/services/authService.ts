import { 
  signInAnonymously, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

// Listener status otentikasi Firebase (Real-time dari Firebase Auth & Firestore)
// TIDAK menggunakan localStorage, sepenuhnya dikelola oleh Firebase
export function subscribeToAuth(
  onUserChanged: (user: OperatorUser | null) => void,
  onError: (err: Error) => void
) {
  return onAuthStateChanged(
    auth,
    async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        onUserChanged(null);
        return;
      }

      try {
        // Ambil profil operator dari Firestore 'operatorProfiles'
        const profileDocRef = doc(db, 'operatorProfiles', firebaseUser.uid);
        const profileSnap = await getDoc(profileDocRef);

        if (profileSnap.exists()) {
          onUserChanged(profileSnap.data() as OperatorUser);
        } else {
          // Jika belum ada dokumen profil di Firestore (misal user baru)
          const fallbackUser: OperatorUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Operator Terminal',
            email: firebaseUser.email || 'operator@terminal-port.id',
            role: 'Operator Umum',
            badgeNumber: `OP-${firebaseUser.uid.substring(0, 4).toUpperCase()}`
          };
          await setDoc(profileDocRef, fallbackUser);
          onUserChanged(fallbackUser);
        }
      } catch (err) {
        console.error('Error saat membaca profil operator dari Firestore:', err);
        // Fallback aman dari user instance
        onUserChanged({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Operator Terminal',
          email: firebaseUser.email || 'operator@terminal-port.id',
          role: 'Operator Umum',
          badgeNumber: 'OP-001'
        });
      }
    },
    (error) => {
      console.error('Auth state error:', error);
      onError(error);
    }
  );
}

// Fungsi Login Cepat Demo (Bisa Login Semua)
export async function loginWithDemo(demoId: string): Promise<OperatorUser> {
  const demo = DEMO_OPERATORS.find((d) => d.id === demoId) || DEMO_OPERATORS[0];

  // 1. Login ke Firebase Auth secara aman
  let userCred;
  try {
    userCred = await signInAnonymously(auth);
  } catch (err) {
    console.warn('Firebase signInAnonymously warning, creating auth fallback:', err);
  }

  const uid = userCred?.user?.uid || `user-${Date.now()}`;
  const profile: OperatorUser = {
    uid: uid,
    name: demo.name,
    email: demo.email,
    role: demo.role,
    badgeNumber: demo.badgeNumber
  };

  // 2. Simpan profil operator ke Cloud Firestore secara persisten
  try {
    const profileRef = doc(db, 'operatorProfiles', uid);
    await setDoc(profileRef, {
      ...profile,
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error('Gagal menulis profil ke Firestore:', e);
  }

  return profile;
}

// Fungsi Login Kustom (Bisa login siapa saja dengan email/nama & password apa saja)
export async function loginCustomUser(
  identifier: string,
  _password?: string
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
    console.warn('Firebase anonymous signin warning:', err);
  }

  const uid = userCred?.user?.uid || `custom-${Date.now()}`;
  const profile: OperatorUser = {
    uid: uid,
    name: formattedName || 'Petugas Lapangan',
    email: email,
    role: 'Operator Umum',
    badgeNumber: `OP-${Math.floor(1000 + Math.random() * 9000)}`
  };

  // Simpan profil ke Cloud Firestore
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

// Logout dari Firebase
export async function logoutOperator(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Gagal sign out Firebase:', err);
  }
}
