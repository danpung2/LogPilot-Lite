export const VALIDATION_LIMITS = {
  CHANNEL: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 249,
    PATTERN: /^[a-zA-Z0-9._-]+$/,
  },

  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1024 * 1024,
  },

  META: {
    MAX_PROPERTIES: 100,
    MAX_KEY_LENGTH: 255,
    MAX_VALUE_LENGTH: 1024,
  },

  FETCH_LOGS: {
    MIN_LIMIT: 1,
    MAX_LIMIT: 10000,
    DEFAULT_LIMIT: 100,
    MAX_FETCH_SIZE: 50 * 1024 * 1024,
  },

  TIME: {
    MAX_TIMESTAMP_DRIFT: 24 * 60 * 60 * 1000,
  },
} as const;

export const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const;

export const STORAGE_TYPES = ['file', 'sqlite'] as const;

export const DEFAULT_VALUES = {
  STORAGE: 'file' as const,
  META: {} as Record<string, string>
} as const;

export const ERROR_MESSAGES = {
  CHANNEL: {
    EMPTY: 'Channel cannot be empty',
    TOO_LONG: `Channel must be ${VALIDATION_LIMITS.CHANNEL.MAX_LENGTH} characters or less`,
    INVALID_FORMAT: 'Channel must contain only alphanumeric characters, dots, underscores, and hyphens'
  },
  MESSAGE: {
    EMPTY: 'Message cannot be empty',
    TOO_LONG: `Message must be ${Math.floor(VALIDATION_LIMITS.MESSAGE.MAX_LENGTH / 1024 / 1024)}MB or less`
  },
  META: {
    TOO_MANY_PROPERTIES: `Meta object cannot have more than ${VALIDATION_LIMITS.META.MAX_PROPERTIES} properties`,
    KEY_TOO_LONG: `Meta key must be ${VALIDATION_LIMITS.META.MAX_KEY_LENGTH} characters or less`,
    VALUE_TOO_LONG: `Meta value must be ${VALIDATION_LIMITS.META.MAX_VALUE_LENGTH} characters or less`
  },
  LEVEL: {
    INVALID: `Level must be one of: ${LOG_LEVELS.join(', ')}`
  },
  STORAGE: {
    INVALID: `Storage must be either "${STORAGE_TYPES.join('" or "')}"`
  },
  TIMESTAMP: {
    NOT_INTEGER: 'Timestamp must be an integer',
    NOT_POSITIVE: 'Timestamp must be positive',
    TOO_MUCH_DRIFT: `Timestamp drift cannot exceed ${VALIDATION_LIMITS.TIME.MAX_TIMESTAMP_DRIFT / 1000 / 60 / 60} hours`
  },
  FETCH_LOGS: {
    SINCE_NOT_INTEGER: 'Since must be an integer timestamp',
    SINCE_NEGATIVE: 'Since must be non-negative',
    LIMIT_NOT_INTEGER: 'Limit must be an integer',
    LIMIT_TOO_SMALL: `Limit must be at least ${VALIDATION_LIMITS.FETCH_LOGS.MIN_LIMIT}`,
    LIMIT_TOO_LARGE: `Limit cannot exceed ${VALIDATION_LIMITS.FETCH_LOGS.MAX_LIMIT}`,
    FETCH_SIZE_TOO_LARGE: `Fetch size cannot exceed ${Math.floor(VALIDATION_LIMITS.FETCH_LOGS.MAX_FETCH_SIZE / 1024 / 1024)}MB`
  },
} as const;
