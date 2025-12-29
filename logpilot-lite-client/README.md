# LogPilot-Lite Client 🔌

The official TypeScript client for **[LogPilot-Lite](../README.md)**.
Easily integrate your Node.js applications with the LogPilot-Lite gRPC server.

## 📦 Installation

Since this package is part of the LogPilot-Lite monorepo, you can install it directly from GitHub or local path.

```bash
# Install via GitHub
npm install git+https://github.com/danpung2/LogPilot-Lite.git#main

# Or if you are in the same repo
npm install ./logpilot-lite-client
```

> **Requirements:** Node.js **20+** is recommended.

## 🚀 Usage

### 1. Producer (Send Logs)
Send logs to the LogPilot-Lite server.

```typescript
import { LogPilotProducer } from "logpilot-lite-client";

// Connect to gRPC server (default: localhost:50051)
const producer = new LogPilotProducer("localhost:50051");

async function sendLog() {
  try {
    await producer.produce({
      channel: 'orders',
      level: 'INFO',
      message: 'Order #1234 created',
      meta: { userId: 'user-1' },
      meta: { userId: 'user-1' }
      // storage: 'sqlite' (Default)
    });
    console.log("Log sent successfully!");
  } catch (err) {
    console.error("Failed to send log:", err);
  }
}
```

### 2. Consumer (Read Logs)
Consume logs with built-in offset management.

```typescript
import { LogPilotConsumer } from "logpilot-lite-client";

const consumer = new LogPilotConsumer({
  serverAddress: "localhost:50051",
  channel: "orders",
  consumerId: "order-processor-service", // Unique ID for offset tracking
  storage: "sqlite"
});

async function processLogs() {
  // Fetch new logs starting from last committed offset
  const logs = await consumer.consume(10); // Fetch up to 10 logs

  if (logs.length > 0) {
    console.log(`Received ${logs.length} logs:`);
    logs.forEach(log => console.log(log.message));
  } else {
    console.log("No new logs.");
  }
}
```

## 🛠 API Reference

### `LogPilotProducer`
- `constructor(address: string)`
- `produce(entry: LogEntry): Promise<void>`

### `LogPilotConsumer`
- `constructor(config: ConsumerConfig)`
- `consume(limit?: number): Promise<LogEntry[]>`
  - Automatically commits the offset after fetching.

## 📄 License

MIT License.
