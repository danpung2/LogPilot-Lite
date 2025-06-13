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

const proto = grpc.loadPackageDefinition(packageDefinition).logpilot as any;

const client = new proto.LogService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const log = {
  channel: 'test',
  level: 'info',
  message: 'This is a test log from client',
  meta: { clientId: 'test-client' },
};

client.SendLog(log, (err: any, response: any) => {
  if (err) {
    console.error('❌ SendLog failed:', err);
  } else {
    console.log('✅ SendLog response:', response);
  }
});
