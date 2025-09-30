import * as grpc from '@grpc/grpc-js';
import { z } from 'zod';

export const GRPC_VALIDATION_ERRORS = {
  INVALID_ARGUMENT: grpc.status.INVALID_ARGUMENT,
  INTERNAL: grpc.status.INTERNAL,
} as const;

export const createGrpcValidationError = (zodError: z.ZodError): grpc.ServiceError => {
  const details = zodError.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  const error = new Error(`Validation failed: ${JSON.stringify(details)}`) as grpc.ServiceError;
  error.code = GRPC_VALIDATION_ERRORS.INVALID_ARGUMENT;
  error.details = JSON.stringify(details);

  return error;
};

export const validateGrpcRequest = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createGrpcValidationError(error);
    }
    throw error;
  }
};

export const handleGrpcError = (error: Error): grpc.ServiceError => {
  if ('code' in error && typeof error.code === 'number') {
    return error as grpc.ServiceError;
  }

  if (error instanceof z.ZodError) {
    return createGrpcValidationError(error);
  }

  const grpcError = new Error('Internal server error') as grpc.ServiceError;
  grpcError.code = GRPC_VALIDATION_ERRORS.INTERNAL;
  grpcError.details = error.message;

  return grpcError;
};
