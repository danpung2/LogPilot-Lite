"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPilotConsumer = void 0;
const grpcClient_1 = require("./grpcClient");
const offsetStore_1 = require("./offsetStore");
class LogPilotConsumer {
    constructor(consumerId, channel) {
        this.consumerId = consumerId;
        this.channel = channel;
    }
    async consume() {
        const offset = Number((0, offsetStore_1.getOffset)(this.consumerId)) || 0;
        let logs;
        try {
            logs = await (0, grpcClient_1.fetchLogsSince)(offset, this.channel);
        }
        catch (err) {
            console.error(`[${this.consumerId}] ❌ Failed to fetch logs:`, err);
            return;
        }
        if (!logs.length) {
            console.log(`[${this.consumerId}] No new logs.`);
            return;
        }
        for (const log of logs) {
            const time = new Date(Number(log.timestamp)).toISOString();
            console.log(`[${this.consumerId}] ${time} ${log.level} [${log.channel}] - ${log.message}`);
        }
        const latest = logs[logs.length - 1].timestamp;
        if (latest !== undefined) {
            (0, offsetStore_1.setOffset)(this.consumerId, latest.toString());
            console.log(`✅ [${this.consumerId}] Updated offset to ${latest}`);
        }
    }
}
exports.LogPilotConsumer = LogPilotConsumer;
