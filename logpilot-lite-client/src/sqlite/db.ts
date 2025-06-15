import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const defaultBaseDir = path.join(__dirname, '../../../storage');
const baseDir = process.env.LOGPILOT_STORAGE_DIR || defaultBaseDir;

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const db = new Database(path.join(baseDir, 'logs.db'));
export const logDb: any = db;

logDb.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    meta TEXT
  )
`);