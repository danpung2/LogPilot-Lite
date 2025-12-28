import { db } from '../sqlite/db';

export function getOffset(consumerId: string, channel: string): number {
  const stmt = db.prepare(`
    SELECT last_timestamp FROM consumer_offsets
    WHERE consumer_id = ? AND channel = ?
  `);
  const row = stmt.get(consumerId, channel) as { last_timestamp: number } | undefined;
  return row ? row.last_timestamp : 0;
}

export function setOffset(consumerId: string, channel: string, timestamp: number): void {
  const stmt = db.prepare(`
    INSERT INTO consumer_offsets (consumer_id, channel, last_timestamp)
    VALUES (?, ?, ?)
    ON CONFLICT(consumer_id, channel) DO UPDATE SET last_timestamp = excluded.last_timestamp
  `);
  stmt.run(consumerId, channel, timestamp);
}

export function getLatestLogTimestamp(channel: string): number {
  const stmt = db.prepare(`
    SELECT timestamp FROM logs
    WHERE channel = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `);
  const row = stmt.get(channel) as { timestamp: number } | undefined;
  return row ? row.timestamp : 0;
}
