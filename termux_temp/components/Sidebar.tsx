
import React from 'react';
import { AppSection } from '../types';
import { NAV_ITEMS } from '../constants';
import { Terminal as TerminalIcon, X } from 'lucide-react';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isOpen, onClose, theme }) => {
  const isNeon = theme === 'Neon Dark';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-zinc-800/50 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isNeon ? 'bg-emerald-500/20 neon-border-emerald' : 'bg-emerald-500/10'}`}>
              <TerminalIcon className="text-emerald-500" size={24} />
            </div>
            <h1 className={`text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent ${isNeon ? 'neon-emerald' : ''}`}>
              TERMUXHUB
            </h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id as AppSection);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeSection === item.id
                  ? (isNeon ? 'bg-emerald-500/20 text-emerald-400 neon-border-emerald border border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20')
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <span className={`transition-transform duration-300 group-hover:scale-110 ${activeSection === item.id ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-800/50">
          <div className={`rounded-2xl p-4 flex flex-col items-center text-center transition-all ${isNeon ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-zinc-900/50'}`}>
            <div className="w-10 h-10 rounded-full bg-zinc-800 mb-3 flex items-center justify-center relative">
              <div className={`w-3 h-3 rounded-full bg-emerald-500 animate-pulse ${isNeon ? 'neon-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''}`}></div>
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping"></div>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">Session Link Active</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
