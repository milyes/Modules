
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, HelpCircle, Terminal as TerminalIcon, MessageSquare, ChevronRight, Globe, Download, Upload, FileText, Play } from 'lucide-react';
import { ChatMessage, MessageType } from '../types';
import { getGeminiResponse, simulateCommandExecution, simulateSshRemoteExecution } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import TerminalOutput from './TerminalOutput';

const COMMON_COMMANDS = [
  'pkg install', 'pkg update', 'pkg upgrade', 'apt update', 'apt upgrade',
  'ls -la', 'cd storage', 'cd downloads', 'pwd', 'whoami',
  'git clone', 'python', 'node', 'ssh', 'nmap', 'metasploit',
  'termux-setup-storage', 'chmod +x', 'nano', 'vim', 'cat',
  'rm -rf', 'mkdir', 'cp', 'mv', 'curl', 'wget', 'htop', 'top'
];

const COMMON_PATHS = ['/sdcard', '~/storage', '~/scripts', '~/downloads', '/etc', '/bin', '/usr'];

const AIShell: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<MessageType>('chat');
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
        if (!sshSession && textToSend.startsWith('ssh ')) {
          const parts = textToSend.split(' ');
          const target = parts[1];
          if (target && target.includes('@')) {
            const [user, host] = target.split('@');
            await new Promise(resolve => setTimeout(resolve, 1500));
            const output = `The authenticity of host '${host}' can't be established.\nECDSA key fingerprint is SHA256:simulated_hash_value.\nAre you sure you want to continue connecting (yes/no)? yes\nWarning: Permanently added '${host}' (ECDSA) to the list of known hosts.\n${user}@${host}'s password: \nLast login: ${new Date().toUTCString()} from termux-session\nWelcome to simulated ${host}!`;
            
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
          setInput(`I have uploaded a script called "${file.name}". Please analyze it:\n\n\`\`\`bash\n${content}\n\`\`\``);
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
      const role = m.role === 'user' ? 'USER' : 'AI';
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
    if (confirm("Clear all conversation history?")) {
      setMessages([]);
      setSshSession(null);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'chat' ? 'command' : 'chat');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-8 bg-[#121212] border border-zinc-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${
            sshSession 
              ? 'bg-blue-500/10 text-blue-400' 
              : (mode === 'chat' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400')
          }`}>
            {sshSession ? <Globe size={24} /> : (mode === 'chat' ? <Bot size={24} /> : <TerminalIcon size={24} />)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {sshSession ? `SSH: ${sshSession.user}@${sshSession.host}` : (mode === 'chat' ? 'AI Assistant' : 'Terminal Emulator')}
            </h2>
            <p className="text-xs text-zinc-500">
              {sshSession ? 'Connected to Remote Server' : (mode === 'chat' ? 'Ask anything about Termux' : 'Simulate bash command execution')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadSession}
            disabled={messages.length === 0}
            className="p-2.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all disabled:opacity-30"
            title="Download Session"
          >
            <Download size={20} />
          </button>
          {!sshSession && (
            <button 
              onClick={toggleMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === 'chat' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {mode === 'chat' ? <TerminalIcon size={16} /> : <MessageSquare size={16} />}
              Switch to {mode === 'chat' ? 'Terminal' : 'Chat'}
            </button>
          )}
          <button 
            onClick={clearHistory}
            className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            title="Clear History"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <HelpCircle size={48} className="text-zinc-600" />
            <div>
              <p className="text-lg font-medium text-zinc-400">
                {mode === 'chat' ? 'Ask me anything about Termux' : 'Enter a command to simulate'}
              </p>
              <p className="text-sm text-zinc-600 max-w-sm">
                Try: "ssh root@cloud-vm", "ls -la", or "pkg update"
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
              msg.role === 'user' 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                : (msg.type === 'command' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')
            }`}>
              {msg.role === 'user' ? <User size={20} /> : (msg.type === 'command' ? <TerminalIcon size={20} /> : <Bot size={20} />)}
            </div>
            
            <div className={`max-w-[90%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-5 py-3.5 rounded-2xl shadow-xl transition-all ${
                msg.role === 'user' 
                  ? (msg.type === 'command' ? 'bg-cyan-600 text-white rounded-tr-none font-mono text-sm' : 'bg-emerald-600 text-white rounded-tr-none') 
                  : (msg.type === 'command' ? 'w-full' : 'bg-[#121212] border border-zinc-800 text-zinc-200 rounded-tl-none')
              }`}>
                {msg.type === 'command' && msg.role === 'user' && (
                  <div className="flex items-center gap-2">
                    <span className="opacity-60">
                      {sshSession ? `${sshSession.user}@${sshSession.host}:~$` : '$'}
                    </span>
                    {msg.content}
                  </div>
                )}
                
                {msg.type === 'chat' && (
                  <div className="prose prose-invert prose-emerald prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        code: ({ node, ...props }) => (
                          <code className="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-emerald-400" {...props} />
                        ),
                        pre: ({ node, ...props }) => {
                          const codeElement = React.Children.toArray(props.children).find(
                            (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'code'
                          );
                          const codeContent = codeElement ? (codeElement.props as any).children : '';
                          
                          return (
                            <div className="relative group/code my-4">
                              <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 overflow-x-auto font-mono text-xs md:text-sm" {...props} />
                              <button 
                                onClick={() => handleExecuteCode(String(codeContent))}
                                className="absolute top-2 right-2 p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg opacity-0 group-hover/code:opacity-100 transition-all hover:bg-emerald-500/20 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                                title="Execute in Terminal"
                              >
                                <Play size={14} fill="currentColor" />
                                Execute
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
              <div className="text-[10px] text-zinc-600 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border animate-pulse ${mode === 'chat' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
              {sshSession ? <Globe size={20} className="animate-spin" /> : (mode === 'chat' ? <Bot size={20} className="animate-spin" /> : <TerminalIcon size={20} className="animate-pulse" />)}
            </div>
            <div className="bg-[#121212] border border-zinc-800 px-6 py-4 rounded-2xl rounded-tl-none shadow-lg">
              <div className="flex gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${sshSession ? 'bg-blue-500' : (mode === 'chat' ? 'bg-emerald-500' : 'bg-cyan-500')}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${sshSession ? 'bg-blue-500' : (mode === 'chat' ? 'bg-emerald-500' : 'bg-cyan-500')}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${sshSession ? 'bg-blue-500' : (mode === 'chat' ? 'bg-emerald-500' : 'bg-cyan-500')}`}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".sh,.txt,.js,.py"
          />
          <div className={`absolute left-5 top-1/2 -translate-y-1/2 font-mono text-lg transition-colors z-10 ${
            sshSession ? 'text-blue-500' : (mode === 'command' ? 'text-cyan-500' : 'text-emerald-500')
          }`}>
            {sshSession ? <Globe size={20} /> : (mode === 'command' ? <ChevronRight size={20} /> : <MessageSquare size={20} />)}
          </div>

          <div className="relative flex-1">
            {/* Suggestion Ghost Text Overlay */}
            {mode === 'command' && suggestion && (
              <div className="absolute inset-0 pl-12 pr-28 py-5 pointer-events-none text-sm md:text-base font-mono whitespace-pre flex items-center">
                <span className="invisible select-none">
                  {input}
                </span>
                <span className="text-zinc-700 select-none">
                  {suggestion.slice(input.length)}
                </span>
                <span className="ml-2 text-[10px] font-bold text-zinc-600 uppercase bg-zinc-800 px-1 rounded">Tab</span>
              </div>
            )}

            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={sshSession ? `Execute command on ${sshSession.host}...` : (mode === 'chat' ? "Ask the AI assistant..." : "Enter shell command...")}
              className={`w-full bg-[#121212] border border-zinc-800 text-white pl-12 pr-28 py-5 rounded-2xl focus:outline-none focus:ring-4 transition-all shadow-2xl font-mono text-sm md:text-base relative z-0 ${
                sshSession 
                  ? 'focus:ring-blue-500/10 focus:border-blue-500 border-blue-500/30'
                  : (mode === 'chat' ? 'focus:ring-emerald-500/10 focus:border-emerald-500' : 'focus:ring-cyan-500/10 focus:border-cyan-500')
              }`}
            />
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all shadow-lg"
              title="Upload Script/File"
            >
              <Upload size={20} />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-3 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                sshSession ? 'bg-blue-600 hover:bg-blue-500' : (mode === 'chat' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500')
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            {mode === 'command' && !sshSession ? 'Autosuggestion enabled: Press Tab to complete' : ''}
            {sshSession ? `Remote Session Active: encrypted simulation` : (mode === 'command' && !suggestion ? 'Simulation Mode: Results are predictive' : (mode === 'chat' ? 'Conversation Mode: System knowledge up to 2024' : ''))}
          </p>
          <div className="flex items-center gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${sshSession ? 'bg-blue-500' : (mode === 'chat' ? 'bg-emerald-500' : 'bg-cyan-500')} animate-pulse`}></div>
             <span className="text-[10px] text-zinc-600 font-mono uppercase">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIShell;
