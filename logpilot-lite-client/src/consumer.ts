import fs from 'fs/promises';
import path from 'path';
import { logDb } from './sqlite/db';
import { LogEntry } from './types/log';

export class LogPilotConsumer {
  constructor(
    private storageType: 'file' | 'sqlite',
    private baseDir: string
  ) {}

  async listLogs(): Promise<string[]> {
    if (this.storageType === 'file') {
      const logsPath = path.join(this.baseDir, 'logs');
      const files = await fs.readdir(logsPath);
      return files.filter(file => file.endsWith('.log'));
    } else if (this.storageType === 'sqlite') {
      const rows = logDb.prepare('SELECT id, channel, timestamp FROM logs ORDER BY timestamp DESC').all();
      return rows.map((row: any) => `[${row.id}] ${row.channel} @ ${new Date(row.timestamp).toISOString()}`);
    } else {
      throw new Error('Unsupported storage type');
    }
  }

  async readLog(identifier: string): Promise<LogEntry[] | LogEntry | null> {
    if (this.storageType === 'file') {
      const filePath = path.join(this.baseDir, 'logs', identifier);
      const content = await fs.readFile(filePath, 'utf-8');
      return content
        .trim()
        .split('\n')
        .map(line => JSON.parse(line));
    } else if (this.storageType === 'sqlite') {
      const row = logDb.prepare('SELECT * FROM logs WHERE id = ?').get(identifier);
      if (!row) return null;

      return {
        channel: row.channel,
        level: row.level,
        message: row.message,
        timestamp: row.timestamp,
        meta: row.meta ? JSON.parse(row.meta) : undefined,
      };
    } else {
      throw new Error('Unsupported storage type');
    }
  }
}
