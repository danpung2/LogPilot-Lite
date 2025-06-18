"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPilotConsumer = void 0;
const grpcClient_1 = require("./grpcClient");
const offsetStore_1 = require("./offsetStore");
class LogPilotConsumer {
    constructor(consumerId, channel, storage) {
        this.consumerId = consumerId;
        this.channel = channel;
        this.storage = storage;
    }
    async consume() {
        const offset = Number((0, offsetStore_1.getOffset)(this.consumerId)) || 0;
        let logs;
        try {
            logs = await (0, grpcClient_1.fetchLogsSince)(offset, this.channel, this.storage);
        }
        catch (err) {
            console.error(`[${this.consumerId}] ❌ Failed to fetch logs:`, err);
            return err;
        }
        if (!logs.length) {
            //   console.log(`[${this.consumerId}] No new logs.`);
            return [];
        }
        const latest = logs[logs.length - 1].timestamp;
        if (latest !== undefined) {
            (0, offsetStore_1.setOffset)(this.consumerId, latest.toString());
            console.log(`✅ [${this.consumerId}] Updated offset to ${latest}`);
        }
        return logs;
    }
}
exports.LogPilotConsumer = LogPilotConsumer;
