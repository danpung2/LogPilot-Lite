export declare class LogPilotConsumer {
    private consumerId;
    private channel;
    private storage;
    constructor(consumerId: string, channel: string, storage: string);
    consume(): Promise<void>;
}
