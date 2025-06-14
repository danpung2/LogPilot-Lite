import fs from 'fs/promises';
import path from 'path';
import { LogEntry } from '../types/log';

const baseDir =
  process.env.LOGPILOT_STORAGE_DIR || path.join(__dirname, '../../storage');
console.log(baseDir);
const logsDir = path.join(baseDir, 'logs');

export async function writeLogToFile(entry: LogEntry): Promise<void> {
  const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
  const fileName = `${entry.channel}_${dateStr}.log`;
  const filePath = path.join(logsDir, fileName);

  const logLine = JSON.stringify(entry) + '\n';
  await fs.mkdir(logsDir, { recursive: true });
  await fs.appendFile(filePath, logLine, 'utf-8');
}
