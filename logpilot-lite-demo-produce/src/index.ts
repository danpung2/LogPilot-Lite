import { LogPilotProducer, LogEntry } from "logpilot-lite-client";

const producer = new LogPilotProducer("localhost:50051");
const CHANNEL = "test-channel";

console.log(`🚀 Starting Producer Demo on channel: ${CHANNEL}`);

let count = 0;

setInterval(async () => {
    count++;
    const message = `Demo Log Message #${count} - ${new Date().toISOString()}`;

    const entry: LogEntry = {
        channel: CHANNEL,
        level: "INFO",
        message: message,
        meta: { source: "demo-producer", seq: String(count) },
        storage: "sqlite",
        timestamp: Date.now()
    };

    try {
        await producer.produce(entry);
        console.log(`[Sent] #${count}: ${message}`);
    } catch (err) {
        console.error(`[Error] Failed to send log:`, err);
    }
}, 1000);
