import { Router, Request, Response } from 'express';
import { writeLogToFile, writeLogsToFile } from '@shared/services/fileWriter';
import { writeLogToSQLite, writeLogsToSQLite } from '@shared/services/sqliteWriter';
import { readLogsFromSQLite } from '@shared/services/sqliteReader';
import { readLogsFromFile } from '@shared/services/fileReader';
import { getOffset, setOffset, getLatestLogId } from '@shared/services/offsetService';
import { LogEntry } from '@shared/types/log';
import { validateBody, validateQuery } from '@shared/middleware/validation';
import { LogEntrySchema, FetchLogsRequestSchema, SeekRequestSchema, SendLogsRequestSchema, CommitRequestSchema } from '@shared/schemas';

const router: Router = Router();

// POST /api/logs - Send single log
// POST /api/logs - 단일 로그 전송
router.post('/', validateBody(LogEntrySchema) as any, async (req: Request, res: Response) => {
  try {
    const clientEntry = req.body;
    const logEntry = { ...clientEntry, timestamp: Date.now() } as LogEntry;
    await writeEntry(logEntry);
    res.status(200).json({ status: 'ok', message: 'Log stored' });
  } catch (err) {
    console.error('Write error:', err);
    res.status(500).json({ error: 'Write failed' });
  }
});

// POST /api/logs/batch - Send batch logs
// POST /api/logs/batch - 로그 일괄 전송 (배치)
router.post('/batch', validateBody(SendLogsRequestSchema) as any, async (req: Request, res: Response) => {
  try {
    const { log_requests } = req.body;
    const now = Date.now();
    const entries = log_requests.map((r: any) => ({ ...r, timestamp: now })) as LogEntry[];

    const type = entries[0]?.storage || 'sqlite';
    if (type === 'sqlite') {
      await writeLogsToSQLite(entries);
    } else {
      await writeLogsToFile(entries);
    }

    res.status(200).json({ status: 'ok', message: `${entries.length} logs stored` });
  } catch (err) {
    console.error('Batch write error:', err);
    res.status(500).json({ error: 'Batch write failed' });
  }
});

// GET /api/logs?channel=... - Fetch logs
// GET /api/logs?channel=... - 로그 조회
router.get('/', validateQuery(FetchLogsRequestSchema) as any, async (req: Request, res: Response) => {
  try {
    const { since, channel, limit = 100, storage, consumerId } = req.query as any;

    let sinceId = Number(since);

    // 1. Offset Resolution
    // 1. 오프셋 해결 (Offset Resolution)
    if (isNaN(sinceId) || sinceId === 0) {
      if (consumerId) {
        sinceId = getOffset(consumerId, channel);
      } else {
        sinceId = 0;
      }
    }

    const type = storage || 'sqlite';
    const readFn = type === 'sqlite' ? readLogsFromSQLite : readLogsFromFile;
    const logs = readFn(sinceId, channel, Number(limit));

    // 2. Auto Commit (if consumerId present)
    // 2. 자동 커밋 (consumerId가 존재하는 경우)
    if (consumerId && logs.length > 0) {
      const last = logs[logs.length - 1];
      // For SQLite, use id. For File, use timestamp as emulated ID.
      // SQLite의 경우 id 사용. 파일의 경우 timestamp를 에뮬레이트된 ID로 사용.
      const commitId = last.id || last.timestamp;
      setOffset(consumerId, channel, Number(commitId));
    }

    res.json({ logs });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// POST /api/logs/commit - Manual Commit
// POST /api/logs/commit - 수동 커밋
router.post('/commit', validateBody(CommitRequestSchema) as any, async (req: Request, res: Response) => {
  try {
    const { channel, consumerId, lastLogId } = req.body;
    setOffset(consumerId, channel, lastLogId);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Commit failed' });
  }
});

// POST /api/logs/seek - Reset Offset
// POST /api/logs/seek - 오프셋 초기화
router.post('/seek', validateBody(SeekRequestSchema) as any, async (req: Request, res: Response) => {
  try {
    const { channel, consumerId, operation, logId } = req.body;
    let newOffset = 0;

    if (operation === 'EARLIEST') {
      newOffset = 0;
    } else if (operation === 'LATEST') {
      newOffset = getLatestLogId(channel);
    } else if (operation === 'SPECIFIC') {
      newOffset = Number(logId);
    }

    setOffset(consumerId, channel, newOffset);

    res.json({ status: 'ok', newOffset });
  } catch (err) {
    console.error('Seek error:', err);
    res.status(500).json({ error: 'Seek failed' });
  }
});


async function writeEntry(entry: LogEntry): Promise<void> {
  const type = entry.storage || 'sqlite';
  return type === 'sqlite' ? writeLogToSQLite(entry) : writeLogToFile(entry);
}

export default router;
