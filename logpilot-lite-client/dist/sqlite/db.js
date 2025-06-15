"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDb = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const defaultBaseDir = path_1.default.join(__dirname, '../../../storage');
const baseDir = process.env.LOGPILOT_STORAGE_DIR || defaultBaseDir;
if (!fs_1.default.existsSync(baseDir)) {
    fs_1.default.mkdirSync(baseDir, { recursive: true });
}
const db = new better_sqlite3_1.default(path_1.default.join(baseDir, 'logs.db'));
exports.logDb = db;
exports.logDb.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    meta TEXT
  )
`);
