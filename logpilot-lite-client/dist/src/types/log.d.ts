export interface LogEntry {
    channel: string;
    level: string;
    message: string;
    meta?: Record<string, any>;
    storage?: 'file' | 'sqlite';
    timestamp?: number;
}
