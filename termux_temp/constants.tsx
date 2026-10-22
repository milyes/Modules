
import React from 'react';
import { 
  Terminal, 
  LayoutDashboard, 
  Library, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Wifi, 
  Code, 
  Package 
} from 'lucide-react';
import { CommandTemplate } from './types';

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'SHELL_ASSISTANT', label: 'AI Shell Assistant', icon: <Terminal size={20} /> },
  { id: 'TOOLKIT_LIBRARY', label: 'Toolkit Library', icon: <Library size={20} /> },
  { id: 'SYSTEM_INFO', label: 'System Monitor', icon: <Cpu size={20} /> },
  { id: 'SETTINGS', label: 'Settings', icon: <Settings size={20} /> },
];

export const QUICK_COMMANDS: CommandTemplate[] = [
  {
    id: '1',
    name: 'Full Update',
    command: 'pkg update && pkg upgrade -y',
    description: 'Update and upgrade all installed packages.',
    category: 'System'
  },
  {
    id: '2',
    name: 'Setup Storage',
    command: 'termux-setup-storage',
    description: 'Request permission to access Android internal storage.',
    category: 'System'
  },
  {
    id: '3',
    name: 'Install Git',
    command: 'pkg install git -y',
    description: 'Install version control system for cloning repos.',
    category: 'Programming'
  },
  {
    id: '4',
    name: 'Network Tools',
    command: 'pkg install dnsutils nmap -y',
    description: 'Install essential networking diagnostic tools.',
    category: 'Network'
  }
];

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  System: <Settings size={16} />,
  Network: <Wifi size={16} />,
  Programming: <Code size={16} />,
  Security: <ShieldCheck size={16} />,
  Media: <Package size={16} />,
};
