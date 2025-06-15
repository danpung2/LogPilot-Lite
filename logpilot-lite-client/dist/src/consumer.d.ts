export declare class LogPilotConsumer {
    private consumerId;
    private channel;
    constructor(consumerId: string, channel: string);
    consume(): Promise<void>;
}
