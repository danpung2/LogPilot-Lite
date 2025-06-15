import { LogServiceClient, LogRequest } from '../proto/logpilot';
import { credentials } from '@grpc/grpc-js';

const client = new LogServiceClient(
  process.env.LOGPILOT_SERVER_URL || 'localhost:50051',
  credentials.createInsecure()
);

export class LogPilotProducer {
  produce(entry: LogRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      client.sendLog(entry, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
