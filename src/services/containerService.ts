import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ContainerItem, ActivityLog } from '../types';

const CONTAINERS_COLLECTION = 'containers';
const LOGS_COLLECTION = 'activityLogs';

// Helper validasi nomor kontainer ISO 6346 (Format: 4 Huruf + 7 Angka)
export function validateContainerNumber(num: string): { isValid: boolean; message: string } {
  const clean = num.replace(/[\s-]/g, '').toUpperCase();
  if (!clean) {
    return { isValid: false, message: 'Nomor peti kemas wajib diisi' };
  }
  if (clean.length !== 11) {
    return { isValid: false, message: 'Nomor peti kemas harus berjumlah 11 karakter (4 huruf prefiks + 7 angka, misal: MSKU7421893)' };
  }
  const regex = /^[A-Z]{4}\d{7}$/;
  if (!regex.test(clean)) {
    return { isValid: false, message: 'Format ISO 6346 tidak valid. Harus diawali 4 huruf kapital diikuti 7 digit angka.' };
  }
  return { isValid: true, message: 'Format nomor kontainer valid (ISO 6346)' };
}

// Data awal (Seed) untuk inisialisasi Firestore jika database masih kosong
const INITIAL_SEED_CONTAINERS: Omit<ContainerItem, 'id'>[] = [
  {
    containerNumber: 'MSKU7421893',
    sizeType: '40ft High Cube (40HC)',
    status: 'Yard Stacking',
    loadStatus: 'FCL',
    yardBlock: 'A',
    yardBay: '04',
    yardRow: '02',
    yardTier: 3,
    yardSlot: 'A-04-02-3',
    grossWeight: 26.8,
    maxPayload: 30.5,
    sealNumber: 'ML-ID884920',
    shippingLine: 'Maersk Line',
    vesselName: 'MV Maersk Mc-Kinney',
    voyageNumber: 'MK-2026W',
    portOfLoading: 'Tanjung Priok, ID',
    portOfDischarge: 'Port of Rotterdam, NL',
    condition: 'Baik / Prima',
    driverName: 'Bambang Supriyanto',
    truckPlate: 'B 9283 UIX',
    notes: 'Prioritas ekspor kopi luwak & rempah ke Eropa',
    createdBy: 'master@terminal-port.id',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    containerNumber: 'TCKU2049180',
    sizeType: '20ft Standard Dry (20GP)',
    status: 'Gate In',
    loadStatus: 'FCL',
    yardBlock: 'B',
    yardBay: '02',
    yardRow: '01',
    yardTier: 1,
    yardSlot: 'B-02-01-1',
    grossWeight: 18.4,
    maxPayload: 28.0,
    sealNumber: 'EMC-783912',
    shippingLine: 'Evergreen Marine',
    vesselName: 'Ever Ace',
    voyageNumber: 'EA-091N',
    portOfLoading: 'Tanjung Perak, ID',
    portOfDischarge: 'Kaohsiung Port, TW',
    condition: 'Baik / Prima',
    driverName: 'Agus Setiawan',
    truckPlate: 'L 8412 UQ',
    notes: 'Kargo tekstil garmen siap stuffing & timbang',
    createdBy: 'operator@terminal-port.id',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    containerNumber: 'TGHU8921034',
    sizeType: '20ft Reefer (20RF)',
    status: 'Customs / Pemeriksaan',
    loadStatus: 'FCL',
    yardBlock: 'C',
    yardBay: '06',
    yardRow: '03',
    yardTier: 2,
    yardSlot: 'C-06-03-2',
    grossWeight: 22.1,
    maxPayload: 29.0,
    sealNumber: 'BC-JKT-9921',
    shippingLine: 'CMA CGM',
    vesselName: 'CMA CGM Palais Royal',
    voyageNumber: 'CGM-442E',
    portOfLoading: 'Tanjung Priok, ID',
    portOfDischarge: 'Port of Tokyo, JP',
    temperature: '-18°C',
    condition: 'Baik / Prima',
    driverName: 'Joko Widodo Prasetyo',
    truckPlate: 'B 9172 PAA',
    notes: 'Kargo udang beku & tuna segar, colokan listrik reefer aktif di slot C-06',
    createdBy: 'surveyor@terminal-port.id',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    containerNumber: 'MEDU5839201',
    sizeType: '40ft Standard Dry (40GP)',
    status: 'Loading ke Kapal',
    loadStatus: 'FCL',
    yardBlock: 'A',
    yardBay: '08',
    yardRow: '01',
    yardTier: 4,
    yardSlot: 'A-08-01-4',
    grossWeight: 28.9,
    maxPayload: 30.5,
    sealNumber: 'MSC-SEAL-4481',
    shippingLine: 'MSC (Mediterranean Shipping)',
    vesselName: 'MSC Irina',
    voyageNumber: 'MS-881S',
    portOfLoading: 'Tanjung Priok, ID',
    portOfDischarge: 'Port of Singapore, SG',
    condition: 'Penyok Ringan',
    driverName: 'Suryadi',
    truckPlate: 'B 9044 WY',
    notes: 'Ada sedikit penyok di pintu kanan, segel utuh dan lolos surveyor',
    createdBy: 'master@terminal-port.id',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    containerNumber: 'ONEU3918274',
    sizeType: '20ft Standard Dry (20GP)',
    status: 'Yard Stacking',
    loadStatus: 'Empty (MTY)',
    yardBlock: 'D',
    yardBay: '01',
    yardRow: '04',
    yardTier: 1,
    yardSlot: 'D-01-04-1',
    grossWeight: 2.3,
    maxPayload: 28.0,
    sealNumber: 'NONE-EMPTY',
    shippingLine: 'ONE (Ocean Network Express)',
    vesselName: 'ONE Continuity',
    voyageNumber: 'OC-112B',
    portOfLoading: 'Tanjung Priok, ID',
    portOfDischarge: 'Belawan, ID',
    condition: 'Baik / Prima',
    driverName: 'Deddy Kurnia',
    truckPlate: 'B 9481 TYZ',
    notes: 'Peti kemas kosong siap dialokasikan untuk eksportir furniture',
    createdBy: 'agent@terminal-port.id',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    containerNumber: 'MERU6192830',
    sizeType: '40ft High Cube (40HC)',
    status: 'Gate Out',
    loadStatus: 'FCL',
    yardBlock: 'B',
    yardBay: '10',
    yardRow: '02',
    yardTier: 1,
    yardSlot: 'B-10-02-1',
    grossWeight: 24.5,
    maxPayload: 30.0,
    sealNumber: 'MRT-88301',
    shippingLine: 'Meratus Line',
    vesselName: 'Meratus Jayakarta',
    voyageNumber: 'MJ-043',
    portOfLoading: 'Makassar, ID',
    portOfDischarge: 'Tanjung Priok, ID',
    condition: 'Baik / Prima',
    driverName: 'Iwan Fajar',
    truckPlate: 'B 9532 KLL',
    notes: 'Telah terbit SPPB & EIR resmi, keluar menuju gudang Cikarang',
    createdBy: 'operator@terminal-port.id',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

// Subscribe ke data Containers secara Real-time dari Firestore
export function subscribeToContainers(
  onSuccess: (containers: ContainerItem[]) => void,
  onError: (error: Error) => void
) {
  const colRef = collection(db, CONTAINERS_COLLECTION);
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ContainerItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ContainerItem);
      });

      // Urutkan berdasarkan updatedAt terbaru
      items.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

      // Jika database di Firestore masih kosong, panggil seeding otomatis
      if (snapshot.empty) {
        seedInitialContainers();
      } else {
        onSuccess(items);
      }
    },
    (err) => {
      console.error('Error saat mendengarkan data real-time Firestore:', err);
      onError(err);
    }
  );
}

// Subscribe ke Activity Logs secara Real-time dari Firestore
export function subscribeToLogs(
  onSuccess: (logs: ActivityLog[]) => void,
  onError: (error: Error) => void
) {
  const colRef = collection(db, LOGS_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ActivityLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ActivityLog);
      });
      onSuccess(logs);
    },
    (err) => {
      console.error('Error saat mendengarkan activity logs Firestore:', err);
      onError(err);
    }
  );
}

// Inisialisasi data awal di Firestore (hanya jika database kosong)
export async function seedInitialContainers(): Promise<void> {
  try {
    const colRef = collection(db, CONTAINERS_COLLECTION);
    const existing = await getDocs(colRef);
    if (!existing.empty) return;

    for (const item of INITIAL_SEED_CONTAINERS) {
      await addDoc(colRef, item);
    }

    // Tambah log inisialisasi sistem
    await addDoc(collection(db, LOGS_COLLECTION), {
      containerNumber: 'TERMINAL-INIT',
      action: 'CREATE',
      title: 'Inisialisasi Sistem Peti Kemas',
      details: 'Inisialisasi 6 data operasional peti kemas awal ke Cloud Firestore',
      operator: 'System Yard Master',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gagal melakukan seeding data awal Firestore:', error);
  }
}

// CREATE: Tambah kontainer baru ke Firestore
export async function createContainer(
  data: Omit<ContainerItem, 'id' | 'createdAt' | 'updatedAt' | 'yardSlot'>,
  operatorName: string
): Promise<string> {
  const cleanContainerNum = data.containerNumber.replace(/[\s-]/g, '').toUpperCase();
  
  // Format yard slot: Blok-Bay-Row-Tier (misal: A-04-02-3)
  const formattedSlot = `${data.yardBlock}-${data.yardBay.padStart(2, '0')}-${data.yardRow.padStart(2, '0')}-${data.yardTier}`;

  const now = new Date().toISOString();
  const newContainer: Omit<ContainerItem, 'id'> = {
    ...data,
    containerNumber: cleanContainerNum,
    yardSlot: formattedSlot,
    createdAt: now,
    updatedAt: now,
    createdBy: operatorName
  };

  const docRef = await addDoc(collection(db, CONTAINERS_COLLECTION), newContainer);

  // Catat log audit ke Firestore
  await addDoc(collection(db, LOGS_COLLECTION), {
    containerNumber: cleanContainerNum,
    action: 'CREATE',
    title: `Penerimaan Peti Kemas (${cleanContainerNum})`,
    details: `Telah didaftarkan oleh ${operatorName} ke Blok ${formattedSlot} dengan status ${data.status}`,
    operator: operatorName,
    timestamp: now
  });

  return docRef.id;
}

// UPDATE: Perbarui data kontainer di Firestore
export async function updateContainer(
  id: string,
  data: Partial<ContainerItem>,
  operatorName: string
): Promise<void> {
  const docRef = doc(db, CONTAINERS_COLLECTION, id);
  const now = new Date().toISOString();

  // Jika posisi yard berubah, generate ulang yardSlot
  let updatedSlot = data.yardSlot;
  if (data.yardBlock && data.yardBay && data.yardRow && data.yardTier) {
    updatedSlot = `${data.yardBlock}-${data.yardBay.padStart(2, '0')}-${data.yardRow.padStart(2, '0')}-${data.yardTier}`;
  }

  const updatePayload: Record<string, any> = {
    ...data,
    updatedAt: now
  };

  if (updatedSlot) {
    updatePayload.yardSlot = updatedSlot;
  }
  if (data.containerNumber) {
    updatePayload.containerNumber = data.containerNumber.replace(/[\s-]/g, '').toUpperCase();
  }

  await updateDoc(docRef, updatePayload);

  // Catat log audit ke Firestore
  await addDoc(collection(db, LOGS_COLLECTION), {
    containerNumber: data.containerNumber || 'UPDATE',
    action: 'UPDATE',
    title: `Pembaruan Data Peti Kemas`,
    details: `Diperbarui oleh ${operatorName}: Status ${data.status || 'Tetap'}, Posisi ${updatedSlot || 'Tetap'}`,
    operator: operatorName,
    timestamp: now
  });
}

// DELETE: Hapus data kontainer dari Firestore
export async function deleteContainer(
  id: string,
  containerNumber: string,
  operatorName: string,
  reason: string
): Promise<void> {
  const docRef = doc(db, CONTAINERS_COLLECTION, id);
  await deleteDoc(docRef);

  const now = new Date().toISOString();
  await addDoc(collection(db, LOGS_COLLECTION), {
    containerNumber: containerNumber,
    action: 'DELETE',
    title: `Penghapusan Peti Kemas (${containerNumber})`,
    details: `Dihapus oleh ${operatorName}. Alasan: ${reason || 'Pembersihan manifes data'}`,
    operator: operatorName,
    timestamp: now
  });
}
