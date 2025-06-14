# 📦 LogPilot-Lite Client

A lightweight TypeScript client for sending logs to a self-hosted LogPilot-Lite server using gRPC.

This package is intended to be bundled with your own source system and used to send structured logs to a remote LogPilot-Lite server.

---

## 🚀 Features

- gRPC-based communication
- Simple log interface: `send(entry)`
- Configurable server address
- Type-safe TypeScript implementation

---

## 📦 Installation

Since this package is not published to npm, install it directly from a GitHub private repository:

```
npm install git+https://<GITHUB_TOKEN>@github.com/danpung2/LogPilot-Lite-Client.git
```

> Make sure to replace `<GITHUB_TOKEN>` with your personal access token.

---

## 🛠 Usage

```ts
import { LogPilotClient } from "logpilot-lite-client";

const client = new LogPilotClient(process.env.LOGPILOT_SERVER_URL || "localhost:50051");

client.send({
  channel: 'job',
  level: 'ERROR',
  message: 'Token cleanup failed',
  meta: { error: 'Refresh token not found' },
  storage: 'sqlite'
});
```

---

## 📄 Log Entry Format

| Field    | Type                     | Required | Description                                                                 |
|----------|--------------------------|----------|-----------------------------------------------------------------------------|
| channel  | `string`                 | ✅ Yes   | The source or category of the log (e.g., "auth", "payment", "system")       |
| level    | `string`                 | ✅ Yes   | Log severity level ("DEBUG", "INFO", "WARN", "ERROR")                       |
| message  | `string`                 | ✅ Yes   | Human-readable log message                                                  |
| meta     | `Record<string, any>`    | ❌ No    | Optional metadata (user ID, IP address, etc.)                              |
| storage  | `"file"` or `"sqlite"`  | ❌ No    | Storage type. Defaults to `"file"` if omitted                               |

---

## 🧪 Example App

A working example is available here:

👉 [LogPilot-Lite-Client-Example](https://github.com/danpung2/LogPilot-Lite-Client-Example)

It simulates a periodic cleanup job that logs failures to LogPilot-Lite server.

---

## 🔒 Authenticated GitHub Installation Notes

If you're installing from a private GitHub repo, you need to use a GitHub token:

1. Create a `.env` file:
```
GITHUB_TOKEN=ghp_xxx...
```

2. Run install script:
```bash
node install-client.js
```

This will install the client using the correct credentials.

---
