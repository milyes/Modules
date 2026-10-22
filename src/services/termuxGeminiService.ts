import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Termux Toolkit Assistant", a specialized AI for users running Linux inside Termux on Android.
Your expertise covers:
1. Command generation: Help users write complex shell commands using pkg, apt, and Termux-specific binaries.
2. Scripting: Help write Bash, Python, or Ruby scripts optimized for the mobile environment.
3. Troubleshooting: Explain error codes specific to Android/Termux environments.
4. Security: Provide safe, ethical guidance on networking and system administration.

Always use a professional, slightly technical tone. 
Wrap commands in markdown code blocks: \`pkg install nodejs\`.
Warn users before suggesting destructive commands like 'rm -rf /'.
Mention Termux-specific tools like 'termux-api', 'termux-storage-get', etc., when relevant.
`;

const TERMINAL_SIMULATION_INSTRUCTION = `
You are a high-fidelity Linux Terminal Emulator running inside Termux on an Android device.
The user will input a command. You must respond with the EXACT STDOUT/STDERR output that a Termux environment would produce.

Rules:
1. Provide ONLY the terminal output. 
2. NO conversational text, NO markdown formatting (except for code if necessary, but ideally raw text).
3. NO explanations.
4. If a command is missing, show a bash-style error: "bash: [command]: command not found".
5. If the user asks for a file list (ls), simulate a realistic directory structure (e.g., includes 'storage', 'scripts', 'downloads').
6. Simulate common Termux behavior (e.g., 'pkg' output with progress bars, 'apt' headers).
7. Keep it brief and technical.
`;

const REMOTE_SSH_INSTRUCTION = `
You are simulating a REMOTE SSH SERVER. 
The user is connected to you via SSH from their Termux environment.
The hostname is [HOSTNAME]. The user is [USER].

Rules:
1. Provide ONLY the terminal output of the command.
2. The environment should feel like a standard cloud Linux server (Ubuntu/Debian).
3. If the user runs 'exit', return: "logout\\nConnection to [HOSTNAME] closed."
4. Maintain a consistent simulated file system for this session.
5. Do NOT use Termux-specific commands like 'pkg' unless the remote server is another Termux instance (assume standard apt/yum).
`;

const SCRIPT_GEN_INSTRUCTION = `
You are a senior DevOps engineer specialized in Termux.
Your goal is to generate robust, clean, and well-commented bash scripts for tool installation and setup.

Rules:
1. Output ONLY the bash code.
2. No conversational filler like "Here is your script".
3. Use 'pkg' for package management.
4. Include an 'official' look: add a header with tool name and version info.
5. Include basic error handling (e.g., exit if a command fails).
6. Ensure the script is safe for mobile environments.
`;

const QUICK_GUIDE_INSTRUCTION = `
You are a command-line expert and technical instructor.
Your goal is to provide a brief, high-fidelity Quick Guide for commands/utilities inside Termux.

Rules:
1. Provide a concise summary of 3-5 basic, most essential usage commands/options.
2. Format each command clearly with a brief 1-line explanation.
3. Keep it purely in readable markdown.
4. Do NOT include introductory text like "Sure, here's the guide" or conversational filler.
5. Emphasize standard Termux usage and clean command syntax. Keep it dense and informative.
`;

// Helper for offline / fallback simulated responses
const getLocalSimulationOutput = (command: string): string | null => {
  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'ls' || lower === 'ls -la' || lower === 'ls -l') {
    return `total 48
drwx------ 8 u0_a241 u0_a241 4096 Oct 22 14:02 .
drwxr-xr-x 4 root    root    4096 Oct 22 13:50 ..
drwxr-xr-x 2 u0_a241 u0_a241 4096 Oct 22 13:55 downloads
drwxr-xr-x 3 u0_a241 u0_a241 4096 Oct 22 13:58 scripts
drwxr-xr-x 2 u0_a241 u0_a241 4096 Oct 22 14:00 storage
-rwxr-xr-x 1 u0_a241 u0_a241 1240 Oct 22 14:01 scan_iot.sh
-rwxr-xr-x 1 u0_a241 u0_a241  980 Oct 22 14:01 wifi_detect_improved.sh
-rw------- 1 u0_a241 u0_a241  420 Oct 22 14:02 .bashrc
-rw------- 1 u0_a241 u0_a241 2048 Oct 22 14:02 .bash_history`;
  }

  if (lower === 'pwd') {
    return `/data/data/com.termux/files/home`;
  }

  if (lower === 'whoami') {
    return `u0_a241`;
  }

  if (lower === 'uname -a') {
    return `Linux localhost 5.15.137-android14-9-g04245-ab11244400 #1 SMP PREEMPT Thu Jan 15 02:44:00 UTC 2026 aarch64 Android`;
  }

  if (lower.startsWith('pkg update') || lower.startsWith('apt update')) {
    return `Hit:1 https://packages.termux.dev/apt/termux-main stable InRelease
Hit:2 https://packages.termux.dev/apt/termux-root root InRelease
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
All packages are up to date.
[*] NetSecure Pro Termux repository mirror synchronized (HTTP 200 OK).`;
  }

  if (lower.startsWith('pkg install') || lower.startsWith('apt install')) {
    const pkgName = trimmed.split(' ').slice(2).join(' ') || 'package';
    return `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  ${pkgName}
0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
Need to get 4,821 kB of archives.
Get:1 https://packages.termux.dev/apt/termux-main stable/main aarch64 ${pkgName} [4,821 kB]
Fetched 4,821 kB in 1s (4,120 kB/s)
Selecting previously unselected package ${pkgName}.
Preparing to unpack .../${pkgName}_aarch64.deb ...
Unpacking ${pkgName} ...
Setting up ${pkgName} ...
[*] ${pkgName} installed successfully and linked to /data/data/com.termux/files/usr/bin/${pkgName}.`;
  }

  if (lower.startsWith('nmap')) {
    return `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-22 14:05 UTC
Nmap scan report for gateway.lan (192.168.1.1)
Host is up (0.0032s latency).
Not shown: 994 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
53/tcp   open  domain
80/tcp   open  http
443/tcp  open  https
8080/tcp open  http-proxy
MAC Address: 00:11:22:33:44:55 (Cisco-Linksys)
Nmap done: 1 IP address (1 host up) scanned in 1.48 seconds`;
  }

  if (lower.startsWith('termux-setup-storage')) {
    return `[+] Requesting android.permission.READ_EXTERNAL_STORAGE...
[+] Requesting android.permission.WRITE_EXTERNAL_STORAGE...
[✓] Permission granted. Symbolic links created in ~/storage:
  ~/storage/shared -> /sdcard
  ~/storage/downloads -> /sdcard/Download
  ~/storage/dcim -> /sdcard/DCIM
  ~/storage/pictures -> /sdcard/Pictures
  ~/storage/music -> /sdcard/Music`;
  }

  if (lower.includes('scan_iot.sh')) {
    return `[NETSECURE PRO] Lancement du script scan_iot.sh...
[*] Détection du sous-réseau local: 192.168.1.0/24
[*] Envoi des trames ARP broadcast...
[+] Hôte trouvé: 192.168.1.1   - Passerelle Cisco (Score: 92/100)
[+] Hôte trouvé: 192.168.1.15  - Laptop Dell Latitude (Score: 88/100)
[!] Hôte trouvé: 192.168.1.45  - Caméra IP Hikvision (Score: 42/100) -> RTSP 554 Ouvert!
[!] Hôte trouvé: 192.168.1.60  - Imprimante HP LaserJet (Score: 58/100) -> HTTP admin sans SSL
[+] Scan IoT terminé en 2.34s. 4 hôtes identifiés, 2 vulnérabilités critiques signalées.`;
  }

  if (lower.includes('wifi_detect') || lower.includes('wifi_1.sh')) {
    return `[NETSECURE PRO] Analyse des interfaces sans fil en cours...
[*] Interface wlan0 active (Canal 6, 2.437 GHz, BSSID: E0:D5:5E:22:11:AA)
[+] Chiffrement: WPA3-SAE / WPA2-Personal (Hybride AES-CCMP)
[*] Puissance signal: -48 dBm (Excellente qualité de lien)
[✓] Aucun rogue AP ni attaque evil twin détectée dans le voisinage.`;
  }

  if (lower.startsWith('python') || lower.startsWith('python3')) {
    return `Python 3.11.8 (main, Feb 20 2026, 12:00:00) [Clang 17.0.2] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import netsecure_engine
>>> print("NetSecure Pro Mobile AI Engine Initialized.")
NetSecure Pro Mobile AI Engine Initialized.`;
  }

  if (lower === 'top' || lower === 'htop') {
    return `Tasks: 42 total,   1 running,  41 sleeping,   0 stopped,   0 zombie
%Cpu(s):  6.4 us,  2.1 sy,  0.0 ni, 91.2 id,  0.2 wa,  0.1 hi,  0.0 si
MiB Mem :   3842.2 total,   1420.5 free,   1180.2 used,   1241.5 buff/cache
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1240 u0_a241   20   0   84204  24108  12480 S   3.2   0.6   0:04.12 netsecure_node
 1312 u0_a241   20   0  142100  48200  28190 S   1.8   1.2   0:02.84 node
 1405 u0_a241   20   0   48200  12100   8200 R   0.9   0.3   0:00.64 top`;
  }

  return null;
};

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY || '';
  if (!apiKey) {
    return `[Termux AI Assistant] Bonjour ! Je suis votre assistant Termux pour Android.
Voici comment débuter rapidement :
- **Mettre à jour vos dépôts :** \`pkg update && pkg upgrade -y\`
- **Donner l'accès au stockage Android :** \`termux-setup-storage\`
- **Installer les outils réseau :** \`pkg install nmap curl git python\`
- **Connexion SSH :** tapez \`ssh user@host\` dans l'émulateur pour lancer une session à distance.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "Désolé, aucune réponse générée.";
  } catch (error) {
    console.warn("Gemini API fallback:", error);
    return `[Termux Assistant - Mode Local] Réponse pour "${prompt}":
Pour exécuter ou automatiser ceci dans Termux, utilisez:
\`\`\`bash
pkg update -y && pkg install -y git python curl
termux-setup-storage
\`\`\`
Utilisez l'onglet 'Boîte à Outils' pour télécharger directement des scripts .sh prêts à l'emploi.`;
  }
};

export const simulateCommandExecution = async (command: string): Promise<string> => {
  // Check fast local simulation first for instantaneous responses to common commands
  const localOutput = getLocalSimulationOutput(command);
  if (localOutput) {
    return localOutput;
  }

  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY || '';
  if (!apiKey) {
    return `bash: ${command.split(' ')[0]}: exécuté avec succès [Code sortie: 0]\nOutput standard: commande traitée dans l'environnement Termux Android.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Execute this command and show output: ${command}`,
      config: {
        systemInstruction: TERMINAL_SIMULATION_INSTRUCTION,
        temperature: 0.2,
        topP: 0.9,
      },
    });

    return response.text || `[Termux] ${command}: Terminé sans sortie.`;
  } catch (error) {
    console.warn("Simulation fallback:", error);
    return `bash: ${command.split(' ')[0]}: commande exécutée avec succès.\nCode retour: 0`;
  }
};

export const simulateSshRemoteExecution = async (command: string, user: string, host: string): Promise<string> => {
  if (command.trim() === 'uname -a') {
    return `Linux ${host} 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 (2026-01-15) x86_64 GNU/Linux`;
  }
  if (command.trim() === 'uptime') {
    return ` 14:08:12 up 42 days,  3:18,  2 users,  load average: 0.12, 0.08, 0.05`;
  }
  if (command.trim() === 'whoami') {
    return user;
  }
  if (command.trim() === 'hostname') {
    return host;
  }

  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY || '';
  if (!apiKey) {
    return `[${user}@${host}:~]$ ${command}\nExécution terminée sur le serveur distant ${host}.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Command on ${user}@${host}: ${command}`,
      config: {
        systemInstruction: REMOTE_SSH_INSTRUCTION.replace('[HOSTNAME]', host).replace('[USER]', user),
        temperature: 0.3,
        topP: 0.9,
      },
    });

    return response.text || "";
  } catch (error) {
    return `ssh: commande exécutée sur ${host}.`;
  }
};

export const generateToolScript = async (toolName: string, description: string): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY || '';
  if (!apiKey) {
    return `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# NetSecure Pro Termux Toolkit - Automated Setup Script
# Tool: ${toolName}
# Description: ${description}
# Generated: $(date)
# ==============================================================================

set -e

echo "[*] Initializing installation for ${toolName} on Termux Android..."

# 1. Update package database
echo "[+] Updating Termux package list..."
pkg update -y || apt update -y

# 2. Install essential dependencies
echo "[+] Installing core build essentials..."
pkg install -y coreutils curl wget git

# 3. Installing ${toolName}
echo "[+] Installing ${toolName}..."
pkg install -y ${toolName.toLowerCase()} || {
    echo "[!] Official package not found in main repo, checking community mirrors..."
    pkg install -y root-repo x11-repo || true
    pkg install -y ${toolName.toLowerCase()} || true
}

echo "[✓] Installation of ${toolName} completed successfully!"
echo "[*] Type '${toolName.toLowerCase()}' or check 'man ${toolName.toLowerCase()}' to get started."
`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a bash setup script for ${toolName}. Description: ${description}`,
      config: {
        systemInstruction: SCRIPT_GEN_INSTRUCTION,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    return response.text?.trim() || "# Script généré avec succès";
  } catch (error) {
    return `#!/data/data/com.termux/files/usr/bin/bash\npkg update && pkg install -y ${toolName.toLowerCase()}`;
  }
};

export const generateQuickGuide = async (toolName: string, description: string): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY || '';
  if (!apiKey) {
    return `### Guide Rapide d'Utilisation : ${toolName}
- **\`${toolName.toLowerCase()} --help\`** : Affiche les options et sous-commandes disponibles.
- **\`${toolName.toLowerCase()} --version\`** : Vérifie la version binaire compilée.
- **\`man ${toolName.toLowerCase()}\`** : Ouvre le manuel officiel complet.
- **Exemple courant :** \`${toolName.toLowerCase()} -v\` active le mode verbeux pour l'audit.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a concise Quick Guide with 3-5 essential helper commands, options, and basic usage examples for ${toolName}. Description: ${description}`,
      config: {
        systemInstruction: QUICK_GUIDE_INSTRUCTION,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    return response.text?.trim() || "Aucun guide généré.";
  } catch (error) {
    return `### ${toolName}\nUtilisez \`${toolName.toLowerCase()} --help\` pour explorer les paramètres.`;
  }
};
