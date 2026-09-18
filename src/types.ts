export type ContainerStatus = 
  | 'Gate In' 
  | 'Yard Stacking' 
  | 'Customs / Pemeriksaan' 
  | 'Loading ke Kapal' 
  | 'Discharged' 
  | 'Gate Out';

export type LoadStatus = 'FCL' | 'LCL' | 'Empty (MTY)';

export type ContainerType = 
  | '20ft Standard Dry (20GP)'
  | '40ft Standard Dry (40GP)'
  | '40ft High Cube (40HC)'
  | '20ft Reefer (20RF)'
  | '40ft Reefer (40RH)'
  | '40ft Open Top (40OT)'
  | '20ft Tank ISO (20TK)'
  | '45ft High Cube (45HC)';

export type ContainerCondition = 'Baik / Prima' | 'Penyok Ringan' | 'Rusak / Perlu Perbaikan' | 'Segel Rusak';

export interface ContainerItem {
  id: string;
  containerNumber: string; // Misal: TCKU9248102
  sizeType: ContainerType;
  status: ContainerStatus;
  loadStatus: LoadStatus;
  yardBlock: 'A' | 'B' | 'C' | 'D';
  yardBay: string;   // 01 - 24
  yardRow: string;   // 01 - 08
  yardTier: number;  // 1 - 5
  yardSlot: string;  // Generated A-04-02-3
  grossWeight: number; // in Ton
  maxPayload?: number; // in Ton
  sealNumber: string;
  shippingLine: string;
  vesselName: string;
  voyageNumber: string;
  portOfLoading: string;
  portOfDischarge: string;
  temperature?: string; // Khusus reefer e.g. -20°C
  condition: ContainerCondition;
  driverName?: string;
  truckPlate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  containerNumber: string;
  action: 'CREATE' | 'UPDATE' | 'RELOCATE' | 'STATUS_CHANGE' | 'DELETE';
  title: string;
  details: string;
  operator: string;
  timestamp: string;
}

export interface OperatorUser {
  uid: string;
  name: string;
  email: string;
  role: 'Yard Master' | 'Crane Operator' | 'Surveyor / Tally' | 'Shipping Agent' | 'Operator Umum';
  badgeNumber: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
