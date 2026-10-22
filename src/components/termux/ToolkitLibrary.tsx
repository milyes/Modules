import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  Download, 
  Star, 
  X, 
  Loader2, 
  FileCode, 
  Copy, 
  Check, 
  Grid, 
  Cpu, 
  Globe, 
  Code, 
  Shield, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TerminalOutput } from './TerminalOutput';
import { TOOLS_CATALOG } from './termuxConstants';
import { generateToolScript, generateQuickGuide } from '../../services/termuxGeminiService';

const CATEGORIES = [
  { name: 'Tous', filter: 'All', icon: Grid },
  { name: 'Système', filter: 'System', icon: Cpu },
  { name: 'Réseau', filter: 'Network', icon: Globe },
  { name: 'Programmation', filter: 'Programming', icon: Code },
  { name: 'Sécurité & Pentest', filter: 'Security', icon: Shield },
];

export const ToolkitLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScript, setActiveScript] = useState('');
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS_CATALOG[0] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quickGuides, setQuickGuides] = useState<Record<string, string>>({});
  const [loadingGuides, setLoadingGuides] = useState<Record<string, boolean>>({});
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});

  const toggleQuickGuide = async (toolName: string, desc: string) => {
    setExpandedGuides(prev => ({ ...prev, [toolName]: !prev[toolName] }));
    if (!quickGuides[toolName] && !loadingGuides[toolName]) {
      setLoadingGuides(prev => ({ ...prev, [toolName]: true }));
      try {
        const guide = await generateQuickGuide(toolName, desc);
        setQuickGuides(prev => ({ ...prev, [toolName]: guide }));
      } catch (err) {
        console.error(err);
        setQuickGuides(prev => ({ ...prev, [toolName]: 'Échec du chargement du guide rapide.' }));
      } finally {
        setLoadingGuides(prev => ({ ...prev, [toolName]: false }));
      }
    }
  };

  const filteredTools = TOOLS_CATALOG.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.desc.toLowerCase().includes(search.toLowerCase()) ||
                          t.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGetScript = async (tool: typeof TOOLS_CATALOG[0]) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
    setIsGenerating(true);
    setActiveScript('');
    try {
      const script = await generateToolScript(tool.name, tool.desc);
      setActiveScript(script);
    } catch (e) {
      setActiveScript(`#!/bin/bash\npkg update && pkg install -y ${tool.name.toLowerCase()}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadScript = () => {
    if (!activeScript || !selectedTool) return;
    const blob = new Blob([activeScript], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setup_${selectedTool.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveScript('');
    setSelectedTool(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Boîte à Outils & Packages Termux</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {filteredTools.length} disponibles
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Packages pré-configurés, générateurs de scripts d'installation et guides d'utilisation rapides pour Linux sur Android.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (ex: nmap, metasploit, python)..."
            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-9 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Effacer recherche"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.filter;
          return (
            <button
              key={cat.filter}
              onClick={() => setSelectedCategory(cat.filter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon size={14} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <Search size={32} className="text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Aucun package correspondant</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Aucun outil ne correspond à votre filtre "{search}".
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool, i) => (
            <div key={i} className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-cyan-500/20">
                    {tool.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>{tool.stars}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <TerminalOutput command={tool.cmd} />
                
                {/* Expandable Quick Guide */}
                <button 
                  onClick={() => toggleQuickGuide(tool.name, tool.desc)}
                  className="w-full py-1.5 bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium rounded-xl transition-all flex items-center justify-between px-3 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-cyan-400" />
                    <span>Guide rapide & commandes clés</span>
                  </span>
                  {expandedGuides[tool.name] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {expandedGuides[tool.name] && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 max-h-[200px] overflow-y-auto custom-scrollbar transition-all">
                    {loadingGuides[tool.name] ? (
                      <div className="flex items-center justify-center py-3 gap-2 text-slate-400 font-mono text-[11px]">
                        <Loader2 size={12} className="animate-spin text-cyan-400" />
                        <span>Génération du guide d'usage...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-xs text-slate-300 leading-normal">
                        <ReactMarkdown
                          components={{
                            code: ({ node, ...props }) => (
                              <code className="bg-slate-900 border border-slate-800 text-cyan-300 px-1 py-0.5 rounded font-mono text-[10px] my-1 inline-block" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-1 text-slate-300" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-4 space-y-0.5 mb-1" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-slate-400" {...props} />
                            )
                          }}
                        >
                          {quickGuides[tool.name] || 'Aucun guide disponible.'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => handleGetScript(tool)}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Générer Script .sh</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Script Generation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Script d'Installation Automatisé : {selectedTool?.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">setup_{selectedTool?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sh</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 size={36} className="text-cyan-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Génération du script bash...</p>
                    <p className="text-xs text-slate-400">Optimisation pour l'architecture ARM64 et l'environnement Termux Android.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-xs text-cyan-300">
                    <p className="font-semibold flex items-center gap-1.5 mb-1 text-[11px]">
                      <ExternalLink size={13} /> 
                      Instructions d'exécution dans Termux :
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                      chmod +x setup_{selectedTool?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sh && ./setup_{selectedTool?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sh
                    </p>
                  </div>
                  <TerminalOutput 
                    command={activeScript} 
                    isAnimated={true} 
                    fileName={`setup_${selectedTool?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sh`}
                  />
                </>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-2.5">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button 
                onClick={handleCopy}
                disabled={isGenerating || !activeScript}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copié !' : 'Copier le script'}</span>
              </button>
              <button 
                onClick={handleDownloadScript}
                disabled={isGenerating || !activeScript}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Télécharger .sh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolkitLibrary;
