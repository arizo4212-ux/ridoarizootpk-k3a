import React, { useState } from 'react';
import { Layers, Box, Info, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { ContainerItem } from '../types';

interface YardMapVisualizerProps {
  containers: ContainerItem[];
  onSelectContainer: (container: ContainerItem) => void;
}

export const YardMapVisualizer: React.FC<YardMapVisualizerProps> = ({
  containers,
  onSelectContainer
}) => {
  const [activeBlock, setActiveBlock] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Filter containers in current block
  const blockContainers = containers.filter((c) => c.yardBlock === activeBlock);

  // Map to slot key: Bay-Row-Tier
  const slotMap = new Map<string, ContainerItem>();
  blockContainers.forEach((c) => {
    const key = `${c.yardBay}-${c.yardRow}-${c.yardTier}`;
    slotMap.set(key, c);
  });

  const BAYS = ['01', '02', '04', '06', '08', '10'];
  const TIERS = [4, 3, 2, 1]; // Stacked from top (4) to bottom (1)
  const ROWS = ['01', '02', '03'];

  // Deskripsi Blok
  const blockDescriptions: Record<'A' | 'B' | 'C' | 'D', { name: string; tag: string; color: string }> = {
    A: { name: 'Blok A — Jalur Utama Ekspor', tag: 'Outbound / Stacking Ekspor', color: 'bg-blue-500' },
    B: { name: 'Blok B — Jalur Impor & Karantina', tag: 'Inbound / Discharged', color: 'bg-emerald-500' },
    C: { name: 'Blok C — Area Reefer Pendingin', tag: 'Plug-in Power Active', color: 'bg-cyan-500' },
    D: { name: 'Blok D — Depo Peti Kemas Kosong', tag: 'Empty (MTY) Allocation', color: 'bg-amber-500' }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Visualisasi Denah Slot Lapangan (Yard Layout)
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Real-time 2D Grid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring posisi penumpukan tumpukan peti kemas (Tier, Bay, Row) pada blok terminal.
          </p>
        </div>

        {/* Block Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          {(['A', 'B', 'C', 'D'] as const).map((blk) => {
            const isSelected = activeBlock === blk;
            const count = containers.filter((c) => c.yardBlock === blk).length;
            return (
              <button
                key={blk}
                onClick={() => setActiveBlock(blk)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Blok {blk}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Block Information Banner */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${blockDescriptions[activeBlock].color}`} />
          <div>
            <span className="font-bold text-slate-900">{blockDescriptions[activeBlock].name}</span>
            <span className="text-slate-500 ml-2">({blockDescriptions[activeBlock].tag})</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-600 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600" />
            <span>Terisi (FCL/LCL)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span>Empty (MTY)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-dashed border-slate-300 bg-white" />
            <span>Slot Kosong</span>
          </div>
        </div>
      </div>

      {/* 2D Stack Grid View: Bays x Tiers */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px] space-y-4">
          <div className="grid grid-cols-6 gap-3 text-center">
            {BAYS.map((bay) => (
              <div key={bay} className="font-mono font-bold text-xs text-slate-600 pb-1 border-b-2 border-slate-300">
                BAY {bay}
              </div>
            ))}
          </div>

          {/* Render Tiers from 4 down to 1 */}
          <div className="space-y-3">
            {TIERS.map((tier) => (
              <div key={tier} className="flex items-center gap-2">
                <span className="w-16 font-mono text-[11px] font-bold text-slate-400 shrink-0 text-right pr-2">
                  TIER {tier}
                </span>
                <div className="grid grid-cols-6 gap-3 flex-1">
                  {BAYS.map((bay) => {
                    // Cek apakah ada kontainer di bay & tier ini (mencakup row manapun)
                    const found = blockContainers.find(
                      (c) => c.yardBay === bay && c.yardTier === tier
                    );

                    if (found) {
                      const isEmptyType = found.loadStatus === 'Empty (MTY)';
                      return (
                        <button
                          key={bay}
                          onClick={() => onSelectContainer(found)}
                          className={`p-2.5 rounded-xl text-left border shadow-xs transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none ${
                            isEmptyType
                              ? 'bg-amber-50 border-amber-300 text-amber-950'
                              : 'bg-blue-50 border-blue-300 text-blue-950'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs truncate">
                              {found.containerNumber}
                            </span>
                            <span className="text-[10px] px-1 py-0.2 rounded font-mono bg-white/80 border border-slate-200">
                              R{found.yardRow}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 truncate mt-0.5">
                            {found.shippingLine}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] font-medium">
                            <span>{found.grossWeight}T</span>
                            <span className="text-blue-700 font-semibold">{found.status}</span>
                          </div>
                        </button>
                      );
                    }

                    // Slot Kosong Tersedia
                    return (
                      <div
                        key={bay}
                        className="h-16 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-300 text-[10px] font-mono hover:bg-slate-100/60 hover:border-slate-300 transition-colors"
                      >
                        <span>AVAILABLE</span>
                        <span className="text-[9px] text-slate-400">
                          {activeBlock}-{bay}-T{tier}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center text-xs text-slate-400 font-medium">
            ▲ Crane Loading Ramp / Quay Direction
          </div>
        </div>
      </div>
    </div>
  );
};
