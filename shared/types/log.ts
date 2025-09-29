export interface LogEntry {
  channel: string;
  level: string;
  message: string;
  meta?: Record<string, string>;
  storage?: 'file' | 'sqlite';
  timestamp: number;
}

export * from '../schemas';
