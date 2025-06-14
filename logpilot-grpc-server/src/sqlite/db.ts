import Database from "better-sqlite3";
import path from "path";
import fs from 'fs';

const baseDir =
	process.env.LOGPILOT_STORAGE_DIR || path.join(__dirname, "../../storage");

if (!fs.existsSync(baseDir)) {
	fs.mkdirSync(baseDir, { recursive: true });
}
const dbPath = path.join(baseDir, "logs.db");

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT,
    level TEXT,
    message TEXT,
    timestamp INTEGER,
    meta TEXT
  )
`);
