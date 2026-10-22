import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Download, Terminal } from 'lucide-react';

interface TerminalOutputProps {
  command: string;
  isAnimated?: boolean;
  color?: 'emerald' | 'blue' | 'cyan' | 'amber';
  fileName?: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ 
  command, 
  isAnimated = false,
  color = 'emerald',
  fileName = 'terminal_output.txt'
}) => {
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState(isAnimated ? '' : command);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorMap = {
    emerald: 'text-emerald-400',
    blue: 'text-cyan-400',
    cyan: 'text-cyan-300',
    amber: 'text-amber-400'
  };

  const bgMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-cyan-500',
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-500'
  };

  useEffect(() => {
    if (!isAnimated) {
      setDisplayText(command);
      return;
    }
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(command.substring(0, i));
      i += 3;
      if (i > command.length) {
        setDisplayText(command);
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [command, isAnimated]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([command], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`group relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl w-full ${isAnimated ? 'transition-all duration-500' : ''}`}>
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/60" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Terminal className="h-3 w-3 text-cyan-500" />
            termux-pty
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleDownload}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Télécharger en fichier (.txt/.sh)"
          >
            <Download size={13} />
          </button>
          <button 
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Copier dans le presse-papier"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>
      <div 
        ref={containerRef}
        className={`p-3.5 ${colorMap[color]} leading-relaxed whitespace-pre overflow-x-auto max-h-[360px] custom-scrollbar scroll-smooth font-mono text-[11px]`}
      >
        {displayText}
        {isAnimated && displayText.length < command.length && (
          <span className={`inline-block w-2 h-3.5 ${bgMap[color]} ml-1 animate-pulse align-middle`}></span>
        )}
      </div>
    </div>
  );
};

export default TerminalOutput;
