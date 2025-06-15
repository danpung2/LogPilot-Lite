import { LogRequest } from '../proto/logpilot';
export declare class LogPilotProducer {
    produce(entry: LogRequest): Promise<void>;
}
