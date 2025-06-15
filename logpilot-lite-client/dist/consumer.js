"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPilotConsumer = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./sqlite/db");
class LogPilotConsumer {
    constructor(storageType, baseDir) {
        this.storageType = storageType;
        this.baseDir = baseDir;
    }
    async listLogs() {
        if (this.storageType === 'file') {
            const logsPath = path_1.default.join(this.baseDir, 'logs');
            const files = await promises_1.default.readdir(logsPath);
            return files.filter(file => file.endsWith('.log'));
        }
        else if (this.storageType === 'sqlite') {
            const rows = db_1.logDb.prepare('SELECT id, channel, timestamp FROM logs ORDER BY timestamp DESC').all();
            return rows.map((row) => `[${row.id}] ${row.channel} @ ${new Date(row.timestamp).toISOString()}`);
        }
        else {
            throw new Error('Unsupported storage type');
        }
    }
    async readLog(identifier) {
        if (this.storageType === 'file') {
            const filePath = path_1.default.join(this.baseDir, 'logs', identifier);
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            return content
                .trim()
                .split('\n')
                .map(line => JSON.parse(line));
        }
        else if (this.storageType === 'sqlite') {
            const row = db_1.logDb.prepare('SELECT * FROM logs WHERE id = ?').get(identifier);
            if (!row)
                return null;
            return {
                channel: row.channel,
                level: row.level,
                message: row.message,
                timestamp: row.timestamp,
                meta: row.meta ? JSON.parse(row.meta) : undefined,
            };
        }
        else {
            throw new Error('Unsupported storage type');
        }
    }
}
exports.LogPilotConsumer = LogPilotConsumer;
