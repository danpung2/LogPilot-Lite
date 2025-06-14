import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { startGrpcServer } from "@grpc-server/server";
import { startRestServer } from "@rest-server/server";

const mode = process.env.LOGPILOT_MODE || "rest";

if (mode === "grpc") {
	startGrpcServer();
} else {
	startRestServer();
}
