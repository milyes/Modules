
import React from 'react';
import { QUICK_COMMANDS, CATEGORY_ICONS } from '../constants';
import TerminalOutput from './TerminalOutput';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Activity, Shield, Box } from 'lucide-react';

const mockData = [
  { time: '12:00', cpu: 12, ram: 45 },
  { time: '12:01', cpu: 25, ram: 48 },
  { time: '12:02', cpu: 18, ram: 44 },
  { time: '12:03', cpu: 65, ram: 52 },
  { time: '12:04', cpu: 32, ram: 49 },
  { time: '12:05', cpu: 45, ram: 50 },
  { time: '12:06', cpu: 28, ram: 47 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-[#121212] border border-zinc-800/50 p-6 rounded-[2rem] hover:border-zinc-600/50 transition-all duration-300 group hover:-translate-y-1`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 bg-${color}-500/10 text-${color}-400 theme-neon:neon-border-${color}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono text-zinc-500 tracking-tighter bg-zinc-800/50 px-2 py-0.5 rounded-full">+2.4%</span>
    </div>
    <h3 className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-widest">{title}</h3>
    <p className="text-3xl font-black text-white tracking-tighter theme-neon:neon-emerald">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-10 max-w-7xl mx-auto">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter theme-neon:neon-emerald">COMMAND CENTER</h2>
        <p className="text-zinc-500 font-medium tracking-wide">Kernel state: <span className="text-emerald-500">Optimized</span>. All modules operational.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="CPU Load" value="28.4%" icon={<Zap size={20} />} color="emerald" />
        <StatCard title="Memory" value="1.2 GB" icon={<Activity size={20} />} color="cyan" />
        <StatCard title="Active Jobs" value="14" icon={<Box size={20} />} color="purple" />
        <StatCard title="Security" value="SECURE" icon={<Shield size={20} />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource Graph */}
        <div className="lg:col-span-2 bg-[#121212] border border-zinc-800/50 p-8 rounded-[2.5rem] relative overflow-hidden transition-all hover:border-zinc-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">REAL-TIME TELEMETRY</h3>
            <div className="flex gap-4 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> CPU</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> RAM</span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" stroke="#444" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#333', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="ram" stroke="#06b6d4" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-[#121212] border border-zinc-800/50 p-8 rounded-[2.5rem] flex flex-col gap-6 transition-all hover:border-zinc-700/50">
          <h3 className="text-xl font-bold text-white tracking-tight">INSTANT SCRIPTS</h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {QUICK_COMMANDS.map((cmd) => (
              <div key={cmd.id} className="space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                    <span className="text-emerald-500">{CATEGORY_ICONS[cmd.category]}</span>
                    {cmd.name}
                  </span>
                </div>
                <TerminalOutput command={cmd.command} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
