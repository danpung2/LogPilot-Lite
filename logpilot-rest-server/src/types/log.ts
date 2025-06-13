export interface LogEntry {
  timestamp: number // UNIX 시간 (ms)
  channel: string   // ex. "auth", "order"
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  meta?: Record<string, any> // 추가 정보
};
