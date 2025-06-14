import dotenv from 'dotenv';
import path from 'path';
import { startGrpcServerImpl } from './grpcServer';

export function startGrpcServer(): void {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  startGrpcServerImpl();
}
