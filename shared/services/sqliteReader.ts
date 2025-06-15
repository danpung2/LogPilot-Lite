import { db } from '../sqlite/db';
import { LogEntry } from '../types/log';

type LogRow = {
  channel: string;
  level: string;
  message: string;
  timestamp: number;
  meta?: string;
};

export function readLogsFromSQLite(since: number, channel: string, limit: number): LogEntry[] {
  const stmt = db.prepare(`
    SELECT * FROM logs
    WHERE timestamp > ? AND channel = ?
    ORDER BY timestamp ASC
    LIMIT ?
  `);

  const rows: LogRow[] = stmt.all(since, channel, limit) as LogRow[];

  return rows.map(row => ({
    channel: row.channel,
    level: row.level,
    message: row.message,
    timestamp: row.timestamp,
    meta: row.meta ? JSON.parse(row.meta) : {}
  }));
}
