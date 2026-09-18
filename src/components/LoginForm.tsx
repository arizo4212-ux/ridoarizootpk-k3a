import React, { useState } from 'react';
import { 
  Ship, 
  Container, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  ArrowRight, 
  Anchor, 
  Compass,
  HardHat,
  Boxes,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { DEMO_OPERATORS, loginWithDemo, loginCustomUser } from '../services/authService';
import { OperatorUser } from '../types';

interface LoginFormProps {
  onLoginSuccess: (user: OperatorUser) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, msg: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, showToast }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Operator Lapangan');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemoLoading, setActiveDemoLoading] = useState<string | null>(null);

  // Handler Login Cepat Demo (1 Klik)
  const handleQuickDemoLogin = async (demoId: string) => {
    try {
      setActiveDemoLoading(demoId);
      const user = await loginWithDemo(demoId);
      showToast('success', 'Login Berhasil', `Selamat datang, ${user.name} (${user.role})`);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Error saat login demo:', err);
      showToast('error', 'Gagal Masuk', 'Terjadi kendala saat menghubungkan ke Firebase');
    } finally {
      setActiveDemoLoading(null);
    }
  };

  // Handler Login Manual Bebas (Bisa Login Semua)
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('warning', 'Data Belum Lengkap', 'Silakan masukkan nama pengguna atau email operator');
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginCustomUser(identifier, password, selectedRole as any);
      showToast('success', 'Otentikasi Berhasil', `Selamat datang di sistem terminal, ${user.name} (${user.role})`);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Error saat custom login:', err);
      showToast('error', 'Gagal Masuk', 'Gagal memproses sesi otentikasi Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Decorative Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full blur-3xl pointer-events-none opacity-60" />

      <div className="relative max-w-4xl mx-auto w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 mb-4 ring-4 ring-blue-50">
            <Container className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sistem Operasional Peti Kemas
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-xl mx-auto">
            Terminal Peti Kemas Internasional — Manajemen Yard Stacking, Gerbang (Gate In/Out), dan Pelacakan Kontainer Terintegrasi Cloud Firestore.
          </p>
          
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Cloud Firestore Terhubung (Fiks Online & Persisten)</span>
            <span className="font-mono text-[11px] bg-emerald-100/70 text-emerald-900 px-1.5 py-0.5 rounded">ID: ai-studio-ef3a2e62-aa44-41d3-b908-58f484fe46a7</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Bagian Kiri: Quick Demo Login Cards */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Quick Login Demo (1-Klik)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih profil tugas untuk langsung masuk ke dashboard operasional:
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                Akses Langsung
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DEMO_OPERATORS.map((demo) => {
                let roleIcon = <HardHat className="w-5 h-5 text-amber-600" />;
                if (demo.role === 'Yard Master') roleIcon = <Boxes className="w-5 h-5 text-blue-600" />;
                if (demo.role === 'Surveyor / Tally') roleIcon = <FileCheck2 className="w-5 h-5 text-emerald-600" />;
                if (demo.role === 'Shipping Agent') roleIcon = <Ship className="w-5 h-5 text-indigo-600" />;

                const isCurrentLoading = activeDemoLoading === demo.id;

                return (
                  <button
                    key={demo.id}
                    id={`btn-demo-login-${demo.id}`}
                    type="button"
                    onClick={() => handleQuickDemoLogin(demo.id)}
                    disabled={activeDemoLoading !== null || isLoading}
                    className="flex flex-col text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-md transition-all duration-200 group relative focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white border border-slate-100 transition-colors">
                        {roleIcon}
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {demo.badgeNumber}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {demo.name}
                    </h3>
                    <p className="text-xs font-medium text-blue-600 mt-0.5">
                      {demo.role}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                      {demo.desc}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-600 font-medium">
                      <span>{isCurrentLoading ? 'Menghubungkan...' : 'Klik untuk Masuk'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform ${isCurrentLoading ? 'animate-pulse' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Catatan Fitur */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Bebas Hambatan:</strong> Sistem telah diatur agar <em>semua akun dapat langsung login</em> tanpa pembatasan, langsung terhubung ke Cloud Firestore.
              </span>
            </div>
          </div>

          {/* Bagian Kanan: Form Login Manual (Bisa Login Semua) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
            <div className="pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                Masuk Operator Bebas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketik nama atau ID petugas Anda (semua bisa login):
              </p>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama / Email / ID Petugas
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: Rian Pratama atau op.rian@port.id"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Peran / Tugas Operasional
                </label>
                <select
                  id="select-login-role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium text-slate-700"
                >
                  <option value="Yard Master">Yard Master (Kepala Operasional Lapangan)</option>
                  <option value="Crane Operator">Crane Operator (RTG & Quay Crane)</option>
                  <option value="Surveyor / Tally">Surveyor / Tally (Inspeksi & Bea Cukai)</option>
                  <option value="Shipping Agent">Shipping Agent (Perwakilan Pelayaran)</option>
                  <option value="Operator Umum">Operator Umum (Gate In / Gate Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi / PIN Operasional
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Bisa diisi sandi apa saja"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * Bebas diisi sandi apa saja, sistem mengizinkan semua akses.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-manual-login"
                  type="submit"
                  disabled={isLoading || activeDemoLoading !== null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem Terminal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Pelabuhan Tanjung Priok / Tanjung Perak Standard Ops</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
