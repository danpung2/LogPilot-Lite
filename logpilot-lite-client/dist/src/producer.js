"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPilotProducer = void 0;
const logpilot_1 = require("../proto/logpilot");
const grpc_js_1 = require("@grpc/grpc-js");
const client = new logpilot_1.LogServiceClient(process.env.LOGPILOT_SERVER_URL || 'localhost:50051', grpc_js_1.credentials.createInsecure());
class LogPilotProducer {
    produce(entry) {
        return new Promise((resolve, reject) => {
            client.sendLog(entry, (err, response) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.LogPilotProducer = LogPilotProducer;
