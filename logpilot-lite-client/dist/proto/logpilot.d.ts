import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
export declare const protobufPackage = "logpilot";
export interface LogRequest {
    channel: string;
    level: string;
    message: string;
    meta: {
        [key: string]: string;
    };
    storage: string;
}
export interface LogRequest_MetaEntry {
    key: string;
    value: string;
}
export interface LogResponse {
    status: string;
    message: string;
}
export interface ListLogsRequest {
    storage: string;
    channel: string;
    level: string;
    fromTimestamp: number;
    toTimestamp: number;
}
export interface ListLogsResponse {
    logs: LogEntry[];
}
export interface FetchLogsRequest {
    since: string;
    channel: string;
    limit: number;
    storage: string;
}
export interface FetchLogsResponse {
    logs: LogEntry[];
}
export interface LogEntry {
    channel: string;
    level: string;
    message: string;
    meta: {
        [key: string]: string;
    };
    timestamp: number;
}
export interface LogEntry_MetaEntry {
    key: string;
    value: string;
}
export declare const LogRequest: MessageFns<LogRequest>;
export declare const LogRequest_MetaEntry: MessageFns<LogRequest_MetaEntry>;
export declare const LogResponse: MessageFns<LogResponse>;
export declare const ListLogsRequest: MessageFns<ListLogsRequest>;
export declare const ListLogsResponse: MessageFns<ListLogsResponse>;
export declare const FetchLogsRequest: MessageFns<FetchLogsRequest>;
export declare const FetchLogsResponse: MessageFns<FetchLogsResponse>;
export declare const LogEntry: MessageFns<LogEntry>;
export declare const LogEntry_MetaEntry: MessageFns<LogEntry_MetaEntry>;
export type LogServiceService = typeof LogServiceService;
export declare const LogServiceService: {
    readonly sendLog: {
        readonly path: "/logpilot.LogService/SendLog";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: LogRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => LogRequest;
        readonly responseSerialize: (value: LogResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => LogResponse;
    };
    readonly listLogs: {
        readonly path: "/logpilot.LogService/ListLogs";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: ListLogsRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => ListLogsRequest;
        readonly responseSerialize: (value: ListLogsResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => ListLogsResponse;
    };
    readonly fetchLogs: {
        readonly path: "/logpilot.LogService/FetchLogs";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: FetchLogsRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => FetchLogsRequest;
        readonly responseSerialize: (value: FetchLogsResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => FetchLogsResponse;
    };
};
export interface LogServiceServer extends UntypedServiceImplementation {
    sendLog: handleUnaryCall<LogRequest, LogResponse>;
    listLogs: handleUnaryCall<ListLogsRequest, ListLogsResponse>;
    fetchLogs: handleUnaryCall<FetchLogsRequest, FetchLogsResponse>;
}
export interface LogServiceClient extends Client {
    sendLog(request: LogRequest, callback: (error: ServiceError | null, response: LogResponse) => void): ClientUnaryCall;
    sendLog(request: LogRequest, metadata: Metadata, callback: (error: ServiceError | null, response: LogResponse) => void): ClientUnaryCall;
    sendLog(request: LogRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: LogResponse) => void): ClientUnaryCall;
    listLogs(request: ListLogsRequest, callback: (error: ServiceError | null, response: ListLogsResponse) => void): ClientUnaryCall;
    listLogs(request: ListLogsRequest, metadata: Metadata, callback: (error: ServiceError | null, response: ListLogsResponse) => void): ClientUnaryCall;
    listLogs(request: ListLogsRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: ListLogsResponse) => void): ClientUnaryCall;
    fetchLogs(request: FetchLogsRequest, callback: (error: ServiceError | null, response: FetchLogsResponse) => void): ClientUnaryCall;
    fetchLogs(request: FetchLogsRequest, metadata: Metadata, callback: (error: ServiceError | null, response: FetchLogsResponse) => void): ClientUnaryCall;
    fetchLogs(request: FetchLogsRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: FetchLogsResponse) => void): ClientUnaryCall;
}
export declare const LogServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): LogServiceClient;
    service: typeof LogServiceService;
    serviceName: string;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
