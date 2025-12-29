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
    WHERE id > ? AND channel = ?
    ORDER BY id ASC
    LIMIT ?
  `);
  // Fetch logs via ID (Offset)
  // ID(오프셋)를 통한 로그 조회

  const rows: (LogRow & { id: number })[] = stmt.all(since, channel, limit) as (LogRow & { id: number })[];

  return rows.map(row => ({
    id: row.id,
    channel: row.channel,
    level: row.level,
    message: row.message,
    timestamp: row.timestamp,
    meta: row.meta ? JSON.parse(row.meta) : {}
  }));
}

export function listLogsFromSQLite(start: number, end: number, channel: string, level: string, limit: number = 100): LogEntry[] {
  let query = `SELECT * FROM logs WHERE timestamp >= ? AND timestamp <= ?`;
  const params: (number | string)[] = [start, end];

  // Basic Range Query
  // 기본 범위 쿼리

  if (channel) {
    query += ` AND channel = ?`;
    params.push(channel);
  }

  if (level) {
    query += ` AND level = ?`;
    params.push(level);
  }

  query += ` ORDER BY timestamp ASC LIMIT ?`;
  params.push(limit);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as (LogRow & { id: number })[];

  return rows.map(row => ({
    id: row.id,
    channel: row.channel,
    level: row.level,
    message: row.message,
    timestamp: row.timestamp,
    meta: row.meta ? JSON.parse(row.meta) : {}
  }));
}
