import React, { useState } from 'react';
import { History, Search, ShieldCheck, Clock, User, Filter, ArrowRight } from 'lucide-react';
import { ActivityLog } from '../types';

interface LogsViewProps {
  logs: ActivityLog[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Log Audit & Riwayat Mutasi Operasional
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tersinkronisasi Firestore
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap aksi penerimaan (gate-in), perubahan status tumpukan, relokasi yard, dan penghapusan data.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor kontainer, operator, atau rincian..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">Penerimaan Baru (CREATE)</option>
            <option value="UPDATE">Pembaruan Data (UPDATE)</option>
            <option value="DELETE">Penghapusan (DELETE)</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada riwayat aktivitas yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
            if (log.action === 'CREATE') badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (log.action === 'DELETE') badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
            if (log.action === 'UPDATE') badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';

            const timeFormatted = new Date(log.timestamp).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded-lg border font-mono font-bold text-[10px] uppercase shrink-0 ${badgeBg}`}>
                    {log.action}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.title}</span>
                      <span className="font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {log.containerNumber}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-slate-400 shrink-0">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600">{log.operator}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{timeFormatted}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
