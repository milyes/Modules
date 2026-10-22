
export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  SHELL_ASSISTANT = 'SHELL_ASSISTANT',
  TOOLKIT_LIBRARY = 'TOOLKIT_LIBRARY',
  SYSTEM_INFO = 'SYSTEM_INFO',
  SETTINGS = 'SETTINGS'
}

export interface CommandTemplate {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'System' | 'Network' | 'Programming' | 'Security' | 'Media';
}

export type MessageRole = 'user' | 'model';
export type MessageType = 'chat' | 'command';

export interface ChatMessage {
  role: MessageRole;
  type: MessageType;
  content: string;
  output?: string; // For commands: the simulated terminal output
  timestamp: Date;
}

export interface ResourceData {
  time: string;
  cpu: number;
  ram: number;
}
