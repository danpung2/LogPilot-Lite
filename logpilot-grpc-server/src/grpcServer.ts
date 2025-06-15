import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import {
	LogEntry as ResponseLogEntry,
	FetchLogsRequest,
	FetchLogsResponse,
	LogResponse,
	LogRequest,
} from "../proto/logpilot";
import { LogEntry as SaveLogEntry } from "@shared/types/log";
import { LogServiceService } from "../proto/logpilot";
import { readLogsFromSQLite } from "@shared/services/sqliteReader";
import { readLogsFromFile } from "@shared/services/fileReader";
import { writeLogToFile } from "@shared/services/fileWriter";
import { writeLogToSQLite } from "@shared/services/sqliteWriter";

export const LogServiceHandlers = {
	sendLog: async (
		call: ServerUnaryCall<LogRequest, LogResponse>,
		callback: sendUnaryData<LogResponse>
	) => {
		const request = call.request;
		const entry = {
			...request,
			timestamp: Date.now(),
			meta: request.meta ?? {},
		} as SaveLogEntry;

		const type = request.storage || "file";

		try {
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
			callback(err as Error, null);
		}
	},

	fetchLogs: async (
		call: ServerUnaryCall<FetchLogsRequest, FetchLogsResponse>,
		callback: sendUnaryData<FetchLogsResponse>
	) => {
		const { since, channel, limit = 100, storage } = call.request;

		if (!since || !channel || !storage) {
			return callback(new Error("Missing required fields"), null);
		}

		const sinceTime = Number(since);
		const readFn =
			storage === "sqlite"
				? readLogsFromSQLite
				: storage === "file"
				? readLogsFromFile
				: null;

		if (!readFn) {
			return callback(new Error("Unsupported storage"), null);
		}

		try {
			const rawLogs = await readFn(sinceTime, channel, limit);

			const logs: ResponseLogEntry[] = rawLogs.map((log) => ({
				...log,
				meta: log.meta ?? {},
			}));

			callback(null, { logs });
		} catch (err) {
			callback(err as Error, null);
		}
	},
};

export { LogServiceService };
