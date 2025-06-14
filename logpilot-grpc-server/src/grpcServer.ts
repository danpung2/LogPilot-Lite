import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

import { writeLogToFile } from '@shared/services/fileWriter';
import { writeLogToSQLite } from '@shared/services/sqliteWriter';
import { LogEntry } from '@shared/types/log';

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
): void {
  const clientEntry = call.request;

  const logEntry = {
    ...clientEntry,
    timestamp: Date.now(),
  }  as LogEntry;

  console.log('[RECV]', logEntry);

  writeEntry(logEntry)
    .then(() => callback(null, { status: 'ok' }))
    .catch((err) => {
      console.error('Write error:', err);
      callback({ code: grpc.status.INTERNAL, message: 'Write failed' }, null);
    });
}

function writeEntry(entry: LogEntry & { timestamp: number }): Promise<void> {
  const type = entry.storage || 'file';
  return type === 'sqlite' ? writeLogToSQLite(entry) : writeLogToFile(entry);
}

const PORT = process.env.GRPC_PORT || 50051;

export function startGrpcServer(): void {
  const server = new grpc.Server();
  server.addService(logpilotProto.LogService.service, { SendLog: sendLog });
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🚀 LogPilot gRPC Server listening on port ${PORT}`);
  });
}
