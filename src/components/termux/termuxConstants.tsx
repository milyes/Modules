import React from 'react';
import { 
  Terminal, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Wifi, 
  Code, 
  Package, 
  Radar, 
  Activity,
  Layers,
  Lock,
  Search,
  Radio,
  Server
} from 'lucide-react';

export interface CommandTemplate {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'System' | 'Network' | 'Programming' | 'Security' | 'NetSecure';
}

export const QUICK_COMMANDS: CommandTemplate[] = [
  {
    id: '1',
    name: 'Mise à jour Globale',
    command: 'pkg update && pkg upgrade -y',
    description: 'Met à jour les listes de paquets et installe les dernières versions de sécurité.',
    category: 'System'
  },
  {
    id: '2',
    name: 'Accès Stockage Android',
    command: 'termux-setup-storage',
    description: 'Autorise Termux à lire et écrire sur le stockage partagé /sdcard.',
    category: 'System'
  },
  {
    id: '3',
    name: 'Audit NetSecure IoT',
    command: 'bash scan_iot.sh',
    description: 'Scanne le subnet local et audite les failles RTSP/HTTP sur les caméras et objets connectés.',
    category: 'NetSecure'
  },
  {
    id: '4',
    name: 'Détection Wi-Fi Heuristique',
    command: 'bash wifi_detect_improved.sh',
    description: 'Analyse spectrale radio et détection d\'attaques Rogue AP / Evil Twin.',
    category: 'NetSecure'
  },
  {
    id: '5',
    name: 'Outils Réseau & Nmap',
    command: 'pkg install -y dnsutils nmap net-tools',
    description: 'Installe les binaires essentiels de cartographie et de diagnostic TCP/UDP.',
    category: 'Network'
  },
  {
    id: '6',
    name: 'Environnement Python 3',
    command: 'pkg install -y python python-pip && pip install requests',
    description: 'Installe le runtime Python 3 et les dépendances pour scripts cyberdéfense.',
    category: 'Programming'
  },
  {
    id: '7',
    name: 'Framework Metasploit',
    command: 'pkg install -y metasploit',
    description: 'Framework complet d\'audit de pénétration et de tests d\'intrusion autorisés.',
    category: 'Security'
  },
  {
    id: '8',
    name: 'Connexion SSH Sécurisée',
    command: 'ssh root@192.168.1.10',
    description: 'Simule une session SSH distante avec invite interactive et chiffrement ECDSA.',
    category: 'Network'
  }
];

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  System: <Settings size={15} />,
  Network: <Wifi size={15} />,
  Programming: <Code size={15} />,
  Security: <ShieldCheck size={15} />,
  NetSecure: <Radar size={15} />,
  Media: <Package size={15} />,
};

export const TOOLS_CATALOG = [
  { 
    name: 'Nmap', 
    desc: 'Scanner de ports de référence, découverte des hôtes et empreintes de services', 
    stars: '8.4k', 
    cmd: 'pkg install -y nmap', 
    category: 'Network' 
  },
  { 
    name: 'Metasploit', 
    desc: 'Framework modulaire de tests de pénétration et validation de remédiations', 
    stars: '32k', 
    cmd: 'pkg install -y metasploit', 
    category: 'Security' 
  },
  { 
    name: 'Python', 
    desc: 'Langage d\'automatisation et scripts heuristiques pour NetSecure Pro', 
    stars: '54k', 
    cmd: 'pkg install -y python python-pip', 
    category: 'Programming' 
  },
  { 
    name: 'Node.js', 
    desc: 'Runtime JavaScript V8 pour agents locaux et micro-serveurs embarqués', 
    stars: '92k', 
    cmd: 'pkg install -y nodejs', 
    category: 'Programming' 
  },
  { 
    name: 'Tshark', 
    desc: 'Analyseur de paquets en ligne de commande (Wireshark CLI) pour capture de trames', 
    stars: '14k', 
    cmd: 'pkg install -y tshark', 
    category: 'Network' 
  },
  { 
    name: 'Aircrack-ng', 
    desc: 'Suite d\'évaluation et d\'audit des protocoles sans-fil 802.11 (WPA2/WPA3)', 
    stars: '19k', 
    cmd: 'pkg install -y aircrack-ng', 
    category: 'Security' 
  },
  { 
    name: 'Hydra', 
    desc: 'Outil de test de robustesse des mots de passe sur protocoles réseaux (SSH, FTP, HTTP)', 
    stars: '11k', 
    cmd: 'pkg install -y hydra', 
    category: 'Security' 
  },
  { 
    name: 'Vim', 
    desc: 'Éditeur de texte modal ultra-rapide et configurable pour scripts shell', 
    stars: '35k', 
    cmd: 'pkg install -y vim', 
    category: 'System' 
  },
  { 
    name: 'Zsh & Oh-My-Zsh', 
    desc: 'Shell interactif puissant avec plugins de complétion et thèmes cyber', 
    stars: '160k', 
    cmd: 'pkg install -y zsh', 
    category: 'System' 
  },
  { 
    name: 'Netcat (nc)', 
    desc: 'Couteau suisse TCP/IP pour test d\'écoute, redirection de ports et bannières', 
    stars: '12k', 
    cmd: 'pkg install -y netcat-openbsd', 
    category: 'Network' 
  }
];
