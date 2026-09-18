import React from 'react';
import { 
  Container, 
  Plus, 
  LogOut, 
  Boxes, 
  History, 
  Grid3X3, 
  Layers, 
  Database,
  Ship,
  Sparkles
} from 'lucide-react';
import { OperatorUser } from '../types';

interface NavbarProps {
  currentUser: OperatorUser;
  activeTab: 'crud' | 'yard' | 'logs';
  setActiveTab: (tab: 'crud' | 'yard' | 'logs') => void;
  onOpenCreateModal: () => void;
  onLogout: () => void;
  totalContainers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onLogout,
  totalContainers
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Terminal Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Container className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  PORT-OPS
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Terminal Peti Kemas
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-700">Firestore LIVE:</span>
                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 rounded">ai-studio-ef3a2e62-aa44-41d3-b908-58f484fe46a7</span>
                <span>•</span>
                <span className="font-medium text-slate-700">{totalContainers} Peti Kemas Aktif</span>
              </div>
            </div>
          </div>

          {/* Navigasi Tab */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="tab-btn-crud"
              type="button"
              onClick={() => setActiveTab('crud')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'crud'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Kelola Peti Kemas</span>
            </button>

            <button
              id="tab-btn-yard"
              type="button"
              onClick={() => setActiveTab('yard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'yard'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Visual Denah Blok</span>
            </button>

            <button
              id="tab-btn-logs"
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Log Mutasi Audit</span>
            </button>
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            <button
              id="btn-open-create-container"
              type="button"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Penerimaan (Gate In)</span>
              <span className="sm:hidden">Tambah</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Operator Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{currentUser.name}</p>
                <p className="text-[11px] text-blue-600 font-medium">{currentUser.role}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="btn-logout"
              type="button"
              onClick={onLogout}
              title="Keluar dari sesi operasional"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Tab Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('crud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg ${
              activeTab === 'crud' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Peti Kemas</span>
          </button>
          <button
            onClick={() => setActiveTab('yard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg ${
              activeTab === 'yard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Denah Yard</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg ${
              activeTab === 'logs' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
