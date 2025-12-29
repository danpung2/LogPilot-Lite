import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {
  FetchLogsRequest,
  FetchLogsResponse,
  SeekRequest,
  SeekResponse,
  LogEntry
} from '../proto/logpilot';

const PROTO_PATH = path.join(__dirname, '../proto/logpilot.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const DEFAULT_ADDR = process.env.LOGPILOT_SERVER_URL || 'localhost:50051';
const client = new protoDescriptor.logpilot.LogService(DEFAULT_ADDR, grpc.credentials.createInsecure());

export function fetchLogs(channel: string, storage: string, consumerId?: string): Promise<LogEntry[]> {
  return new Promise((resolve, reject) => {
    const req: any = {
      channel,
      storage,
      since: '0',
      limit: 100
    };

    const metadata = new grpc.Metadata();
    if (consumerId) {
      metadata.add('consumer-id', consumerId);
    }

    client.FetchLogs(req, metadata, (err: any, response: FetchLogsResponse) => {
      if (err) return reject(err);
      resolve(response.logs || []);
    });
  });
}

export function seek(channel: string, consumerId: string, operation: 'EARLIEST' | 'LATEST' | 'SPECIFIC', logId?: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const req: any = {
      channel,
      consumerId,
      operation,
      logId: logId || 0,
      storage: 'file'
    };

    client.Seek(req, (err: any, response: SeekResponse) => {
      if (err) return reject(err);
      resolve(0);
    });
  });
}
