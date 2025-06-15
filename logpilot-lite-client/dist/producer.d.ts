import { LogEntry } from './types/log';
export declare class LogPilotProducer {
    private client;
    constructor(address: string);
    send(entry: LogEntry): Promise<void>;
}
