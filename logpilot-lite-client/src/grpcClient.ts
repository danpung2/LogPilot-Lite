import { LogServiceClient, LogEntry, FetchLogsRequest, FetchLogsResponse, SeekRequest, SeekResponse } from './../proto/logpilot';
import { credentials, ServiceError } from '@grpc/grpc-js';

const client = new LogServiceClient(
  process.env.LOGPILOT_SERVER_URL || 'localhost:50051',
  credentials.createInsecure()
);

export async function fetchLogs(
  channel: string,
  storage: string,
  consumerId: string,
  since: number = 0,
  limit: number = 100
): Promise<LogEntry[]> {
  const request: FetchLogsRequest = {
    since: since.toString(),
    channel,
    limit,
    storage,
    consumerId
  };

  return new Promise((resolve, reject) => {
    client.fetchLogs(request, (err, response: FetchLogsResponse) => {
      if (err) return reject(err);
      if (!response.logs) return resolve([]);
      resolve(response.logs);
    });
  });
}

export async function seek(
  channel: string,
  consumerId: string,
  type: 'BEGINNING' | 'END' | 'TIMESTAMP',
  value: string = ''
): Promise<number> {
  const request: SeekRequest = {
    channel,
    consumerId,
    type,
    value
  };

  return new Promise((resolve, reject) => {
    client.seek(request, (err: ServiceError | null, response: SeekResponse) => {
      if (err) return reject(err);
      resolve(response.newOffset);
    });
  });
}
