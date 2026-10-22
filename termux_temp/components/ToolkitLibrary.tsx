
import React, { useState } from 'react';
import { Search, ExternalLink, Download, Star, X, Loader2, FileCode, Copy, Check, Grid, Cpu, Globe, Code, Shield, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TerminalOutput from './TerminalOutput';
import { generateToolScript, generateQuickGuide } from '../services/geminiService';

const CATEGORIES = [
  { name: 'All', icon: Grid },
  { name: 'System', icon: Cpu },
  { name: 'Network', icon: Globe },
  { name: 'Programming', icon: Code },
  { name: 'Security', icon: Shield },
];

const TOOLS = [
  { name: 'Metasploit', desc: 'Penetration testing framework', stars: '30k+', cmd: 'pkg install metasploit', category: 'Security' },
  { name: 'Node.js', desc: 'JavaScript runtime built on Chrome\'s V8 engine', stars: '90k+', cmd: 'pkg install nodejs', category: 'Programming' },
  { name: 'Python', desc: 'High-level programming language', stars: '50k+', cmd: 'pkg install python', category: 'Programming' },
  { name: 'Nmap', desc: 'Network discovery and security auditing', stars: '7k+', cmd: 'pkg install nmap', category: 'Network' },
  { name: 'Vim', desc: 'Highly configurable text editor', stars: '32k+', cmd: 'pkg install vim', category: 'System' },
  { name: 'Zsh', desc: 'Shell designed for interactive use', stars: '15k+', cmd: 'pkg install zsh', category: 'System' },
];

const ToolkitLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScript, setActiveScript] = useState('');
  const [selectedTool, setSelectedTool] = useState<typeof TOOLS[0] | null>(null);
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
        setQuickGuides(prev => ({ ...prev, [toolName]: 'Failed to retrieve quick guide.' }));
      } finally {
        setLoadingGuides(prev => ({ ...prev, [toolName]: false }));
      }
    }
  };
  
  const filteredTools = TOOLS.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.desc.toLowerCase().includes(search.toLowerCase()) ||
                          t.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGetScript = async (tool: typeof TOOLS[0]) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
    setIsGenerating(true);
    setActiveScript('');

    const script = await generateToolScript(tool.name, tool.desc);
    setActiveScript(script);
    setIsGenerating(false);
  };

  const handleDownloadScript = () => {
    if (!activeScript || !selectedTool) return;
    const blob = new Blob([activeScript], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setup_${selectedTool.name.toLowerCase()}.sh`;
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
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Toolbox Library</h2>
          <p className="text-zinc-400 mt-2">Browse and install top-rated utilities for your environment.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="w-full bg-[#121212] border border-zinc-800 text-white pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-all shadow-lg"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl border transition-all duration-300 font-semibold uppercase tracking-wider ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/25'
                  : 'bg-[#121212] border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-850 hover:border-zinc-750'
              }`}
            >
              <Icon size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {filteredTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#121212]/50 border border-zinc-800/50 rounded-3xl p-8">
          <div className="p-4 bg-zinc-900/50 text-emerald-400 rounded-full mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 animate-pulse">No Tools Match Search</h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed font-mono text-[11px] uppercase tracking-wider">
            No packages match "{search}" {selectedCategory !== 'All' ? `with category "${selectedCategory}"` : ''}
          </p>
          <div className="flex gap-4">
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                CLEAR SEARCH
              </button>
            )}
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl transition-all"
              >
                RESET CATEGORY
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, i) => (
            <div key={i} className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-900 transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20">
                  {tool.category}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  {tool.stars}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{tool.name}</h3>
              <p className="text-sm text-zinc-400 mb-6 flex-1 line-clamp-2">{tool.desc}</p>
              <div className="space-y-4 pt-4 border-t border-zinc-850 mt-auto">
                <TerminalOutput command={tool.cmd} />
                
                <button 
                  onClick={() => toggleQuickGuide(tool.name, tool.desc)}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850/80 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-between px-4"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-400" />
                    <span>Quick Guide</span>
                  </span>
                  {expandedGuides[tool.name] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandedGuides[tool.name] && (
                  <div className="p-4 bg-zinc-950/75 rounded-xl border border-zinc-850 text-xs text-zinc-300 max-h-[220px] overflow-y-auto custom-scrollbar transition-all animate-in slide-in-from-top-1 duration-200">
                    {loadingGuides[tool.name] ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-zinc-500 font-mono">
                        <Loader2 size={12} className="animate-spin text-emerald-400" />
                        <span>Retrieving guide from Gemini...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-xs leading-relaxed text-zinc-300">
                        <ReactMarkdown
                          components={{
                            code: ({ node, ...props }) => (
                              <code className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-1 py-0.5 rounded font-mono text-[10px] select-all my-1 block whitespace-pre-wrap leading-normal" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-2 last:mb-0 text-zinc-400" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-zinc-400" {...props} />
                            )
                          }}
                        >
                          {quickGuides[tool.name] || 'No commands retrieved.'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => handleGetScript(tool)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Get Script
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Script Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <FileCode size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedTool?.name} Setup Script</h3>
                  <p className="text-xs text-zinc-500 font-mono">setup_{selectedTool?.name?.toLowerCase()}.sh</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 size={40} className="text-emerald-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-white font-medium">Synthesizing script...</p>
                    <p className="text-xs text-zinc-500">Gemini is writing the optimized setup for your environment.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400">
                    <p className="font-semibold flex items-center gap-2 mb-1">
                      <ExternalLink size={14} /> 
                      Execution Instructions:
                    </p>
                    <p className="text-xs opacity-80 leading-relaxed">
                      Download the script, or copy and run: <code className="bg-emerald-500/20 px-1 rounded">chmod +x setup.sh && ./setup.sh</code>
                    </p>
                  </div>
                  <TerminalOutput 
                    command={activeScript} 
                    isAnimated={true} 
                    fileName={`setup_${selectedTool?.name?.toLowerCase()}.sh`}
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleCopy}
                disabled={isGenerating || !activeScript}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button 
                onClick={handleDownloadScript}
                disabled={isGenerating || !activeScript}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Download size={16} />
                Download .sh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolkitLibrary;
