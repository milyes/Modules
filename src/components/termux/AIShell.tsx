import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  HelpCircle, 
  Terminal as TerminalIcon, 
  MessageSquare, 
  ChevronRight, 
  Globe, 
  Download, 
  Upload, 
  FileText, 
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TerminalOutput } from './TerminalOutput';
import { 
  getGeminiResponse, 
  simulateCommandExecution, 
  simulateSshRemoteExecution 
} from '../../services/termuxGeminiService';

export type MessageRole = 'user' | 'model';
export type MessageType = 'chat' | 'command';

export interface ChatMessage {
  role: MessageRole;
  type: MessageType;
  content: string;
  output?: string;
  timestamp: Date;
}

const COMMON_COMMANDS = [
  'pkg install', 'pkg update', 'pkg upgrade', 'apt update', 'apt upgrade',
  'ls -la', 'cd storage', 'cd downloads', 'pwd', 'whoami',
  'git clone', 'python', 'node', 'ssh', 'nmap', 'metasploit',
  'termux-setup-storage', 'chmod +x', 'nano', 'vim', 'cat',
  'rm -rf', 'mkdir', 'cp', 'mv', 'curl', 'wget', 'htop', 'top',
  'bash scan_iot.sh', 'bash wifi_detect_improved.sh'
];

export const AIShell: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      type: 'chat',
      content: `### Bienvenue dans le Shell Termux & Cyber Assistant NetSecure Pro
Vous pouvez :
- **Mode Terminal** : Taper des commandes shell (\`ls -la\`, \`pkg update\`, \`nmap\`, \`scan_iot.sh\`) pour voir leur exécution simulée.
- **Client SSH** : Lancer \`ssh root@192.168.1.10\` pour vous connecter à distance.
- **Mode Chat** : Poser n'importe quelle question sur Termux, Bash, Python ou l'audit réseau Android.
- **Upload Script** : Téléversez un script \`.sh\` ou \`.py\` pour analyse instantanée.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<MessageType>('command');
  const [sshSession, setSshSession] = useState<{ user: string; host: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (mode === 'command' && input.trim().length > 0) {
      const lowerInput = input.toLowerCase();
      const match = COMMON_COMMANDS.find(cmd => cmd.startsWith(lowerInput));
      if (match && match !== lowerInput) {
        setSuggestion(match);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  }, [input, mode]);

  const handleSend = async (overrideInput?: string, modeOverride?: MessageType) => {
    const textToSend = (overrideInput || input).trim();
    if (!textToSend || isLoading) return;

    const currentMode = modeOverride || mode;
    
    const userMsg: ChatMessage = { 
      role: 'user', 
      type: currentMode,
      content: textToSend, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSuggestion('');
    setIsLoading(true);

    try {
      if (currentMode === 'command') {
        // SSH Connection logic
        if (!sshSession && textToSend.startsWith('ssh ')) {
          const parts = textToSend.split(' ');
          const target = parts[1]; // user@host
          if (target && target.includes('@')) {
            const [user, host] = target.split('@');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const output = `The authenticity of host '${host}' can't be established.
ECDSA key fingerprint is SHA256:8f4c9b21a304e7e8fba182c1a520a91176.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '${host}' (ECDSA) to the list of known hosts.
${user}@${host}'s password: 
Last login: ${new Date().toUTCString()} from netsecure-termux
Linux ${host} 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 x86_64
Welcome to simulated remote server ${host}! Type 'exit' to disconnect.`;
            
            setMessages(prev => [...prev, { role: 'model', type: 'command', content: textToSend, output, timestamp: new Date() }]);
            setSshSession({ user, host });
          } else {
            const output = `ssh: Could not resolve hostname ${target}: Name or service not known`;
            setMessages(prev => [...prev, { role: 'model', type: 'command', content: textToSend, output, timestamp: new Date() }]);
          }
        } 
        else if (sshSession) {
          if (textToSend === 'exit' || textToSend === 'logout') {
            const output = `logout\nConnection to ${sshSession.host} closed.`;
            setMessages(prev => [...prev, { role: 'model', type: 'command', content: textToSend, output, timestamp: new Date() }]);
            setSshSession(null);
          } else {
            const output = await simulateSshRemoteExecution(textToSend, sshSession.user, sshSession.host);
            setMessages(prev => [...prev, { role: 'model', type: 'command', content: textToSend, output, timestamp: new Date() }]);
          }
        }
        else {
          const output = await simulateCommandExecution(textToSend);
          setMessages(prev => [...prev, { role: 'model', type: 'command', content: textToSend, output, timestamp: new Date() }]);
        }
      } else {
        const response = await getGeminiResponse(textToSend);
        setMessages(prev => [...prev, { role: 'model', type: 'chat', content: response, timestamp: new Date() }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', type: 'chat', content: "Une erreur est survenue lors du traitement.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setInput(suggestion);
      setSuggestion('');
    } else if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleExecuteCode = (code: string) => {
    setMode('command');
    handleSend(code, 'command');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (mode === 'chat') {
          setInput(`J'ai uploadé le script "${file.name}". Analyse son fonctionnement et sa sécurité :\n\n\`\`\`bash\n${content}\n\`\`\``);
        } else {
          setInput(content);
        }
      }
    };
    reader.readAsText(file);
  };

  const downloadSession = () => {
    if (messages.length === 0) return;
    const sessionText = messages.map(m => {
      const role = m.role === 'user' ? 'USER' : 'TERMUX';
      const output = m.output ? `\nOUTPUT:\n${m.output}` : '';
      return `[${m.timestamp.toISOString()}] ${role} (${m.type}): ${m.content}${output}\n${'-'.repeat(40)}`;
    }).join('\n\n');

    const blob = new Blob([sessionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `termux_session_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setMessages([]);
    setSshSession(null);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'chat' ? 'command' : 'chat');
  };

  return (
    <div className="flex flex-col h-[750px] bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Shell Header */}
      <header className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${
            sshSession 
              ? 'bg-blue-500/10 text-cyan-400 border border-cyan-500/30' 
              : (mode === 'chat' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30')
          }`}>
            {sshSession ? <Globe size={20} /> : (mode === 'chat' ? <Bot size={20} /> : <TerminalIcon size={20} />)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                {sshSession ? `SSH : ${sshSession.user}@${sshSession.host}` : (mode === 'chat' ? 'Termux AI Assistant' : 'Émulateur de Terminal Termux')}
              </h2>
              {sshSession && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase animate-pulse">
                  Session Distante Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {sshSession ? 'Connecté au serveur distant via tunnel chiffré' : (mode === 'chat' ? 'Conseils et génération de scripts en langage naturel' : 'Interpréteur bash interactif et simulation d\'outils Linux')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadSession}
            disabled={messages.length === 0}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
            title="Télécharger l'historique de session"
          >
            <Download size={16} />
          </button>

          {!sshSession && (
            <button 
              onClick={toggleMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                mode === 'chat' 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {mode === 'chat' ? <TerminalIcon size={14} /> : <MessageSquare size={14} />}
              <span>Passer en {mode === 'chat' ? 'Terminal' : 'Assistant IA'}</span>
            </button>
          )}

          <button 
            onClick={clearHistory}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            title="Effacer l'historique"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Message Output Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar bg-slate-950/60"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border shadow-lg ${
              msg.role === 'user' 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : (msg.type === 'command' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')
            }`}>
              {msg.role === 'user' ? <User size={15} /> : (msg.type === 'command' ? <TerminalIcon size={15} /> : <Bot size={15} />)}
            </div>
            
            <div className={`max-w-[90%] space-y-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-3 rounded-2xl shadow-xl transition-all ${
                msg.role === 'user' 
                  ? (msg.type === 'command' ? 'bg-cyan-600/90 text-white rounded-tr-none font-mono text-xs' : 'bg-emerald-600/90 text-white rounded-tr-none font-sans text-xs') 
                  : (msg.type === 'command' ? 'w-full' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-sans')
              }`}>
                {msg.type === 'command' && msg.role === 'user' && (
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="opacity-70 text-cyan-200">
                      {sshSession ? `${sshSession.user}@${sshSession.host}:~$` : 'u0_a241@termux:~$'}
                    </span>
                    <span className="font-semibold">{msg.content}</span>
                  </div>
                )}
                
                {msg.type === 'chat' && (
                  <div className="prose prose-invert prose-emerald prose-xs max-w-none leading-relaxed text-slate-200">
                    <ReactMarkdown 
                      components={{
                        code: ({ node, ...props }) => (
                          <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-cyan-400 text-[11px]" {...props} />
                        ),
                        pre: ({ node, ...props }) => {
                          const codeElement = React.Children.toArray(props.children).find(
                            (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'code'
                          );
                          const codeContent = codeElement ? (codeElement.props as any).children : '';
                          
                          return (
                            <div className="relative group/code my-3">
                              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto font-mono text-xs" {...props} />
                              <button 
                                onClick={() => handleExecuteCode(String(codeContent))}
                                className="absolute top-2 right-2 px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg opacity-0 group-hover/code:opacity-100 transition-all hover:bg-cyan-500/30 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                title="Exécuter dans le terminal"
                              >
                                <Play size={10} fill="currentColor" />
                                <span>Lancer</span>
                              </button>
                            </div>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.type === 'command' && msg.role === 'model' && msg.output && (
                  <div className="w-full">
                    <TerminalOutput 
                      command={msg.output} 
                      isAnimated={true} 
                      color={sshSession ? 'blue' : 'emerald'}
                    />
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border animate-pulse ${mode === 'chat' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
              {sshSession ? <Globe size={16} className="animate-spin" /> : (mode === 'chat' ? <Bot size={16} className="animate-spin" /> : <TerminalIcon size={16} className="animate-pulse" />)}
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-lg">
              <div className="flex gap-1.5 items-center">
                <span className="text-[11px] text-slate-400 font-mono">
                  {sshSession ? 'Routage vers le serveur SSH distant...' : (mode === 'chat' ? 'Synthèse IA en cours...' : 'Exécution dans Termux...')}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${sshSession ? 'bg-cyan-400' : (mode === 'chat' ? 'bg-emerald-400' : 'bg-cyan-400')}`} />
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${sshSession ? 'bg-cyan-400' : (mode === 'chat' ? 'bg-emerald-400' : 'bg-cyan-400')}`} />
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${sshSession ? 'bg-cyan-400' : (mode === 'chat' ? 'bg-emerald-400' : 'bg-cyan-400')}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Command Pills & Input Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
        {mode === 'command' && !sshSession && (
          <div className="flex flex-wrap gap-1.5">
            {[
              'ls -la', 
              'pkg update', 
              'bash scan_iot.sh', 
              'bash wifi_detect_improved.sh', 
              'nmap 192.168.1.1', 
              'ssh root@192.168.1.10', 
              'top', 
              'whoami'
            ].map(cmd => (
              <button 
                key={cmd}
                onClick={() => setInput(cmd)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono rounded-lg hover:border-cyan-500/50 hover:text-cyan-300 transition-all cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        {sshSession && (
          <div className="flex flex-wrap gap-1.5">
            {['uname -a', 'uptime', 'whoami', 'hostname', 'ls /var/log', 'cat /etc/os-release', 'exit'].map(cmd => (
              <button 
                key={cmd}
                onClick={() => setInput(cmd)}
                className="px-2.5 py-1 bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 text-[11px] font-mono rounded-lg hover:border-cyan-400 hover:text-white transition-all cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        {/* Input Field with Ghost Suggestion */}
        <div className="relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".sh,.txt,.js,.py"
          />
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 font-mono text-base transition-colors z-10 ${
            sshSession ? 'text-cyan-400' : (mode === 'command' ? 'text-cyan-400' : 'text-emerald-400')
          }`}>
            {sshSession ? <Globe size={18} /> : (mode === 'command' ? <ChevronRight size={18} /> : <MessageSquare size={18} />)}
          </div>

          <div className="relative flex-1">
            {/* Suggestion Ghost Text Overlay */}
            {mode === 'command' && suggestion && (
              <div className="absolute inset-0 pl-11 pr-28 py-3.5 pointer-events-none text-xs font-mono whitespace-pre flex items-center">
                <span className="invisible select-none">
                  {input}
                </span>
                <span className="text-slate-600 select-none">
                  {suggestion.slice(input.length)}
                </span>
                <span className="ml-2 text-[9px] font-bold text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Tab</span>
              </div>
            )}

            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                sshSession 
                  ? `Exécuter sur ${sshSession.host} ('exit' pour quitter)...` 
                  : (mode === 'chat' ? "Posez une question sur Termux, Bash ou l'audit réseau..." : "Tapez une commande (ex: pkg update, nmap, scan_iot.sh)...")
              }
              className={`w-full bg-slate-900 border border-slate-800 text-white pl-11 pr-24 py-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-xl font-mono text-xs relative z-0 ${
                sshSession 
                  ? 'focus:ring-cyan-500/20 focus:border-cyan-500 border-cyan-500/40' 
                  : (mode === 'chat' ? 'focus:ring-emerald-500/20 focus:border-emerald-500' : 'focus:ring-cyan-500/20 focus:border-cyan-500')
              }`}
            />
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all shadow-sm cursor-pointer"
              title="Uploader un script ou fichier (.sh, .py, .txt)"
            >
              <Upload size={16} />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer ${
                sshSession ? 'bg-cyan-600 hover:bg-cyan-500' : (mode === 'chat' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500')
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
          <span>
            {mode === 'command' && !sshSession ? 'Auto-complétion activée : Appuyez sur [Tab] pour compléter' : ''}
            {sshSession ? `Session SSH distante active (${sshSession.user}@${sshSession.host})` : (mode === 'chat' ? 'Mode Assistant Cyber & Mobile Linux' : '')}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${sshSession ? 'bg-cyan-400' : (mode === 'chat' ? 'bg-emerald-400' : 'bg-cyan-400')} animate-pulse`} />
            <span className="uppercase font-semibold">Prêt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIShell;
