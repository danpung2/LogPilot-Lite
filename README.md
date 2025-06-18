# LogPilot-Lite

🚀 **LogPilot-Lite**는 **가볍고 단독 실행 가능한 로그 수집 시스템**입니다.

로그 수집 및 분석이 필요한 개인 개발자 또는 소규모 시스템을 위한 대안으로 설계되었습니다.

---

## ✨ Features

- ✅ Rest API 버전과 gRPC 버전 제공
- ✅ file(.log) 저장과 sqlite 저장 제공
- ✅ Docker로 쉽게 실행 가능한 서버
- ✅ npm install을 통한 클라이언트 연결 및 로그 읽기/쓰기
- ✅ 로그 읽기 consumer id를 통한 오프셋 (이어서 읽기)
- 🚧 Webhook, 로그 리텐션, 검색 API 등 확장 예정

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
## Example

### REST Version
For the REST version, please use your preferred HTTP client library (e.g., Axios, Fetch, etc.) to send logs.

### gRPC Version
The gRPC version is provided as an official client library.  
You can refer to the example app here: [LogPilot-Lite Client Example](https://github.com/danpung2/LogPilot-Lite-Client-Example)


## LICENSE

MIT License

Copyright (c) 2025 @danpung2

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
