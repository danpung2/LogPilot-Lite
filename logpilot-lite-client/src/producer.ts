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

export class LogPilotProducer {
  private client: any;

  constructor(address: string) {
    // Connect to gRPC service
    // gRPC 서비스 연결
    this.client = new proto.logpilot.LogService(address, grpc.credentials.createInsecure());
  }

  produce(entry: LogEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      // LogRequest does not have timestamp/id in proto definition (assigned by server)
      // Proto 정의상 LogRequest에는 timestamp/id가 없습니다 (서버에서 할당됨)
      const req = {
        channel: entry.channel,
        level: entry.level,
        message: entry.message,
        meta: entry.meta || {},
        storage: entry.storage || 'sqlite'
      };

      this.client.SendLog(req, (err: grpc.ServiceError | null, response: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  produceBatch(entries: LogEntry[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const logRequests = entries.map(e => ({
        channel: e.channel,
        level: e.level,
        message: e.message,
        meta: e.meta || {},
        storage: e.storage || 'sqlite'
      }));

      this.client.SendLogs({ logRequests }, (err: grpc.ServiceError | null, response: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
