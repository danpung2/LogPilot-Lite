import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { writeLog } from './services/logWriter';

const PROTO_PATH = path.join(__dirname, '../proto/logpilot.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const logpilotProto = grpc.loadPackageDefinition(packageDefinition).logpilot as any;

function sendLog(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
) {
  const clientEntry = call.request;

  const entry = {
    ...clientEntry,
    timestamp: Date.now(),
  };

  console.log('[RECV]', entry);

  writeLog(entry).then(() => {
    callback(null, { status: 'ok' });
  }).catch((err) => {
    console.error('Write error:', err);
    callback({ code: grpc.status.INTERNAL, message: 'Write failed' }, null);
  })
}

const PORT = process.env.PORT || 50051;

export function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(logpilotProto.LogService.service, { SendLog: sendLog });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🚀 LogPilot Rest Server listening on port ${PORT}`);
  })
}
