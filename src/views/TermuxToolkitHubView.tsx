import React, { useState } from 'react';
import { 
  Terminal, 
  Package, 
  Activity, 
  ExternalLink, 
  Github, 
  Layers, 
  Cpu, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import { AIShell } from '../components/termux/AIShell';
import { ToolkitLibrary } from '../components/termux/ToolkitLibrary';
import { TermuxDashboard } from '../components/termux/TermuxDashboard';

type TermuxSubTab = 'terminal' | 'packages' | 'telemetry';

export const TermuxToolkitHubView: React.FC = () => {
  const [subTab, setSubTab] = useState<TermuxSubTab>('terminal');
  const [terminalInitialCmd, setTerminalInitialCmd] = useState<string | null>(null);

  const handleRunInTerminal = (cmd: string) => {
    setTerminalInitialCmd(cmd);
    setSubTab('terminal');
  };

  return (
    <div className="space-y-6">
      {/* View Header with Sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
            <Terminal size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Termux Toolkit Hub
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                Mobile Linux Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Émulateur bash interactif, client SSH simulé, boîte à outils de sécurité et scripts d'audit pour Android.
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'terminal' 
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            <span>Terminal & SSH</span>
          </button>

          <button
            onClick={() => setSubTab('packages')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'packages' 
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package size={14} />
            <span>Boîte à Outils</span>
          </button>

          <button
            onClick={() => setSubTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              subTab === 'telemetry' 
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} />
            <span>Télémétrie Système</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {subTab === 'terminal' && (
          <AIShell />
        )}

        {subTab === 'packages' && (
          <ToolkitLibrary />
        )}

        {subTab === 'telemetry' && (
          <TermuxDashboard onRunInTerminal={handleRunInTerminal} />
        )}
      </div>
    </div>
  );
};

export default TermuxToolkitHubView;
