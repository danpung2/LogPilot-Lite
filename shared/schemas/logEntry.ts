import { z } from 'zod';
import {
  VALIDATION_LIMITS,
  LOG_LEVELS,
  STORAGE_TYPES,
  DEFAULT_VALUES,
  ERROR_MESSAGES
} from '@shared/constants';

export const LogEntrySchema = z.object({
  channel: z.string()
    .min(VALIDATION_LIMITS.CHANNEL.MIN_LENGTH, ERROR_MESSAGES.CHANNEL.EMPTY)
    .max(VALIDATION_LIMITS.CHANNEL.MAX_LENGTH, ERROR_MESSAGES.CHANNEL.TOO_LONG)
    .regex(VALIDATION_LIMITS.CHANNEL.PATTERN, ERROR_MESSAGES.CHANNEL.INVALID_FORMAT),

  level: z.enum(LOG_LEVELS, {
    errorMap: () => ({ message: ERROR_MESSAGES.LEVEL.INVALID })
  }),

  message: z.string()
    .min(VALIDATION_LIMITS.MESSAGE.MIN_LENGTH, ERROR_MESSAGES.MESSAGE.EMPTY)
    .max(VALIDATION_LIMITS.MESSAGE.MAX_LENGTH, ERROR_MESSAGES.MESSAGE.TOO_LONG),

  meta: z.record(
      z.string()
        .max(VALIDATION_LIMITS.META.MAX_KEY_LENGTH, ERROR_MESSAGES.META.KEY_TOO_LONG),
      z.string()
        .max(VALIDATION_LIMITS.META.MAX_VALUE_LENGTH, ERROR_MESSAGES.META.VALUE_TOO_LONG)
    )
    .refine(
      (obj: Record<string, string>) => Object.keys(obj).length <= VALIDATION_LIMITS.META.MAX_PROPERTIES,
      ERROR_MESSAGES.META.TOO_MANY_PROPERTIES
    )
    .optional()
    .default(DEFAULT_VALUES.META),

  storage: z.enum(STORAGE_TYPES)
    .optional()
    .default(DEFAULT_VALUES.STORAGE),

  timestamp: z.number()
    .int(ERROR_MESSAGES.TIMESTAMP.NOT_INTEGER)
    .positive(ERROR_MESSAGES.TIMESTAMP.NOT_POSITIVE)
    .refine(
      (timestamp: number) => {
        const now = Date.now();
        const drift = Math.abs(timestamp - now);
        return drift <= VALIDATION_LIMITS.TIME.MAX_TIMESTAMP_DRIFT;
      },
      ERROR_MESSAGES.TIMESTAMP.TOO_MUCH_DRIFT
    )
    .optional()
});

export const FetchLogsRequestSchema = z.object({
  since: z.number()
    .int(ERROR_MESSAGES.FETCH_LOGS.SINCE_NOT_INTEGER)
    .nonnegative(ERROR_MESSAGES.FETCH_LOGS.SINCE_NEGATIVE),

  channel: z.string()
    .min(VALIDATION_LIMITS.CHANNEL.MIN_LENGTH, ERROR_MESSAGES.CHANNEL.EMPTY)
    .max(VALIDATION_LIMITS.CHANNEL.MAX_LENGTH, ERROR_MESSAGES.CHANNEL.TOO_LONG)
    .regex(VALIDATION_LIMITS.CHANNEL.PATTERN, ERROR_MESSAGES.CHANNEL.INVALID_FORMAT),

  limit: z.number()
    .int(ERROR_MESSAGES.FETCH_LOGS.LIMIT_NOT_INTEGER)
    .min(VALIDATION_LIMITS.FETCH_LOGS.MIN_LIMIT, ERROR_MESSAGES.FETCH_LOGS.LIMIT_TOO_SMALL)
    .max(VALIDATION_LIMITS.FETCH_LOGS.MAX_LIMIT, ERROR_MESSAGES.FETCH_LOGS.LIMIT_TOO_LARGE)
    .optional()
    .default(VALIDATION_LIMITS.FETCH_LOGS.DEFAULT_LIMIT),

  storage: z.enum(STORAGE_TYPES, {
    errorMap: () => ({ message: ERROR_MESSAGES.STORAGE.INVALID })
  }),

  maxBytes: z.number()
    .int('Max bytes must be an integer')
    .positive('Max bytes must be positive')
    .max(VALIDATION_LIMITS.FETCH_LOGS.MAX_FETCH_SIZE, ERROR_MESSAGES.FETCH_LOGS.FETCH_SIZE_TOO_LARGE)
    .optional()
});

export type LogEntryInput = z.input<typeof LogEntrySchema>;
export type LogEntryOutput = z.output<typeof LogEntrySchema>;
export type FetchLogsRequestInput = z.input<typeof FetchLogsRequestSchema>;
export type FetchLogsRequestOutput = z.output<typeof FetchLogsRequestSchema>;
