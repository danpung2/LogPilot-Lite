import { fetchLogsSince } from './grpcClient';
import { getOffset, setOffset } from './offsetStore';
import { LogEntry } from '../proto/logpilot';

export class LogPilotConsumer {
  constructor(
    private consumerId: string,
    private channel: string
  ) {}

  async consume(): Promise<void> {
    const offset = Number(getOffset(this.consumerId)) || 0;

    let logs: LogEntry[];
    try {
      logs = await fetchLogsSince(offset, this.channel);
    } catch (err) {
      console.error(`[${this.consumerId}] ❌ Failed to fetch logs:`, err);
      return;
    }

    if (!logs.length) {
      console.log(`[${this.consumerId}] No new logs.`);
      return;
    }

    for (const log of logs) {
      const time = new Date(Number(log.timestamp)).toISOString();
      console.log(`[${this.consumerId}] ${time} ${log.level} [${log.channel}] - ${log.message}`);
    }

    const latest = logs[logs.length - 1].timestamp;
    if (latest !== undefined) {
      setOffset(this.consumerId, latest.toString());
      console.log(`✅ [${this.consumerId}] Updated offset to ${latest}`);
    }
  }
}
