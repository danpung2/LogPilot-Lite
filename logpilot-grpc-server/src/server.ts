import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";

import { LogServiceHandlers } from "./grpcServer";
import { LogServiceService } from "../proto/logpilot";

export function startGrpcServer(): void {
	dotenv.config({ path: path.resolve(__dirname, "../.env") });

	const server = new grpc.Server();
	server.addService(LogServiceService, LogServiceHandlers);

	const PORT = process.env.GRPC_PORT || "50051";

	server.bindAsync(
		`0.0.0.0:${PORT}`,
		grpc.ServerCredentials.createInsecure(),
		() => {
			console.log(`🚀 gRPC server listening on port ${PORT}`);
			server.start();
		}
	);
}
