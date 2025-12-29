import { fetchLogs, seek } from './grpcClient';
import { LogEntry } from './../proto/logpilot';

export class LogPilotConsumer {
  constructor(
    private consumerId: string,
    private channel: string,
    private storage: string,
  ) { }

  async consume(): Promise<LogEntry[]> {
    try {
      const logs = await fetchLogs(this.channel, this.storage, this.consumerId);
      return logs as LogEntry[];
    } catch (err) {
      console.error(`[${this.consumerId}] ❌ Failed to fetch logs:`, err);
      throw err;
    }
  }

  async seekToBeginning(): Promise<number> {
    return seek(this.channel, this.consumerId, 'EARLIEST');
  }

  async seekToEnd(): Promise<number> {
    return seek(this.channel, this.consumerId, 'LATEST');
  }

  async seekToTimestamp(timestamp: number): Promise<number> {
    return seek(this.channel, this.consumerId, 'SPECIFIC', timestamp);
  }
}
