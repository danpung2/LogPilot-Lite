# LogPilot-Lite Client 🔌

**[LogPilot-Lite](../README.ko.md)**를 위한 공식 TypeScript 클라이언트입니다.
Node.js 애플리케이션을 LogPilot-Lite gRPC 서버와 쉽게 연동할 수 있도록 도와줍니다.

## 📦 설치 (Installation)

npm을 통해 패키지를 직접 설치할 수 있습니다:

```bash
npm install logpilot-lite-client
```

> **필수 조건:** Node.js **20 버전 이상**을 권장합니다.

## 🚀 사용법 (Usage)

### 1. 프로듀서 (로그 전송)
LogPilot-Lite 서버로 로그를 전송합니다.

```typescript
import { LogPilotProducer } from "logpilot-lite-client";

// gRPC 서버 연결 (기본값: localhost:50051)
const producer = new LogPilotProducer("localhost:50051");

async function sendLog() {
  try {
    await producer.produce({
      channel: 'orders',
      level: 'INFO',
      message: 'Order #1234 created',
      meta: { userId: 'user-1' },
      meta: { userId: 'user-1' }
      // storage: 'sqlite' (기본값)
    });
    console.log("로그 전송 성공!");
  } catch (err) {
    console.error("로그 전송 실패:", err);
  }
}
```

### 2. 컨슈머 (로그 읽기)
오프셋 관리 기능이 내장된 컨슈머를 사용하여 로그를 읽습니다.

```typescript
import { LogPilotConsumer } from "logpilot-lite-client";

const consumer = new LogPilotConsumer({
  serverAddress: "localhost:50051",
  channel: "orders",
  consumerId: "order-processor-service", // 오프셋 추적을 위한 고유 ID
  storage: "sqlite"
});

async function processLogs() {
  // 마지막 커밋된 오프셋 이후의 새로운 로그를 가져옵니다
  const logs = await consumer.consume(10); // 최대 10개 로그 가져오기

  if (logs.length > 0) {
    console.log(`${logs.length}개의 로그 수신:`);
    logs.forEach(log => console.log(log.message));
  } else {
    console.log("새로운 로그가 없습니다.");
  }
}
```

## 🛠 API 레퍼런스

### `LogPilotProducer`
- `constructor(address: string)`
- `produce(entry: LogEntry): Promise<void>`

### `LogPilotConsumer`
- `constructor(config: ConsumerConfig)`
- `consume(limit?: number): Promise<LogEntry[]>`
  - 로그 조회 후 오프셋을 자동으로 커밋합니다.

## 📄 라이선스 (License)

MIT License.
