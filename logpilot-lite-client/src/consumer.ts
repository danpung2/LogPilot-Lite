import { fetchLogs, seek } from './grpcClient';
import { LogEntry } from './../proto/logpilot';

export class LogPilotConsumer {
  constructor(
    private consumerId: string,
    private channel: string,
    private storage: string,
  ) {}

  async consume(): Promise<LogEntry[] | unknown> {
    try {
      const logs = await fetchLogs(this.channel, this.storage, this.consumerId);
      return logs;
    } catch (err) {
      console.error(`[${this.consumerId}] ❌ Failed to fetch logs:`, err);
      return err;
    }
  }

  async seekToBeginning(): Promise<number> {
    return seek(this.channel, this.consumerId, 'BEGINNING');
  }

  async seekToEnd(): Promise<number> {
    return seek(this.channel, this.consumerId, 'END');
  }

  async seekToTimestamp(timestamp: number): Promise<number> {
    return seek(this.channel, this.consumerId, 'TIMESTAMP', timestamp.toString());
  }
}
