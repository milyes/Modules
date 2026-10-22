import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  Shield, 
  Box, 
  Play, 
  Check, 
  Terminal, 
  Cpu, 
  HardDrive, 
  Radio, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TerminalOutput } from './TerminalOutput';
import { QUICK_COMMANDS, CATEGORY_ICONS } from './termuxConstants';

const mockTelemetry = [
  { time: '12:00', cpu: 14, ram: 42 },
  { time: '12:01', cpu: 26, ram: 44 },
  { time: '12:02', cpu: 19, ram: 43 },
  { time: '12:03', cpu: 58, ram: 49 },
  { time: '12:04', cpu: 31, ram: 46 },
  { time: '12:05', cpu: 44, ram: 48 },
  { time: '12:06', cpu: 27, ram: 45 },
];

interface TermuxDashboardProps {
  onRunInTerminal?: (cmd: string) => void;
}

export const TermuxDashboard: React.FC<TermuxDashboardProps> = ({ onRunInTerminal }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCommand = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                Termux Android Linux Core v2.4
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Centre de Contrôle Système & Scripts Instantanés
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Télémétrie en temps réel de l'environnement Termux, surveillance de la charge CPU/RAM et déclenchement rapide des scripts d'audit NetSecure Pro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Kernel: Linux aarch64</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Load */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase">Charge CPU</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">28.4%</p>
          <p className="text-[11px] text-slate-500 mt-1">Octa-Core ARM Cortex-A78</p>
        </div>

        {/* Memory */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase">Mémoire Allouée</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Cpu size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono">1.2 GB</p>
          <p className="text-[11px] text-slate-500 mt-1">sur 3.8 GB dispo sandbox</p>
        </div>

        {/* Active Jobs */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase">Processus Actifs</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Box size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-400 font-mono">14</p>
          <p className="text-[11px] text-slate-500 mt-1">daemons pty & threads réactifs</p>
        </div>

        {/* Security Status */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase">État de Sécurité</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">OPTIMAL</p>
          <p className="text-[11px] text-slate-500 mt-1">SELinux Enforcing • Sandbox OK</p>
        </div>
      </div>

      {/* Main Grid: Telemetry Graph & Instant Scripts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Graph */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Télémétrie en Direct (CPU & RAM)</h3>
              <p className="text-xs text-slate-400">Évolution de la charge lors de l'exécution des sondes réseau</p>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> CPU
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> RAM
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTelemetry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '10px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="ram" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Rafraîchissement automatique synchronisé avec le Mode Réel</span>
            <span className="font-mono text-cyan-400 text-[11px]">Sonde active : 2000 ms</span>
          </div>
        </div>

        {/* Quick Instant Scripts */}
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1">Scripts Instantanés</h3>
            <p className="text-xs text-slate-400 mb-4">Commandes prêtes à lancer dans l'émulateur</p>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {QUICK_COMMANDS.slice(0, 5).map((cmd) => (
                <div key={cmd.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-200 font-bold uppercase tracking-wider">
                      <span className="text-cyan-400">{CATEGORY_ICONS[cmd.category]}</span>
                      {cmd.name}
                    </span>
                    {onRunInTerminal && (
                      <button
                        onClick={() => onRunInTerminal(cmd.command)}
                        className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded-lg border border-cyan-500/30 transition-all"
                      >
                        <Play size={10} fill="currentColor" />
                        <span>Lancer</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{cmd.description}</p>
                  <TerminalOutput command={cmd.command} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermuxDashboard;
