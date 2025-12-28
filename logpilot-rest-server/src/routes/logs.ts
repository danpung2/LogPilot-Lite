import { Router, Request, Response } from 'express';
import { writeLogToFile } from '@shared/services/fileWriter';
import { writeLogToSQLite } from '@shared/services/sqliteWriter';
import { readLogsFromSQLite } from '@shared/services/sqliteReader';
import { readLogsFromFile } from '@shared/services/fileReader';
import { getOffset, setOffset, getLatestLogTimestamp } from '@shared/services/offsetService';
import { LogEntry } from '@shared/types/log';
import { validateBody, validateQuery } from '@shared/middleware/validation';
import { LogEntrySchema, FetchLogsRequestSchema, SeekRequestSchema } from '@shared/schemas';

const router = Router();

router.post('/', validateBody(LogEntrySchema) as any, async (req: Request, res: Response) => {
  try {
    const clientEntry = req.body;

    const logEntry = {
      ...clientEntry,
      timestamp: Date.now(),
    } as LogEntry;

    console.log('[RECV]', logEntry);

    await writeEntry(logEntry);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Write error:', err);
    res.status(500).json({ error: 'Write failed' });
  }
});

router.get('/', validateQuery(FetchLogsRequestSchema) as any, async (req: Request, res: Response) => {
  try {
    const { since, channel, limit = 100, storage, consumerId } = req.query as any; // Type assertion due to Express query generic

    let sinceTime = Number(since);

    // 1. Offset Resolution
    if (isNaN(sinceTime) || sinceTime === 0) {
      if (consumerId) {
        sinceTime = getOffset(consumerId, channel);
      } else {
        sinceTime = 0;
      }
    }

    const type = storage || 'file';
    const readFn = type === 'sqlite' ? readLogsFromSQLite : readLogsFromFile;

    const logs = readFn(sinceTime, channel, Number(limit));

    // 2. Auto Commit
    if (consumerId && logs.length > 0) {
      const last = logs[logs.length - 1];
      setOffset(consumerId, channel, last.timestamp);
    }

    res.json({ logs });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

router.post('/seek', validateBody(SeekRequestSchema) as any, async (req: Request, res: Response) => {
  try {
    const { channel, consumerId, type, value } = req.body;
    let newOffset = 0;

    if (type === 'BEGINNING') {
      newOffset = 0;
    } else if (type === 'END') {
      newOffset = getLatestLogTimestamp(channel);
    } else if (type === 'TIMESTAMP') {
      newOffset = Number(value);
    }

    setOffset(consumerId, channel, newOffset);
    
    res.json({ status: 'ok', newOffset });
  } catch (err) {
    console.error('Seek error:', err);
    res.status(500).json({ error: 'Seek failed' });
  }
});


async function writeEntry(entry: LogEntry & { timestamp: number }): Promise<void> {
  const type = entry.storage || 'file';
  return type === 'sqlite' ? writeLogToSQLite(entry) : writeLogToFile(entry);
}

export default router;
