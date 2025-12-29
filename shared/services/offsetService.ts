import { db } from '../sqlite/db';

export function getOffset(consumerId: string, channel: string): number {
  const stmt = db.prepare(`
    SELECT last_log_id FROM consumer_offsets
    WHERE consumer_id = ? AND channel = ?
  `);
  const row = stmt.get(consumerId, channel) as { last_log_id: number } | undefined;
  return row ? row.last_log_id : 0;
}

export function setOffset(consumerId: string, channel: string, logId: number): void {
  const stmt = db.prepare(`
    INSERT INTO consumer_offsets (consumer_id, channel, last_log_id)
    VALUES (?, ?, ?)
    ON CONFLICT(consumer_id, channel) DO UPDATE SET last_log_id = excluded.last_log_id
  `);
  stmt.run(consumerId, channel, logId);
}

export function getLatestLogId(channel: string): number {
  const stmt = db.prepare(`
    SELECT id FROM logs
    WHERE channel = ?
    ORDER BY id DESC
    LIMIT 1
  `);
  const row = stmt.get(channel) as { id: number } | undefined;
  return row ? row.id : 0;
}
