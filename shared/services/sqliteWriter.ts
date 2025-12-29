import { db } from '../sqlite/db';
import { LogEntry } from '../types/log';

export async function writeLogToSQLite(entry: LogEntry): Promise<void> {
  const stmt = db.prepare(`
    INSERT INTO logs (channel, level, message, meta, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(entry.channel, entry.level, entry.message, JSON.stringify(entry.meta || {}), entry.timestamp);
}

export async function writeLogsToSQLite(entries: LogEntry[]): Promise<void> {
  const insert = db.prepare(`
    INSERT INTO logs (channel, level, message, meta, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((logs: LogEntry[]) => {
    for (const entry of logs) {
      insert.run(entry.channel, entry.level, entry.message, JSON.stringify(entry.meta || {}), entry.timestamp);
    }
  });

  transaction(entries);
}
