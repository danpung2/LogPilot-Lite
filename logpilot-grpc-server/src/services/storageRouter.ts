import { LogEntry } from '../types/log';
import { writeLog } from './fileWriter';
import { writeSQLite } from './sqliteWriter';

export async function writeEntry(entry: LogEntry): Promise<void> {
  const storage = entry.storage ?? 'log'; // default는 .log 방식

  if (storage === 'sqlite') {
    await writeSQLite(entry);
  } else {
    await writeLog(entry);
  }
}
