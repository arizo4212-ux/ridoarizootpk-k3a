import React from 'react';
import { Printer, X, Download, ShieldCheck, QrCode, FileText, CheckCircle2 } from 'lucide-react';
import { ContainerItem } from '../types';

interface EirModalProps {
  isOpen: boolean;
  container: ContainerItem | null;
  onClose: () => void;
  onPrintSimulation: () => void;
}

export const EirModal: React.FC<EirModalProps> = ({
  isOpen,
  container,
  onClose,
  onPrintSimulation
}) => {
  if (!isOpen || !container) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              Surat Jalan & EIR (Equipment Interchange Receipt)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div id="eir-print-area" className="p-6 text-slate-800 space-y-5 bg-white">
          
          {/* Header Pelabuhan */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                PORT-OPS TERMINAL PETI KEMAS INTERNASIONAL
              </h2>
              <p className="text-xs text-slate-600">
                Jl. Dermaga Samudera Raya Kav. 08, Pelabuhan Tanjung Priok, Jakarta Utara
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                No. Registrasi EIR: EIR-{container.id.substring(0, 8).toUpperCase()}-2026
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                DOKUMEN RESMI
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Tgl: {new Date(container.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Container Hero Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">No. Peti Kemas (ISO)</span>
              <span className="text-base font-black font-mono text-blue-700">{container.containerNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Ukuran / Tipe</span>
              <span className="font-semibold text-slate-900">{container.sizeType}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Muatan</span>
              <span className="font-bold text-emerald-700">{container.loadStatus}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Posisi Yard Slot</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                {container.yardSlot}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 font-bold p-2.5 text-slate-700">
              <div>INFORMASI EKSPEDISI & KAPAL</div>
              <div>INFORMASI ANGKUTAN & SUPIR</div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200 p-3 space-y-1 sm:space-y-0">
              <div className="space-y-1.5 pr-3">
                <p><span className="text-slate-500">Shipping Line:</span> <strong className="text-slate-900">{container.shippingLine}</strong></p>
                <p><span className="text-slate-500">Kapal / Voyage:</span> {container.vesselName || '-'} / {container.voyageNumber || '-'}</p>
                <p><span className="text-slate-500">No. Segel (Seal):</span> <span className="font-mono font-bold text-slate-800">{container.sealNumber}</span></p>
                <p><span className="text-slate-500">Rute (POL/POD):</span> {container.portOfLoading} → {container.portOfDischarge}</p>
                {container.temperature && (
                  <p className="text-cyan-700 font-semibold">Suhu Reefer: {container.temperature}</p>
                )}
              </div>

              <div className="space-y-1.5 pl-3">
                <p><span className="text-slate-500">No. Polisi Truk:</span> <strong className="font-mono text-slate-900">{container.truckPlate || 'B 9821 UEL'}</strong></p>
                <p><span className="text-slate-500">Nama Pengemudi:</span> {container.driverName || 'Supir Terdaftar'}</p>
                <p><span className="text-slate-500">Berat Kotor (Gross):</span> <strong className="text-slate-900">{container.grossWeight} Ton</strong></p>
                <p><span className="text-slate-500">Kondisi Fisik:</span> <span className="text-emerald-700 font-semibold">{container.condition}</span></p>
                <p><span className="text-slate-500">Operator Gate:</span> {container.createdBy}</p>
              </div>
            </div>
          </div>

          {/* Barcode Visual Simulation & Security Stamp */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="space-y-1">
              <div className="font-mono text-xs text-slate-400 tracking-widest uppercase">
                ||||| | |||| || |||||| | ||||| ||| ||||||| |||
              </div>
              <p className="font-mono text-[10px] text-slate-500">
                *{container.containerNumber}-{container.yardSlot}*
              </p>
            </div>

            <div className="flex items-center gap-6 text-center text-xs text-slate-500">
              <div>
                <p className="mb-8 text-[11px] font-medium">Tanda Tangan Supir Trailer</p>
                <div className="w-28 border-b border-slate-400 mx-auto" />
                <p className="text-[10px] mt-1">({container.driverName || 'Pengemudi'})</p>
              </div>
              <div>
                <p className="mb-8 text-[11px] font-medium">Petugas Tally Gate In/Out</p>
                <div className="w-28 border-b border-slate-400 mx-auto" />
                <p className="text-[10px] mt-1">(Tally Clerk Terminal)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">
            Terverifikasi oleh sistem otentikasi terminal
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl"
            >
              Tutup
            </button>
            <button
              id="btn-print-eir-action"
              onClick={onPrintSimulation}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen EIR</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
