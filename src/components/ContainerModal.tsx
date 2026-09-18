import React, { useState, useEffect } from 'react';
import { 
  X, 
  Container, 
  Check, 
  AlertCircle, 
  ShieldAlert, 
  Truck, 
  Anchor, 
  Thermometer, 
  Layers, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import { 
  ContainerItem, 
  ContainerType, 
  ContainerStatus, 
  LoadStatus, 
  ContainerCondition 
} from '../types';
import { validateContainerNumber } from '../services/containerService';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ContainerItem, 'id' | 'createdAt' | 'updatedAt' | 'yardSlot'>) => Promise<void>;
  initialData?: ContainerItem | null;
  currentOperatorEmail: string;
}

const CONTAINER_TYPES: ContainerType[] = [
  '20ft Standard Dry (20GP)',
  '40ft Standard Dry (40GP)',
  '40ft High Cube (40HC)',
  '20ft Reefer (20RF)',
  '40ft Reefer (40RH)',
  '40ft Open Top (40OT)',
  '20ft Tank ISO (20TK)',
  '45ft High Cube (45HC)'
];

const CONTAINER_STATUSES: ContainerStatus[] = [
  'Gate In',
  'Yard Stacking',
  'Customs / Pemeriksaan',
  'Loading ke Kapal',
  'Discharged',
  'Gate Out'
];

const LOAD_STATUSES: LoadStatus[] = ['FCL', 'LCL', 'Empty (MTY)'];

const CONDITIONS: ContainerCondition[] = [
  'Baik / Prima',
  'Penyok Ringan',
  'Rusak / Perlu Perbaikan',
  'Segel Rusak'
];

const SHIPPING_LINES = [
  'Maersk Line',
  'Evergreen Marine',
  'MSC (Mediterranean Shipping)',
  'CMA CGM',
  'ONE (Ocean Network Express)',
  'Hapag-Lloyd',
  'Meratus Line',
  'Samudera Indonesia',
  'Temas Line',
  'Cosco Shipping',
  'Wan Hai Lines'
];

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentOperatorEmail
}) => {
  const isEdit = !!initialData;

  // State Form
  const [containerNumber, setContainerNumber] = useState('');
  const [sizeType, setSizeType] = useState<ContainerType>('20ft Standard Dry (20GP)');
  const [status, setStatus] = useState<ContainerStatus>('Gate In');
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('FCL');
  const [yardBlock, setYardBlock] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [yardBay, setYardBay] = useState('02');
  const [yardRow, setYardRow] = useState('01');
  const [yardTier, setYardTier] = useState<number>(1);
  const [grossWeight, setGrossWeight] = useState<number>(18.5);
  const [maxPayload, setMaxPayload] = useState<number>(30.5);
  const [sealNumber, setSealNumber] = useState('');
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [portOfLoading, setPortOfLoading] = useState('Tanjung Priok, ID');
  const [portOfDischarge, setPortOfDischarge] = useState('Port of Singapore, SG');
  const [temperature, setTemperature] = useState('');
  const [condition, setCondition] = useState<ContainerCondition>('Baik / Prima');
  const [driverName, setDriverName] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [notes, setNotes] = useState('');

  // Validasi & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inisialisasi data form saat modal dibuka
  useEffect(() => {
    if (initialData) {
      setContainerNumber(initialData.containerNumber);
      setSizeType(initialData.sizeType);
      setStatus(initialData.status);
      setLoadStatus(initialData.loadStatus);
      setYardBlock(initialData.yardBlock || 'A');
      setYardBay(initialData.yardBay || '01');
      setYardRow(initialData.yardRow || '01');
      setYardTier(initialData.yardTier || 1);
      setGrossWeight(initialData.grossWeight);
      setMaxPayload(initialData.maxPayload || 30.5);
      setSealNumber(initialData.sealNumber || '');
      setShippingLine(initialData.shippingLine || 'Maersk Line');
      setVesselName(initialData.vesselName || '');
      setVoyageNumber(initialData.voyageNumber || '');
      setPortOfLoading(initialData.portOfLoading || 'Tanjung Priok, ID');
      setPortOfDischarge(initialData.portOfDischarge || 'Port of Singapore, SG');
      setTemperature(initialData.temperature || '');
      setCondition(initialData.condition || 'Baik / Prima');
      setDriverName(initialData.driverName || '');
      setTruckPlate(initialData.truckPlate || '');
      setNotes(initialData.notes || '');
    } else {
      // Reset Default Form Baru
      setContainerNumber('');
      setSizeType('20ft Standard Dry (20GP)');
      setStatus('Gate In');
      setLoadStatus('FCL');
      setYardBlock('A');
      setYardBay('02');
      setYardRow('01');
      setYardTier(1);
      setGrossWeight(18.5);
      setMaxPayload(30.5);
      setSealNumber(`SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setShippingLine('Maersk Line');
      setVesselName('MV Meratus Prima');
      setVoyageNumber('V-2026');
      setPortOfLoading('Tanjung Priok, ID');
      setPortOfDischarge('Port of Singapore, SG');
      setTemperature('');
      setCondition('Baik / Prima');
      setDriverName('Ahmad Fauzi');
      setTruckPlate('B 9831 UEL');
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Realtime ISO 6346 validator
  const isoValidation = validateContainerNumber(containerNumber);
  const isReefer = sizeType.includes('Reefer');
  const isOverweight = grossWeight > 30.5;

  // Validasi Input yang Ketat
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Validasi Nomor Peti Kemas (ISO 6346)
    const cleanNum = containerNumber.replace(/[\s-]/g, '').toUpperCase();
    if (!cleanNum) {
      errs.containerNumber = 'Nomor peti kemas wajib diisi';
    } else if (cleanNum.length !== 11) {
      errs.containerNumber = 'Panjang nomor peti kemas harus 11 karakter (4 huruf prefiks + 7 digit angka)';
    } else if (!/^[A-Z]{4}\d{7}$/.test(cleanNum)) {
      errs.containerNumber = 'Format ISO 6346 tidak valid. Contoh: MSKU7421893 atau TCKU2049180';
    }

    // 2. Validasi Berat Kotor
    if (isNaN(grossWeight) || grossWeight <= 0) {
      errs.grossWeight = 'Berat kotor harus berupa angka positif';
    } else if (grossWeight < 2.0) {
      errs.grossWeight = 'Berat peti kemas minimal 2.0 ton (bobot tare kontainer kosong)';
    } else if (grossWeight > 35.0) {
      errs.grossWeight = 'Berat melebihi toleransi maksimal pelabuhan (35.0 Ton)';
    }

    // 3. Validasi Segel (Wajib untuk FCL/LCL)
    if (loadStatus !== 'Empty (MTY)' && !sealNumber.trim()) {
      errs.sealNumber = 'Nomor segel wajib diisi untuk peti kemas berisi muatan (FCL/LCL)';
    }

    // 4. Validasi Reefer Suhu
    if (isReefer && !temperature.trim()) {
      errs.temperature = 'Suhu set-point wajib dicantumkan untuk kontainer reefer (misal: -18°C)';
    }

    // 5. Validasi Kapal & Voyage jika status Loading atau Discharged
    if ((status === 'Loading ke Kapal' || status === 'Discharged') && !vesselName.trim()) {
      errs.vesselName = 'Nama kapal pengangkut wajib diisi untuk status operasional kapal';
    }

    // 6. Validasi Posisi Yard
    if (yardTier < 1 || yardTier > 5) {
      errs.yardTier = 'Tingkat tumpukan (Tier) maksimal 5 tingkat demi standar keselamatan';
    }

    // 7. Validasi Truk & Sopir
    if (!truckPlate.trim()) {
      errs.truckPlate = 'Nomor plat truk trailer pengangkut wajib dicatat';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        containerNumber: containerNumber.replace(/[\s-]/g, '').toUpperCase(),
        sizeType,
        status,
        loadStatus,
        yardBlock,
        yardBay,
        yardRow,
        yardTier: Number(yardTier),
        grossWeight: Number(grossWeight),
        maxPayload: Number(maxPayload),
        sealNumber: sealNumber.trim() || 'NONE',
        shippingLine,
        vesselName: vesselName.trim(),
        voyageNumber: voyageNumber.trim(),
        portOfLoading: portOfLoading.trim(),
        portOfDischarge: portOfDischarge.trim(),
        temperature: isReefer ? temperature.trim() : undefined,
        condition,
        driverName: driverName.trim(),
        truckPlate: truckPlate.trim().toUpperCase(),
        notes: notes.trim(),
        createdBy: currentOperatorEmail
      });
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview generated slot
  const currentSlotPreview = `${yardBlock}-${yardBay.padStart(2, '0')}-${yardRow.padStart(2, '0')}-${yardTier}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Container className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isEdit ? 'Perbarui Data Peti Kemas' : 'Penerimaan Peti Kemas Baru (Gate In)'}
              </h3>
              <p className="text-xs text-slate-500">
                Lengkapi atribut ISO 6346, manifes kargo, dan posisi tumpukan yard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Identitas Utama Kontainer (ISO 6346) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Identifikasi Standar ISO 6346 & Tipe
              </h4>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Slot: {currentSlotPreview}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* No Peti Kemas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Peti Kemas (Container No.) *
                </label>
                <div className="relative">
                  <input
                    id="input-container-number"
                    type="text"
                    required
                    maxLength={14}
                    value={containerNumber}
                    onChange={(e) => {
                      setContainerNumber(e.target.value.toUpperCase());
                      if (errors.containerNumber) {
                        setErrors({ ...errors, containerNumber: '' });
                      }
                    }}
                    placeholder="Contoh: MSKU7421893"
                    className={`w-full font-mono text-sm px-3 py-2 bg-white rounded-lg border uppercase tracking-wider ${
                      errors.containerNumber 
                        ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' 
                        : isoValidation.isValid
                        ? 'border-emerald-400 focus:ring-emerald-400 focus:border-emerald-400'
                        : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  <div className="absolute right-2.5 top-2.5">
                    {isoValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : containerNumber.length > 0 ? (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    ) : null}
                  </div>
                </div>
                {errors.containerNumber ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.containerNumber}</p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Format: 4 Huruf prefiks kode pemilik + 7 digit angka
                  </p>
                )}
              </div>

              {/* Tipe & Ukuran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe & Ukuran Peti Kemas *
                </label>
                <select
                  id="select-container-type"
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value as ContainerType)}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CONTAINER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Operasi & Status Muatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Operasional Saat Ini *
                </label>
                <select
                  id="select-container-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CONTAINER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Muatan (Load Status) *
                </label>
                <select
                  id="select-container-load"
                  value={loadStatus}
                  onChange={(e) => setLoadStatus(e.target.value as LoadStatus)}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  {LOAD_STATUSES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Posisi Yard Stacking & Bobot Timbangan */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Alokasi Lapangan Penumpukan (Yard Slot) & Beban
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Blok */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blok Lapangan</label>
                <select
                  id="select-yard-block"
                  value={yardBlock}
                  onChange={(e) => setYardBlock(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="A">Blok A (Ekspor)</option>
                  <option value="B">Blok B (Impor)</option>
                  <option value="C">Blok C (Reefer)</option>
                  <option value="D">Blok D (Empty / MTY)</option>
                </select>
              </div>

              {/* Bay */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bay (01-24)</label>
                <input
                  id="input-yard-bay"
                  type="text"
                  maxLength={2}
                  value={yardBay}
                  onChange={(e) => setYardBay(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-center"
                />
              </div>

              {/* Row */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Row (01-08)</label>
                <input
                  id="input-yard-row"
                  type="text"
                  maxLength={2}
                  value={yardRow}
                  onChange={(e) => setYardRow(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-center"
                />
              </div>

              {/* Tier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tier (Tingkat 1-5)</label>
                <select
                  id="select-yard-tier"
                  value={yardTier}
                  onChange={(e) => setYardTier(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono text-center font-bold"
                >
                  <option value={1}>Tier 1 (Dasar)</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                  <option value={4}>Tier 4</option>
                  <option value={5}>Tier 5 (Maks)</option>
                </select>
              </div>
            </div>

            {/* Berat Kotor & Segel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Berat Kotor / Gross Weight (Ton) *</span>
                  {isOverweight && (
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Beban Tinggi
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id="input-gross-weight"
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="35.0"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">Ton</span>
                </div>
                {errors.grossWeight && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.grossWeight}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Segel (Seal Number) {loadStatus !== 'Empty (MTY)' && '*'}
                </label>
                <input
                  id="input-seal-number"
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder={loadStatus === 'Empty (MTY)' ? 'Tidak ada segel (Empty)' : 'Contoh: ML-ID982110'}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono"
                />
                {errors.sealNumber && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.sealNumber}</p>
                )}
              </div>
            </div>

            {/* Khusus Reefer: Suhu Setting */}
            {isReefer && (
              <div className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-lg">
                <label className="block text-xs font-bold text-cyan-900 mb-1 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-600" />
                  Suhu Kontainer Reefer (Set-Point Temperature) *
                </label>
                <input
                  id="input-reefer-temp"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="Contoh: -18°C atau +4°C"
                  className="w-full text-sm px-3 py-1.5 bg-white rounded-md border border-cyan-300 font-mono"
                />
                {errors.temperature && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.temperature}</p>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Pengapalan & Manifes Logistik */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-blue-600" />
              Perusahaan Pelayaran & Informasi Kapal
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Shipping Line */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Line *</label>
                <select
                  id="select-shipping-line"
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300"
                >
                  {SHIPPING_LINES.map((sl) => (
                    <option key={sl} value={sl}>{sl}</option>
                  ))}
                </select>
              </div>

              {/* Vessel Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kapal (Vessel)</label>
                <input
                  id="input-vessel-name"
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="MV Ever Given"
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300"
                />
                {errors.vesselName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.vesselName}</p>
                )}
              </div>

              {/* Voyage Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Voyage No.</label>
                <input
                  id="input-voyage-number"
                  type="text"
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value)}
                  placeholder="V-2026W"
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pelabuhan Asal (POL)</label>
                <input
                  id="input-pol"
                  type="text"
                  value={portOfLoading}
                  onChange={(e) => setPortOfLoading(e.target.value)}
                  placeholder="Tanjung Priok, ID"
                  className="w-full text-sm px-2.5 py-1.5 bg-white rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pelabuhan Tujuan (POD)</label>
                <input
                  id="input-pod"
                  type="text"
                  value={portOfDischarge}
                  onChange={(e) => setPortOfDischarge(e.target.value)}
                  placeholder="Port of Rotterdam, NL"
                  className="w-full text-sm px-2.5 py-1.5 bg-white rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pengemudi, Truk Trailer & Kondisi Fisik */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Transportasi Darat & Kondisi Fisik
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Polisi Truk *</label>
                <input
                  id="input-truck-plate"
                  type="text"
                  required
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                  placeholder="B 9821 UEL"
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300 font-mono uppercase"
                />
                {errors.truckPlate && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.truckPlate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Supir Trailer</label>
                <input
                  id="input-driver-name"
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Nama Pengemudi"
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kondisi Fisik Peti Kemas</label>
                <select
                  id="select-condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ContainerCondition)}
                  className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Khusus Operasional</label>
              <textarea
                id="textarea-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan barang, instruksi stacking khusus, penanganan surveyor..."
                className="w-full text-sm px-3 py-2 bg-white rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            Batal
          </button>
          
          <button
            type="button"
            id="btn-save-container"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Menyimpan ke Firestore...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Peti Kemas (Gate In)'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
