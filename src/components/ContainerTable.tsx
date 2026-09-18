import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Layers, 
  Truck, 
  Ship, 
  Thermometer, 
  Scale, 
  ArrowUpDown, 
  Boxes, 
  Anchor, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ContainerItem, ContainerStatus, LoadStatus } from '../types';

interface ContainerTableProps {
  containers: ContainerItem[];
  isLoading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (container: ContainerItem) => void;
  onOpenDelete: (container: ContainerItem) => void;
  onOpenEir: (container: ContainerItem) => void;
  onQuickStatusUpdate: (container: ContainerItem, newStatus: ContainerStatus) => void;
}

export const ContainerTable: React.FC<ContainerTableProps> = ({
  containers,
  isLoading,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onOpenEir,
  onQuickStatusUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [filterLoad, setFilterLoad] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'weight' | 'number'>('updated');

  // Metrik Statistik
  const totalCount = containers.length;
  const loadingCount = containers.filter((c) => c.status === 'Loading ke Kapal').length;
  const customsCount = containers.filter((c) => c.status === 'Customs / Pemeriksaan').length;
  const reeferCount = containers.filter((c) => c.sizeType.includes('Reefer')).length;
  const fclCount = containers.filter((c) => c.loadStatus === 'FCL').length;

  // Filter & Search Logic
  const filtered = containers.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      item.containerNumber.toLowerCase().includes(s) ||
      item.shippingLine.toLowerCase().includes(s) ||
      item.sealNumber.toLowerCase().includes(s) ||
      item.vesselName.toLowerCase().includes(s) ||
      (item.truckPlate && item.truckPlate.toLowerCase().includes(s)) ||
      item.yardSlot.toLowerCase().includes(s);

    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesBlock = filterBlock === 'ALL' || item.yardBlock === filterBlock;
    const matchesLoad = filterLoad === 'ALL' || item.loadStatus === filterLoad;

    return matchesSearch && matchesStatus && matchesBlock && matchesLoad;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (sortBy === 'weight') return b.grossWeight - a.grossWeight;
    if (sortBy === 'number') return a.containerNumber.localeCompare(b.containerNumber);
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  const getStatusBadge = (status: ContainerStatus) => {
    switch (status) {
      case 'Gate In':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Yard Stacking':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Customs / Pemeriksaan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Loading ke Kapal':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Discharged':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Gate Out':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peti Kemas di Yard</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount} Unit</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {fclCount} FCL Aktif
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Siap Muat Kapal</p>
            <h3 className="text-2xl font-black text-indigo-900 mt-1">{loadingCount} Unit</h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
              <span>Quay Crane Standby</span>
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Ship className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bea Cukai / Inspeksi</p>
            <h3 className="text-2xl font-black text-amber-900 mt-1">{customsCount} Unit</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
              <span>Pemeriksaan Segel & Fisik</span>
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reefer (Pendingin)</p>
            <h3 className="text-2xl font-black text-cyan-900 mt-1">{reeferCount} Unit</h3>
            <p className="text-[11px] text-cyan-600 font-medium mt-0.5 flex items-center gap-1">
              <span>Monitoring Suhu Lapangan</span>
            </p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <Thermometer className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Operational Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Top Controls & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Manajemen Data Operasional Peti Kemas
              </h2>
              <p className="text-xs text-slate-500">
                Tersambung langsung ke database Cloud Firestore (Single Source of Truth)
              </p>
            </div>

            <button
              id="btn-table-add-container"
              onClick={onOpenCreate}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-all focus:ring-2 focus:ring-blue-500 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Penerimaan (Gate In)</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="input-search-containers"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari No. Kontainer, Segel, Pelayaran, Kapal, Plat Truk..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="ALL">Semua Status</option>
                <option value="Gate In">Gate In</option>
                <option value="Yard Stacking">Yard Stacking</option>
                <option value="Customs / Pemeriksaan">Customs / Bea Cukai</option>
                <option value="Loading ke Kapal">Loading ke Kapal</option>
                <option value="Discharged">Discharged</option>
                <option value="Gate Out">Gate Out</option>
              </select>
            </div>

            {/* Block Filter */}
            <div className="sm:col-span-2">
              <select
                id="filter-block"
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="ALL">Semua Blok</option>
                <option value="A">Blok A (Ekspor)</option>
                <option value="B">Blok B (Impor)</option>
                <option value="C">Blok C (Reefer)</option>
                <option value="D">Blok D (Empty)</option>
              </select>
            </div>

            {/* Load Status Filter */}
            <div className="sm:col-span-2">
              <select
                id="filter-load"
                value={filterLoad}
                onChange={(e) => setFilterLoad(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="ALL">Semua Muatan</option>
                <option value="FCL">FCL (Penuh)</option>
                <option value="LCL">LCL (Parsial)</option>
                <option value="Empty (MTY)">Empty (Kosong)</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="sm:col-span-1">
              <select
                id="sort-selector"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                title="Urutkan Data"
              >
                <option value="updated">Terbaru</option>
                <option value="weight">Terberat</option>
                <option value="number">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Peti Kemas & Tipe</th>
                <th className="py-3 px-4">Posisi Yard Slot</th>
                <th className="py-3 px-4">Status Operasi</th>
                <th className="py-3 px-4">Muatan & Berat</th>
                <th className="py-3 px-4">Shipping Line & Kapal</th>
                <th className="py-3 px-4">Segel & Truk</th>
                <th className="py-3 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data peti kemas dari Cloud Firestore...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data peti kemas yang ditemukan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Coba sesuaikan filter pencarian atau tambahkan kontainer baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isOverweight = item.grossWeight > 30.5;
                  const isReefer = item.sizeType.includes('Reefer');

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      {/* Peti Kemas & Tipe */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          <div>
                            <span className="font-mono font-black text-blue-700 text-xs tracking-wider block">
                              {item.containerNumber}
                            </span>
                            <span className="text-[11px] text-slate-600 font-medium block">
                              {item.sizeType}
                            </span>
                            {isReefer && item.temperature && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 mt-0.5 font-bold">
                                <Thermometer className="w-2.5 h-2.5" />
                                {item.temperature}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Posisi Yard Slot */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-slate-800 text-xs">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.yardSlot}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Blok {item.yardBlock} • T{item.yardTier}
                        </p>
                      </td>

                      {/* Status Operasi */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                        
                        {/* Quick Status Dropdown */}
                        <div className="mt-1">
                          <select
                            value={item.status}
                            onChange={(e) => onQuickStatusUpdate(item, e.target.value as ContainerStatus)}
                            className="text-[10px] py-0.5 px-1 bg-transparent hover:bg-slate-100 text-slate-500 rounded border border-dashed border-slate-300 focus:outline-none"
                            title="Ubah status operasional cepat"
                          >
                            <option value="Gate In">Ubah: Gate In</option>
                            <option value="Yard Stacking">Ubah: Yard Stacking</option>
                            <option value="Customs / Pemeriksaan">Ubah: Customs</option>
                            <option value="Loading ke Kapal">Ubah: Loading Kapal</option>
                            <option value="Discharged">Ubah: Discharged</option>
                            <option value="Gate Out">Ubah: Gate Out</option>
                          </select>
                        </div>
                      </td>

                      {/* Muatan & Berat */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.loadStatus === 'FCL' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : item.loadStatus === 'LCL'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.loadStatus}
                          </span>
                          <span className={`font-mono font-bold text-xs ${isOverweight ? 'text-rose-600' : 'text-slate-800'}`}>
                            {item.grossWeight} Ton
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Kondisi: <span className="font-medium text-slate-700">{item.condition}</span>
                        </p>
                      </td>

                      {/* Shipping Line & Kapal */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{item.shippingLine}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Anchor className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{item.vesselName || 'Dermaga Domestik'}</span>
                        </p>
                      </td>

                      {/* Segel & Truk */}
                      <td className="py-3 px-4">
                        <p className="font-mono text-[11px] text-slate-700">
                          Segel: <strong className="text-slate-900">{item.sealNumber || '-'}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono uppercase mt-0.5">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>{item.truckPlate || 'B 9000 TY'}</span>
                        </p>
                      </td>

                      {/* Aksi Manajemen */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Cetak EIR */}
                          <button
                            id={`btn-eir-${item.id}`}
                            type="button"
                            onClick={() => onOpenEir(item)}
                            title="Cetak Surat Jalan EIR"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            id={`btn-edit-${item.id}`}
                            type="button"
                            onClick={() => onOpenEdit(item)}
                            title="Edit data kontainer"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`btn-delete-${item.id}`}
                            type="button"
                            onClick={() => onOpenDelete(item)}
                            title="Hapus data kontainer"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filtered.length} dari total {totalCount} peti kemas</span>
          <span className="font-mono">Real-time Snapshot Sync Active</span>
        </div>
      </div>
    </div>
  );
};
