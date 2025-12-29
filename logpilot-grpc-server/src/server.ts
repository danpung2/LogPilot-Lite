import dotenv from 'dotenv';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { LogServiceHandlers } from './grpcServer';

export function startGrpcServer(): void {
	dotenv.config({ path: path.resolve(__dirname, '../.env') });

	const PROTO_PATH = path.join(__dirname, '../proto/logpilot.proto');
	const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
		keepCase: true,
		longs: String,
		enums: String,
		defaults: true,
		oneofs: true,
	});

	const proto = grpc.loadPackageDefinition(packageDefinition) as any;
	const server = new grpc.Server();

	server.addService(proto.logpilot.LogService.service, LogServiceHandlers);

	const PORT = process.env.PORT || '50051';
	server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log(`🚀 LogPilot gRPC Server listening on port ${port}`);
	});
}

if (require.main === module) {
	startGrpcServer();
}
