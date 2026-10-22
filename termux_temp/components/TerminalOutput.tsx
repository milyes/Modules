
import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface TerminalOutputProps {
  command: string;
  isAnimated?: boolean;
  color?: 'emerald' | 'blue' | 'cyan' | 'amber';
  fileName?: string;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ 
  command, 
  isAnimated = false,
  color = 'emerald',
  fileName = 'terminal_output.txt'
}) => {
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState(isAnimated ? '' : command);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorMap = {
    emerald: 'text-emerald-500/90',
    blue: 'text-blue-400/90',
    cyan: 'text-cyan-400/90',
    amber: 'text-amber-400/90'
  };

  const bgMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
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
    <div className={`group relative bg-[#050505] rounded-xl border border-zinc-800 overflow-hidden font-mono text-sm shadow-2xl w-full ${isAnimated ? 'transition-all duration-500' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            title="Download as File"
          >
            <Download size={14} />
          </button>
          <button 
            onClick={handleCopy}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            title="Copy to Clipboard"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <div 
        ref={containerRef}
        className={`p-4 ${colorMap[color]} leading-relaxed whitespace-pre overflow-x-auto max-h-[400px] custom-scrollbar scroll-smooth`}
      >
        {displayText}
        {isAnimated && displayText.length < command.length && (
          <span className={`inline-block w-2 h-4 ${bgMap[color]} ml-1 animate-pulse align-middle`}></span>
        )}
      </div>
    </div>
  );
};

export default TerminalOutput;
