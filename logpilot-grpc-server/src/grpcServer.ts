import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
	LogEntry as ResponseLogEntry,
	FetchLogsRequest,
	FetchLogsResponse,
	LogResponse,
	LogRequest,
	SeekRequest,
	SeekResponse,
} from "../proto/logpilot";
import { LogEntry as SaveLogEntry } from "@shared/types/log";
import { LogServiceService } from "../proto/logpilot";
import { readLogsFromSQLite } from "@shared/services/sqliteReader";
import { readLogsFromFile } from "@shared/services/fileReader";
import { writeLogToFile } from "@shared/services/fileWriter";
import { writeLogToSQLite } from "@shared/services/sqliteWriter";
import { getOffset, setOffset, getLatestLogTimestamp } from "@shared/services/offsetService";
import { validateGrpcRequest, handleGrpcError } from "@shared/middleware/grpcValidation";
import { LogEntrySchema, FetchLogsRequestSchema } from "@shared/schemas";

export const LogServiceHandlers = {
	sendLog: async (
		call: ServerUnaryCall<LogRequest, LogResponse>,
		callback: sendUnaryData<LogResponse>
	) => {
		try {
			const request = validateGrpcRequest(LogEntrySchema, call.request);
			const entry = {
				...request,
				timestamp: Date.now(),
				meta: request.meta ?? {},
			} as SaveLogEntry;

			const type = request.storage || "file";

			if (type === "sqlite") {
				await writeLogToSQLite(entry);
			} else if (type === "file") {
				await writeLogToFile(entry);
			} else {
				return callback(
					new Error(`Unsupported storage: ${type}`),
					null
				);
			}

			console.log("[✅ SAVED]", entry);
			callback(null, {
				status: "ok",
				message: "Log stored successfully",
			});
		} catch (err) {
			console.error("[❌ WRITE FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	},

	fetchLogs: async (
		call: ServerUnaryCall<FetchLogsRequest, FetchLogsResponse>,
		callback: sendUnaryData<FetchLogsResponse>
	) => {
		try {
			const request = validateGrpcRequest(FetchLogsRequestSchema, call.request);
			const { since, channel, limit = 100, storage, consumerId } = request;

			let sinceTime = Number(since);

			// 1. Offset Resolution
			if (isNaN(sinceTime) || sinceTime === 0) {
				if (consumerId) {
					sinceTime = getOffset(consumerId, channel);
				} else {
					sinceTime = 0;
				}
			}

			const readFn =
				storage === "sqlite"
					? readLogsFromSQLite
					: storage === "file"
					? readLogsFromFile
					: null;

			if (!readFn) {
				return callback(new Error("Unsupported storage"), null);
			}

			const rawLogs = readFn(sinceTime, channel, limit);

			const logs: ResponseLogEntry[] = rawLogs.map((log) => ({
				...log,
				meta: log.meta ?? {},
			}));

			// 2. Auto Commit
			if (consumerId && logs.length > 0) {
				const lastLog = logs[logs.length - 1];
				setOffset(consumerId, channel, Number(lastLog.timestamp));
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
			const { channel, consumerId, type, value } = call.request;
			let newOffset = 0;

			if (type === "BEGINNING") {
				newOffset = 0;
			} else if (type === "END") {
				newOffset = getLatestLogTimestamp(channel);
			} else if (type === "TIMESTAMP") {
				newOffset = Number(value);
			}

			setOffset(consumerId, channel, newOffset);
			callback(null, { status: "ok", newOffset });
		} catch (err) {
			console.error("[❌ SEEK FAILED]", err);
			callback(handleGrpcError(err as Error), null);
		}
	},
};

export { LogServiceService };
