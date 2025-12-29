import { LogPilotConsumer, LogEntry } from "logpilot-lite-client";
import { setTimeout } from "timers/promises";

const CHANNEL = "test-channel";
const CONSUMER_ID = "demo-consumer-group-1";

const consumer = new LogPilotConsumer(CONSUMER_ID, CHANNEL, "sqlite");

console.log(`🚀 Starting Consumer Demo`);
console.log(`   Channel: ${CHANNEL}`);
console.log(`   Group  : ${CONSUMER_ID}`);

async function run() {
    console.log("⏩ Seeking to latest logs...");
    await consumer.seekToEnd();
    console.log("✅ Seek complete. Listening for new logs...");

    while (true) {
        try {
            const logs = await consumer.consume() as LogEntry[];

            if (logs && logs.length > 0) {
                console.log(`\n📦 Received ${logs.length} logs:`);
                for (const log of logs) {
                    console.log(`   [${log.id}] ${log.timestamp} - ${log.message}`);
                }
            } else {
            }

            await setTimeout(1000);
        } catch (err) {
            console.error("\n[Error] Consume failed:", err);
            await setTimeout(5000);
        }
    }
}

run();
