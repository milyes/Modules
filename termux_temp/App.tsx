
import React, { useState, useEffect } from 'react';
import { AppSection } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIShell from './components/AIShell';
import ToolkitLibrary from './components/ToolkitLibrary';
import { Settings as SettingsIcon, AlertCircle, Menu, Github } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('Neon Dark');

  // Inject theme class to root for CSS utility usage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'Neon Dark') {
      root.classList.add('theme-neon');
    } else {
      root.classList.remove('theme-neon');
    }
  }, [theme]);

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD:
        return <Dashboard />;
      case AppSection.SHELL_ASSISTANT:
        return <AIShell />;
      case AppSection.TOOLKIT_LIBRARY:
        return <ToolkitLibrary />;
      case AppSection.SYSTEM_INFO:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
            <div className={`p-6 rounded-full ${theme === 'Neon Dark' ? 'bg-amber-500/10 text-amber-500 neon-border-amber shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-amber-500/10 text-amber-500'}`}>
              <AlertCircle size={64} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">System Monitor Beta</h2>
            <p className="text-zinc-400 max-w-md leading-relaxed">Detailed hardware telemetry requires a Termux-API bridge which is currently being calibrated for this version.</p>
          </div>
        );
      case AppSection.SETTINGS:
        return (
          <div className="p-8 max-w-3xl mx-auto space-y-12">
            <header>
              <h2 className="text-4xl font-black text-white tracking-tight">HUB PREFERENCES</h2>
              <p className="text-zinc-500 mt-2 font-mono text-sm uppercase tracking-widest">v2.4.0-build.772</p>
            </header>
            
            <div className="grid gap-8">
              <div className="bg-[#121212] border border-zinc-800/50 rounded-3xl p-8 space-y-6 transition-all hover:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">AI Integration</h3>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-zinc-800/30">
                    <span className="text-zinc-400 font-medium">Model Engine</span>
                    <span className={`font-mono text-sm ${theme === 'Neon Dark' ? 'text-emerald-400 neon-emerald' : 'text-emerald-500'}`}>GEMINI-3-FLASH-PRO</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-zinc-800/30">
                    <span className="text-zinc-400 font-medium">Neural Context</span>
                    <span className="text-zinc-500 text-sm bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-tighter">Automatic</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] border border-zinc-800/50 rounded-3xl p-8 space-y-6 transition-all hover:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">Visual Workspace</h3>
                </div>
                <div className="grid gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-black/20 rounded-2xl border border-zinc-800/30">
                    <span className="text-zinc-400 font-medium">Interface Theme</span>
                    <div className="flex gap-2">
                      {['Classic Dark', 'Neon Dark', 'True Black'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            theme === t 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Github className="text-zinc-400" />
                  <div>
                    <h4 className="text-white font-bold">Open Source Core</h4>
                    <p className="text-sm text-zinc-500">Built with community effort</p>
                  </div>
                </div>
                <a href="https://github.com/milyes/TermuxToolkit.git" target="_blank" rel="noreferrer" className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all">
                  VIEW REPO
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'True Black' ? 'bg-black' : 'bg-[#050505]'}`}>
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
      />
      
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Menus Bar (App Bar) */}
        <header className="sticky top-0 z-30 w-full px-6 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className={`text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase ${theme === 'Neon Dark' ? 'neon-emerald text-emerald-400/70' : ''}`}>
              {activeSection.replace('_', ' ')}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
              theme === 'Neon Dark' 
                ? 'bg-emerald-500/10 border-emerald-500/40 neon-border-emerald' 
                : 'bg-zinc-900 border-zinc-800'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme === 'Neon Dark' ? 'bg-emerald-400' : 'bg-emerald-500'}`}></div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'Neon Dark' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                System Sync
              </span>
            </div>
            <button 
              onClick={() => setActiveSection(AppSection.SETTINGS)}
              className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 pb-12 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
