import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
	LogRequest,
	LogResponse,
	FetchLogsRequest,
	FetchLogsResponse,
	SeekRequest,
	SeekResponse,
	SendLogsRequest,
	SendLogsResponse,
	ListLogsRequest,
	ListLogsResponse,
	SeekOffsetRequest,
	LogEntry as ProtoLogEntry
} from "../proto/logpilot";
import { LogEntry as SaveLogEntry } from "@shared/types/log";
import { readLogsFromSQLite, listLogsFromSQLite } from "@shared/services/sqliteReader";
import { readLogsFromFile, listLogsFromFile } from "@shared/services/fileReader";
import { writeLogToFile, writeLogsToFile } from "@shared/services/fileWriter";
import { writeLogToSQLite, writeLogsToSQLite } from "@shared/services/sqliteWriter";
import { getOffset, setOffset, getLatestLogId } from "@shared/services/offsetService";
import { handleGrpcError } from "@shared/middleware/grpcValidation";

export const LogServiceHandlers = {
	sendLog: async (
		call: ServerUnaryCall<LogRequest, LogResponse>,
		callback: sendUnaryData<LogResponse>
	) => {
		try {
			const request = call.request;
			const entry: SaveLogEntry = {
				channel: request.channel,
				level: request.level,
				message: request.message,
				meta: request.meta,
				storage: (request.storage as any) || "sqlite",
				timestamp: Date.now()
			};

			const type = entry.storage || "sqlite";
			if (type === "sqlite") {
				await writeLogToSQLite(entry);
			} else {
				await writeLogToFile(entry);
			}

			callback(null, { status: "ok", message: "Log stored" });
		} catch (err) {
			console.error("[❌ SEND FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	},

	sendLogs: async (
		call: ServerUnaryCall<SendLogsRequest, SendLogsResponse>,
		callback: sendUnaryData<SendLogsResponse>
	) => {
		try {
			const { logRequests } = call.request;
			const now = Date.now();
			const entries: SaveLogEntry[] = logRequests.map(r => ({
				channel: r.channel,
				level: r.level,
				message: r.message,
				meta: r.meta,
				storage: (r.storage as any) || "sqlite",
				timestamp: now
			}));

			if (entries.length > 0) {
				const type = entries[0].storage || "sqlite";
				if (type === "sqlite") {
					await writeLogsToSQLite(entries);
				} else {
					await writeLogsToFile(entries);
				}
			}

			callback(null, { status: "ok", message: `${entries.length} logs stored` });
		} catch (err) {
			console.error("[❌ BATCH SEND FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	},

	fetchLogs: async (
		call: ServerUnaryCall<FetchLogsRequest, FetchLogsResponse>,
		callback: sendUnaryData<FetchLogsResponse>
	) => {
		try {
			const { since, channel, limit, storage, consumerId: bodyConsumerId } = call.request;

			const metadataMap = call.metadata.getMap();
			const metaConsumerId = (metadataMap['consumer-id'] as string) || (metadataMap['consumerid'] as string);
			const consumerId = bodyConsumerId || metaConsumerId;

			let sinceId = Number(since) || 0;

			// 1. Offset Resolution
			// 1. 오프셋 해결 (Offset Resolution)
			if ((isNaN(sinceId) || sinceId === 0) && consumerId) {
				sinceId = getOffset(consumerId, channel);
			}

			const readFn = storage === "sqlite" ? readLogsFromSQLite : readLogsFromFile;

			const rawLogs = readFn(sinceId, channel, limit || 100);

			const logs: ProtoLogEntry[] = rawLogs.map(log => ({
				channel: log.channel,
				level: log.level,
				message: log.message,
				meta: log.meta || {},
				timestamp: log.timestamp,
				id: log.id || 0
			}));

			// 2. Auto Commit if consumerId is present
			// 2. consumerId가 존재하는 경우 자동 커밋
			if (consumerId && logs.length > 0) {
				const lastLog = logs[logs.length - 1];
				// Use ID for SQLite, timestamp for File (emulated ID)
				// SQLite의 경우 ID 사용, 파일의 경우 타임스탬프(에뮬레이트된 ID) 사용
				const commitId = lastLog.id || lastLog.timestamp;
				setOffset(consumerId, channel, Number(commitId));
			}

			callback(null, { logs });
		} catch (err) {
			callback(handleGrpcError(err as Error), null);
		}
	},

	seek: async (
		call: ServerUnaryCall<SeekRequest, SeekResponse>,
		callback: sendUnaryData<SeekResponse>
	) => {
		try {
			const { channel, consumerId, operation, logId } = call.request;
			let newOffset = 0;

			if (operation === "EARLIEST") {
				newOffset = 0;
			} else if (operation === "LATEST") {
				newOffset = getLatestLogId(channel);
			} else if (operation === "SPECIFIC") {
				newOffset = Number(logId);
			}

			setOffset(consumerId, channel, newOffset);
			callback(null, { status: "ok", message: "Offset updated" });
		} catch (err) {
			console.error("[❌ SEEK FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	},

	listLogs: async (
		call: ServerUnaryCall<ListLogsRequest, ListLogsResponse>,
		callback: sendUnaryData<ListLogsResponse>
	) => {
		try {
			const { storage, channel, level, fromTimestamp, toTimestamp } = call.request;
			const readFn = storage === 'file' ? listLogsFromFile : listLogsFromSQLite;

			// Default range if not provided: last 24 hours
			const end = toTimestamp > 0 ? toTimestamp : Date.now();
			const start = fromTimestamp > 0 ? fromTimestamp : end - (24 * 60 * 60 * 1000);

			const rawLogs = readFn(start, end, channel, level, 100);

			const logs: ProtoLogEntry[] = rawLogs.map(log => ({
				channel: log.channel,
				level: log.level,
				message: log.message,
				meta: log.meta || {},
				timestamp: log.timestamp,
				id: log.id || 0
			}));

			callback(null, { logs });
		} catch (err) {
			callback(handleGrpcError(err as Error), null);
		}
	},

	seekToEnd: async (
		call: ServerUnaryCall<SeekOffsetRequest, SeekResponse>,
		callback: sendUnaryData<SeekResponse>
	) => {
		try {
			const { channel, consumerId } = call.request;
			const newOffset = getLatestLogId(channel);
			setOffset(consumerId, channel, newOffset);
			callback(null, { status: "ok", message: "Offset updated to END" });
		} catch (err) {
			console.error("[❌ SEEK TO END FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	},

	seekToBeginning: async (
		call: ServerUnaryCall<SeekOffsetRequest, SeekResponse>,
		callback: sendUnaryData<SeekResponse>
	) => {
		try {
			const { channel, consumerId } = call.request;
			setOffset(consumerId, channel, 0);
			callback(null, { status: "ok", message: "Offset updated to BEGINNING" });
		} catch (err) {
			console.error("[❌ SEEK TO BEGINNING FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	}
};
