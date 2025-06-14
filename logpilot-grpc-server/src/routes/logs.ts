import { Router, Request, Response } from 'express';
import { LogEntry } from '../types/log';
import { writeLog } from '../services/fileWriter';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const entry = req.body as LogEntry;

    if (!entry.timestamp) {
        entry.timestamp = Date.now();
    }


  if (!entry.channel || !entry.message || !entry.level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await writeLog(entry);
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Log write error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})

export default router;
