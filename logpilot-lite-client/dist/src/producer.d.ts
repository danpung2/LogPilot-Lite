import { LogEntry } from './types/log';
export declare class LogPilotProducer {
    private client;
    constructor(address: string);
    produce(entry: LogEntry): Promise<void>;
}
