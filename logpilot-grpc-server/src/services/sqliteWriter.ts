import { db } from '../sqlite/db';
import { LogEntry } from '../types/log';

export async function writeSQLite(entry: LogEntry): Promise<void> {
  const stmt = db.prepare(`
    INSERT INTO logs (channel, level, message, timestamp, meta)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    entry.channel,
    entry.level,
    entry.message,
    entry.timestamp,
    JSON.stringify(entry.meta ?? {})
  );
}
