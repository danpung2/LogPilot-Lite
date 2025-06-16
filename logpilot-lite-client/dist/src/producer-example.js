"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consumer_1 = require("./consumer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const consumer = new consumer_1.LogPilotConsumer('consumer-example-monitor', process.env.LOGPILOT_CHANNEL || "refresh-token-job", 'sqlite');
async function monitorLogs() {
    //   const logs = await consumer.listLogs();
    //   for (const logSummary of logs) {
    //     const id = logSummary.match(/\[(.+?)\]/)?.[1];
    //     if (id) {
    //       const log = await consumer.readLog(id);
    //       console.log("🧭 Consumed log:", log);
    //     }
    //   }
    //   await consumer.updateOffsetToLatest();
    const logs = await consumer.consume();
    console.log(logs);
}
monitorLogs();
