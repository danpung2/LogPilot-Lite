import fs from "fs/promises";
import path from "path";
import { LogEntry } from "../types/log";

const baseDir =
	process.env.LOGPILOT_STORAGE_DIR || path.join(__dirname, "../../storage");
const logsDir = path.join(baseDir, "logs");

let lastTimestamp = 0;
let sequence = 0;

/**
 * Generates a unique, sortable 64-bit integer ID based on high-resolution timestamp.
 * Format: [Timestamp (ms) * 1000] + [Sequence (0-999)]
 * This ensures IDs are unique even if multiple logs are written in the same millisecond.
 * 
 * 고해상도 타임스탬프를 기반으로 고유하고 정렬 가능한 64비트 정수 ID를 생성합니다.
 * 형식: [타임스탬프 (ms) * 1000] + [시퀀스 (0-999)]
 * 이를 통해 동일한 밀리초에 여러 로그가 기록되더라도 ID의 고유성을 보장합니다.
 */
function generateHighResId(): number {
	const now = Date.now();
	if (now === lastTimestamp) {
		sequence = (sequence + 1) % 1000;
	} else {
		lastTimestamp = now;
		sequence = 0;
	}
	// Safe integer limit in JS is 2^53 - 1. 
	// Date.now() ~ 1.7e12. * 1000 -> 1.7e15.
	// This fits within Number.MAX_SAFE_INTEGER (9e15).
	return (now * 1000) + sequence;
}

export async function writeLogToFile(entry: LogEntry): Promise<void> {
	const dateStr = new Date(entry.timestamp).toISOString().split("T")[0];
	const fileName = `${entry.channel}_${dateStr}.log`;
	const filePath = path.join(logsDir, fileName);

	// Assign ID if missing
	// ID가 누락된 경우 할당
	if (!entry.id) {
		entry.id = generateHighResId();
	}

	const logLine = JSON.stringify(entry) + "\n";
	await fs.mkdir(logsDir, { recursive: true });
	await fs.appendFile(filePath, logLine, "utf-8");
}

export async function writeLogsToFile(entries: LogEntry[]): Promise<void> {
	if (entries.length === 0) return;

	for (const entry of entries) {
		await writeLogToFile(entry);
	}
}
