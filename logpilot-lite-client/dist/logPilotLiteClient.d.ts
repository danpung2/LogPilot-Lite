import { LogEntry } from './types/log';
export declare class LogPilotClient {
    private client;
    constructor(address: string);
    send(entry: LogEntry): Promise<void>;
}
