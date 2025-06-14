# LogPilot-Lite

🚀 **LogPilot-Lite**는 **가볍고 단독 실행 가능한 로그 수집 시스템**입니다.

로그 수집 및 분석이 필요한 개인 개발자 또는 소규모 시스템을 위한 대안으로 설계되었습니다.

---

## ✨ Feature

- ✅ Rest API 버전과 gRPC 버전 제공
- ✅ file(.log) 저장과 sqlite 저장 제공
- 🚧 Docker로 쉽게 실행 가능한 서버 예정
- 🚧 클라이언트는 TypeScript SDK를 통해 간단하게 로그 전송 예정
- 🚧 Webhook 소비자, 파일 리텐션, 검색 API 등은 확장 예정

---

## Run With Docker
```
# REST Version
docker run -p 8080:8080 \
  -e LOGPILOT_MODE=rest \
  -e LOGPILOT_STORAGE_DIR=/data \
  -v $(pwd)/data:/data \
  logpilot-lite:0.0.2
```
```
# gRPC Version
docker run -p 50051:50051 \
  -e LOGPILOT_MODE=grpc \
  -e LOGPILOT_STORAGE_DIR=/data \
  -v $(pwd)/data:/data \
  logpilot-lite:0.0.2
```

## 📄 Log Entry Format

When sending logs to **LogPilot-Lite**, use the following JSON structure:

```json
{
  "channel": "auth",
  "level": "INFO",
  "message": "User logged in",
  "meta": {
    "userId": "abc123",
    "ip": "192.168.0.1"
  },
  "storage": "sqlite"
}
```
### Field Details

| Field     | Type                     | Required | Description |
|-----------|--------------------------|----------|-------------|
| `channel` | `string`                 | ✅ Yes   | The source or category of the log (e.g., `"auth"`, `"payment"`, `"system"`) |
| `level`   | `string`                 | ✅ Yes   | Log severity level. Common values: `"DEBUG"`, `"INFO"`, `"WARN"`, `"ERROR"` |
| `message` | `string`                 | ✅ Yes   | Human-readable log message |
| `meta`    | `object` (key-value map) | ❌ No    | Optional metadata for the log (e.g., user ID, IP address, etc.) |
| `storage` | `"file"` or `"sqlite"`   | ❌ No    | Determines how the log is stored. Defaults to `"file"` if omitted |


## Send Log Example
### REST Version 
```
POST /logs
Content-Type: application/json
```

```
// curl

curl -X POST http://localhost:8080/logs \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "auth",
    "level": "INFO",
    "message": "User logged in",
    "meta": {
      "userId": "abc123",
      "ip": "192.168.0.1"
    },
    "storage": "file"
  }'
```

### gRPC Version
```
// example-client.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, 'proto', 'logpilot.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDef) as any;

const client = new proto.logpilot.LogService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.SendLog(
  {
    channel: 'auth',
    level: 'INFO',
    message: 'User logged in',
    meta: { userId: 'abc123', ip: '192.168.0.1' },
    storage: 'sqlite'
  },
  (err: any, response: any) => {
    if (err) console.error('❌ SendLog failed:', err.message);
    else console.log('✅ SendLog response:', response);
  }
);

```

## LICENSE

🚫 This project is not open source.

All rights reserved © 2025 danpung2.

You may view the source code for personal or educational reference only.
You may NOT copy, modify, distribute, or use this software commercially without written permission.

See LICENSE for full terms.