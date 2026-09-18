import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ContainerItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  container: ContainerItem | null;
  onClose: () => void;
  onConfirmDelete: (id: string, containerNumber: string, reason: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  container,
  onClose,
  onConfirmDelete
}) => {
  const [reason, setReason] = useState('Pelepasan / Selesai Gate Out Terminal');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !container) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(container.id, container.containerNumber, reason);
      onClose();
    } catch (err) {
      console.error('Gagal menghapus kontainer:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Data Peti Kemas?
              </h3>
              <p className="text-xs text-slate-500">
                Aksi ini akan menghapus data kontainer dari database Firestore secara permanen.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Peti Kemas:</span>
              <span className="font-mono font-bold text-slate-900">{container.containerNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipe / Ukuran:</span>
              <span className="font-medium text-slate-800">{container.sizeType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Posisi Slot:</span>
              <span className="font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                {container.yardSlot}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelayaran:</span>
              <span className="text-slate-800">{container.shippingLine}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alasan Penghapusan / Pembatalan *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-300 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="Pelepasan / Selesai Gate Out Terminal">Pelepasan / Selesai Gate Out Terminal</option>
              <option value="Koreksi Input Duplikat / Salah Catat">Koreksi Input Duplikat / Salah Catat</option>
              <option value="Dibatalkan oleh Agen Pelayaran (Cancel Booking)">Dibatalkan oleh Agen Pelayaran (Cancel Booking)</option>
              <option value="Kontainer Rusak Berat Dialihkan ke Depo Reparatir">Kontainer Rusak Berat Dialihkan ke Depo Reparatir</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-confirm-delete"
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Data</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
