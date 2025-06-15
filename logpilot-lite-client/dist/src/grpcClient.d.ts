import { LogEntry } from '../proto/logpilot';
export declare function fetchLogsSince(since: number, channel: string, limit?: number): Promise<LogEntry[]>;
