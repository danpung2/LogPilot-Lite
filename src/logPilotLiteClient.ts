import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { LogEntry } from './types/log';

const PROTO_PATH = path.join(__dirname, '../proto/logpilot.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

export class LogPilotClient {
  private client: any;

  constructor(address: string) {
    this.client = new proto.logpilot.LogService(address, grpc.credentials.createInsecure());
  }

  send(entry: LogEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.SendLog(entry, (err: grpc.ServiceError | null, response: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}