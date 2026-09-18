import React, { useState, useEffect } from 'react';
import { 
  ContainerItem, 
  ActivityLog, 
  OperatorUser, 
  ToastMessage, 
  ContainerStatus 
} from './types';
import { 
  subscribeToContainers, 
  subscribeToLogs, 
  createContainer, 
  updateContainer, 
  deleteContainer 
} from './services/containerService';
import { 
  subscribeToAuth, 
  logoutOperator 
} from './services/authService';

import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { ContainerTable } from './components/ContainerTable';
import { ContainerModal } from './components/ContainerModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EirModal } from './components/EirModal';
import { YardMapVisualizer } from './components/YardMapVisualizer';
import { LogsView } from './components/LogsView';
import { Toast } from './components/Toast';

export default function App() {
  // State Otentikasi Petugas Terminal (Firebase Auth & Firestore sebagai Sumber Tunggal Kebenaran)
  // TIDAK menggunakan localStorage sama sekali!
  const [currentUser, setCurrentUser] = useState<OperatorUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Data Operasional Peti Kemas & Log dari Firestore
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Tab Tampilan
  const [activeTab, setActiveTab] = useState<'crud' | 'yard' | 'logs'>('crud');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingContainer, setEditingContainer] = useState<ContainerItem | null>(null);
  const [deletingContainer, setDeletingContainer] = useState<ContainerItem | null>(null);
  const [eirContainer, setEirContainer] = useState<ContainerItem | null>(null);

  // Toasts Notification
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Subscribe ke Status Otentikasi Firebase (Real-time)
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth(
      (user) => {
        setCurrentUser(user);
        setIsAuthChecking(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setIsAuthChecking(false);
      }
    );

    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe ke Koleksi Containers & Activity Logs Firestore saat User Login
  useEffect(() => {
    if (!currentUser) {
      setContainers([]);
      setLogs([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);

    // Listener Real-time Containers
    const unsubscribeContainers = subscribeToContainers(
      (items) => {
        setContainers(items);
        setIsDataLoading(false);
      },
      (error) => {
        console.error('Container error:', error);
        showToast('error', 'Koneksi Database', 'Gagal memuat data peti kemas secara real-time dari Firestore');
        setIsDataLoading(false);
      }
    );

    // Listener Real-time Activity Logs
    const unsubscribeLogs = subscribeToLogs(
      (auditLogs) => {
        setLogs(auditLogs);
      },
      (error) => {
        console.error('Logs error:', error);
      }
    );

    return () => {
      unsubscribeContainers();
      unsubscribeLogs();
    };
  }, [currentUser]);

  // Handler CRUD: Create Peti Kemas Baru
  const handleCreateSubmit = async (
    data: Omit<ContainerItem, 'id' | 'createdAt' | 'updatedAt' | 'yardSlot'>
  ) => {
    const operatorName = currentUser?.name || 'Petugas Terminal';
    try {
      await createContainer(data, operatorName);
      showToast(
        'success',
        'Peti Kemas Terdaftar (Gate In)',
        `Kontainer ${data.containerNumber} berhasil disimpan ke Firestore di slot Blok ${data.yardBlock}`
      );
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Error create container:', err);
      showToast('error', 'Gagal Menyimpan', err.message || 'Terjadi masalah saat menulis data ke Firestore');
      throw err;
    }
  };

  // Handler CRUD: Update Data Peti Kemas
  const handleEditSubmit = async (
    data: Omit<ContainerItem, 'id' | 'createdAt' | 'updatedAt' | 'yardSlot'>
  ) => {
    if (!editingContainer) return;
    const operatorName = currentUser?.name || 'Petugas Terminal';
    try {
      await updateContainer(editingContainer.id, data, operatorName);
      showToast(
        'success',
        'Data Diperbarui',
        `Perubahan data kontainer ${data.containerNumber} berhasil disimpan ke Firestore`
      );
      setEditingContainer(null);
    } catch (err: any) {
      console.error('Error update container:', err);
      showToast('error', 'Gagal Memperbarui', err.message || 'Terjadi kendala saat update di Firestore');
      throw err;
    }
  };

  // Handler CRUD: Delete Data Peti Kemas
  const handleDeleteConfirm = async (
    id: string,
    containerNumber: string,
    reason: string
  ) => {
    if (!currentUser) return;
    try {
      await deleteContainer(id, containerNumber, currentUser.name, reason);
      showToast(
        'warning',
        'Peti Kemas Dihapus',
        `Kontainer ${containerNumber} telah dihapus dari database aktif terminal`
      );
      setDeletingContainer(null);
    } catch (err: any) {
      console.error('Error delete container:', err);
      showToast('error', 'Gagal Menghapus', err.message || 'Gagal menghapus data dari Firestore');
      throw err;
    }
  };

  // Handler Quick Status Update (Dropdown status tabel)
  const handleQuickStatusUpdate = async (
    item: ContainerItem,
    newStatus: ContainerStatus
  ) => {
    if (!currentUser || item.status === newStatus) return;
    try {
      await updateContainer(item.id, { status: newStatus }, currentUser.name);
      showToast(
        'info',
        'Status Berubah',
        `Kontainer ${item.containerNumber} kini berstatus: ${newStatus}`
      );
    } catch (err: any) {
      showToast('error', 'Gagal Ubah Status', err.message || 'Terjadi kesalahan sistem');
    }
  };

  // Handler Logout
  const handleLogout = async () => {
    await logoutOperator();
    setCurrentUser(null);
    showToast('info', 'Sesi Berakhir', 'Anda telah keluar dari sistem operasional terminal');
  };

  // Handler Simulasi Cetak Dokumen EIR
  const handlePrintSimulation = () => {
    showToast('success', 'Mencetak Dokumen', 'Perintah cetak surat jalan EIR berhasil dikirim ke printer gate');
  };

  // Tampilan Loading Awal Sesi Auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">
            Menghubungkan ke Sistem Operasional Peti Kemas...
          </p>
        </div>
      </div>
    );
  }

  // JIKA BELUM LOGIN: TAMPILKAN FORM LOGIN SEBAGAI TAMPILAN DEFAULT
  // Sesuai Spesifikasi 3: "Harus ada form login sebagai tampilan default (bisa login semua) ingat bisa login semua"
  if (!currentUser) {
    return (
      <>
        <LoginForm 
          onLoginSuccess={(user) => setCurrentUser(user)} 
          showToast={showToast} 
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // TAMPILAN DASHBOARD UTAMA SETELAH LOGIN
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      
      {/* Navbar & Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onLogout={handleLogout}
        totalContainers={containers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: CRUD Peti Kemas */}
        {activeTab === 'crud' && (
          <ContainerTable
            containers={containers}
            isLoading={isDataLoading}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onOpenEdit={(container) => setEditingContainer(container)}
            onOpenDelete={(container) => setDeletingContainer(container)}
            onOpenEir={(container) => setEirContainer(container)}
            onQuickStatusUpdate={handleQuickStatusUpdate}
          />
        )}

        {/* Tab 2: Denah Visual Yard Slot 2D */}
        {activeTab === 'yard' && (
          <YardMapVisualizer
            containers={containers}
            onSelectContainer={(container) => setEditingContainer(container)}
          />
        )}

        {/* Tab 3: Log Mutasi Audit */}
        {activeTab === 'logs' && (
          <LogsView logs={logs} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 PORT-OPS Terminal Peti Kemas Internasional — Terintegrasi Cloud Firestore
          </span>
          <span className="text-[11px] text-slate-400">
            Tipografi Inter Global • Mode Terang Cerah • ISO 6346 Standard Compliant
          </span>
        </div>
      </footer>

      {/* MODAL 1: Create Peti Kemas Baru */}
      <ContainerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        currentOperatorEmail={currentUser.email}
      />

      {/* MODAL 2: Edit Peti Kemas */}
      <ContainerModal
        isOpen={!!editingContainer}
        onClose={() => setEditingContainer(null)}
        onSubmit={handleEditSubmit}
        initialData={editingContainer}
        currentOperatorEmail={currentUser.email}
      />

      {/* MODAL 3: Konfirmasi Hapus Data Peti Kemas */}
      <DeleteConfirmModal
        isOpen={!!deletingContainer}
        container={deletingContainer}
        onClose={() => setDeletingContainer(null)}
        onConfirmDelete={handleDeleteConfirm}
      />

      {/* MODAL 4: Cetak Dokumen EIR / Surat Jalan */}
      <EirModal
        isOpen={!!eirContainer}
        container={eirContainer}
        onClose={() => setEirContainer(null)}
        onPrintSimulation={handlePrintSimulation}
      />

      {/* Toast Notifications Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
