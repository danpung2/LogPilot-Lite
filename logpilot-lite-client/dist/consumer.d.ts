import { LogEntry } from './types/log';
export declare class LogPilotConsumer {
    private storageType;
    private baseDir;
    constructor(storageType: 'file' | 'sqlite', baseDir: string);
    listLogs(): Promise<string[]>;
    readLog(identifier: string): Promise<LogEntry[] | LogEntry | null>;
}
