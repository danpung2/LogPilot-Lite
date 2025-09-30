import { Router, Request, Response } from 'express';
import { writeLogToFile } from '@shared/services/fileWriter';
import { writeLogToSQLite } from '@shared/services/sqliteWriter';
import { LogEntry } from '@shared/types/log';
import { validateBody } from '@shared/middleware/validation';
import { LogEntrySchema } from '@shared/schemas';

const router = Router();

router.post('/', validateBody(LogEntrySchema), async (req: Request, res: Response) => {
  try {
    const clientEntry = req.body;

    const logEntry = {
      ...clientEntry,
      timestamp: Date.now(),
    }  as LogEntry;

    console.log('[RECV]', logEntry);

    await writeEntry(logEntry);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Write error:', err);
    res.status(500).json({ error: 'Write failed' });
  }
});

async function writeEntry(entry: LogEntry & { timestamp: number }): Promise<void> {
  const type = entry.storage || 'file';
  return type === 'sqlite' ? writeLogToSQLite(entry) : writeLogToFile(entry);
}

export default router;
