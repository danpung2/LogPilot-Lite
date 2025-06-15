"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLogsSince = fetchLogsSince;
const logpilot_1 = require("../proto/logpilot");
const grpc_js_1 = require("@grpc/grpc-js");
const client = new logpilot_1.LogServiceClient(process.env.LOGPILOT_SERVER_URL || 'localhost:50051', grpc_js_1.credentials.createInsecure());
async function fetchLogsSince(since, channel, limit = 100) {
    const request = {
        since: since.toString(),
        channel,
        limit
    };
    return new Promise((resolve, reject) => {
        client.fetchLogs(request, (err, response) => {
            if (err)
                return reject(err);
            if (!response.logs)
                return resolve([]);
            resolve(response.logs);
        });
    });
}
