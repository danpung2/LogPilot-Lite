import fs from 'fs';
import path from 'path';
import { LogEntry } from '../types/log';

const LOGS_DIR = path.join(__dirname, '../../../../logs');

export function readLogsFromFile(since: number, channel: string, limit: number): LogEntry[] {
  const files = fs.readdirSync(LOGS_DIR)
    .filter(name => name.endsWith('.log'))
    .sort();

  const matched: LogEntry[] = [];

  for (const file of files) {
    const fullPath = path.join(LOGS_DIR, file);
    const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const log: LogEntry = JSON.parse(line);
        if (log.channel === channel && Number(log.timestamp) > since) {
          matched.push(log);
          if (matched.length >= limit) break;
        }
      } catch {
        continue;
      }
    }

    if (matched.length >= limit) break;
  }

  return matched;
}
