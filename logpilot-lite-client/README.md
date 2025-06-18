# 📦 LogPilot-Lite Client

A lightweight TypeScript client for sending logs to a self-hosted LogPilot-Lite server using gRPC.

This package is intended to be bundled with your own source system and used to send structured logs to a remote LogPilot-Lite server.

---

## 🚀 Features

- gRPC-based communication
- Simple log interface: `produce(entry)` | `consume()`
- Configurable server address and channel

---

## 📦 Installation

Since this package is not published to npm, install it directly from a GitHub private repository:

```
npm install git+https://github.com/danpung2/LogPilot-Lite-Client.git
```

---

## 🛠 Usage

```ts
// producer.ts
import { LogPilotClient } from "logpilot-lite-client";

const client = new LogPilotClient(process.env.LOGPILOT_SERVER_URL || "localhost:50051");

await client.produce({
  channel: 'job',
  level: 'ERROR',
  message: 'Token cleanup failed',
  meta: { error: 'Refresh token not found' },
  storage: 'sqlite'
});

// consumer.ts
const logs = await consumer.consume();
if (logs && logs.length > 0) {
    logs.map((log) => console.log("🧭 Consumed log:", log));
}
```

---

## 📄 Log Entry Format

| Field     | Type                     | Required | Description |
|-----------|--------------------------|----------|-------------|
| `channel` | `string`                 | ✅ Yes   | The source or category of the log (e.g., `"auth"`, `"payment"`, `"system"`) |
| `level`   | `string`                 | ✅ Yes   | Log severity level. Common values: `"DEBUG"`, `"INFO"`, `"WARN"`, `"ERROR"` |
| `message` | `string`                 | ✅ Yes   | Human-readable log message |
| `meta`    | `object` (key-value map) | ❌ No    | Optional metadata for the log (e.g., user ID, IP address, etc.) |
| `storage` | `"file"` or `"sqlite"`   | ❌ No    | Determines how the log is stored. Defaults to `"file"` if omitted |

---

## 🧪 Example App

A working example is available here:

👉 [LogPilot-Lite-Client-Example](https://github.com/danpung2/LogPilot-Lite-Client-Example)

It simulates a periodic cleanup job that logs failures to LogPilot-Lite server.

---
