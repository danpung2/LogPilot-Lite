import { LogPilotConsumer } from './src/consumer';
import { LogPilotProducer } from './src/producer';
import { LogEntry } from './src/types/log';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const consumerId = "verify-consumer-" + Date.now();
  const channel = "verify-channel";
  const address = "localhost:50051"; 
  
  process.env.LOGPILOT_SERVER_URL = address;

  const producer = new LogPilotProducer(address);
  const consumer = new LogPilotConsumer(consumerId, channel, "sqlite");
  
  console.log(`Consumer ID: ${consumerId}`);

  console.log("--- 1. Sending Log 1 ---");
  await producer.produce({
      channel,
      level: 'info',
      message: 'Log 1',
      storage: 'sqlite',
      timestamp: Date.now()
  });
  await sleep(100);

  console.log("--- 2. Consuming (Expect 1 log) ---");
  let logs: any = await consumer.consume();
  console.log("Logs count:", Array.isArray(logs) ? logs.length : logs);
  if (Array.isArray(logs) && logs.length !== 1) console.error("FAILED STEP 2: Expected 1 log");
  
  console.log("--- 3. Consuming Again (Expect 0 logs) ---");
  logs = await consumer.consume();
  console.log("Logs count:", Array.isArray(logs) ? logs.length : logs);
  if (Array.isArray(logs) && logs.length !== 0) console.error("FAILED STEP 3: Expected 0 logs");
  
  console.log("--- 4. Sending Log 2 ---");
  await producer.produce({
      channel,
      level: 'info',
      message: 'Log 2',
      storage: 'sqlite',
      timestamp: Date.now()
  });
   await sleep(100);

  console.log("--- 5. Consuming (Expect 1 log) ---");
  logs = await consumer.consume();
  console.log("Logs count:", Array.isArray(logs) ? logs.length : logs);
  if (Array.isArray(logs) && logs.length !== 1) console.error("FAILED STEP 5: Expected 1 log");
  if (Array.isArray(logs) && logs.length > 0 && logs[0].message !== 'Log 2') console.error("FAILED LOG CONTENT: Expected Log 2");
  
  console.log("--- 6. Seek to Beginning ---");
  await consumer.seekToBeginning();
  
  console.log("--- 7. Consuming (Expect 2 logs) ---");
  logs = await consumer.consume();
  console.log("Logs count:", Array.isArray(logs) ? logs.length : logs);
  if (Array.isArray(logs) && logs.length !== 2) console.error("FAILED STEP 7: Expected 2 logs");
  
  console.log("--- VERIFICATION DONE ---");
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
