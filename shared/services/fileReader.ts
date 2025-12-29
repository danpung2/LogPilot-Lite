import fs from 'fs';
import path from 'path';
import { LogEntry } from '../types/log';

const baseDir = process.env.LOGPILOT_STORAGE_DIR || path.join(__dirname, '../../storage');
const LOGS_DIR = path.join(baseDir, "logs");

export function readLogsFromFile(since: number, channel: string, limit: number): LogEntry[] {
  if (!fs.existsSync(LOGS_DIR)) return [];

  const files = fs.readdirSync(LOGS_DIR)
    .filter(name => name.endsWith('.log'))
    .sort();

  // Scan files for logs > ID
  // ID보다 큰 로그 파일 스캔

  const matched: LogEntry[] = [];

  for (const file of files) {
    const fullPath = path.join(LOGS_DIR, file);
    const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const log: LogEntry = JSON.parse(line);
        if (!log.id) log.id = log.timestamp * 1000;

        if (log.channel === channel && Number(log.id) > since) {
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

export function listLogsFromFile(start: number, end: number, channel: string, level: string, limit: number = 100): LogEntry[] {
  if (!fs.existsSync(LOGS_DIR)) return [];

  const files = fs.readdirSync(LOGS_DIR)
    .filter(name => name.endsWith('.log'))
    .sort();

  const matched: LogEntry[] = [];

  // NOTE: We could filter files by date in filename, but for "Lite" simple scan is okay for now.
  // NOTE: 파일명의 날짜로 필터링할 수 있지만, "Lite" 버전에서는 현재 단순 스캔으로 충분합니다.
  for (const file of files) {
    const fullPath = path.join(LOGS_DIR, file);
    const lines = fs.readFileSync(fullPath, 'utf-8').split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const log: LogEntry = JSON.parse(line);
        if (!log.id) log.id = log.timestamp * 1000;

        if (log.timestamp >= start && log.timestamp <= end) {
          if (channel && log.channel !== channel) continue;
          if (level && log.level !== level) continue;

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
