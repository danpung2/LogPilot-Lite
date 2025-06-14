import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/logpilot.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const logpilotProto = grpc.loadPackageDefinition(packageDefinition).logpilot as any;

const client = new logpilotProto.LogService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// 로그 엔트리 구성
const logEntry = {
  channel: 'auth',
  level: 'info',
  message: '사용자 로그인 성공',
  meta: {
    userId: 'user123',
    ip: '192.168.0.1'
  },
  storage: 'log' // 'sqlite' || 'log'
};

client.SendLog(logEntry, (err: grpc.ServiceError | null, response: any) => {
  if (err) {
    console.error('❌ SendLog failed:', err.message);
  } else {
    console.log('✅ SendLog response:', response);
  }
});
