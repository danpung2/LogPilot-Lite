import { fetchLogsSince } from './grpcClient';
import { getOffset, setOffset } from './offsetStore';
import { LogEntry } from './../proto/logpilot';

export class LogPilotConsumer {
  constructor(
    private consumerId: string,
    private channel: string,
    private storage: string,
  ) {}

  async consume(): Promise<LogEntry[] | unknown> {
    const offset = Number(getOffset(this.consumerId)) || 0;

    let logs: LogEntry[];
    try {
      logs = await fetchLogsSince(offset, this.channel, this.storage);
    } catch (err) {
      console.error(`[${this.consumerId}] ❌ Failed to fetch logs:`, err);
      return err;
    }

    if (!logs.length) {
    //   console.log(`[${this.consumerId}] No new logs.`);
      return [];
    }

    const latest = logs[logs.length - 1].timestamp;
    if (latest !== undefined) {
      setOffset(this.consumerId, latest.toString());
      console.log(`✅ [${this.consumerId}] Updated offset to ${latest}`);
    }

    return logs;
  }
}
