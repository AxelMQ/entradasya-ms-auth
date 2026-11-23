type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const shouldLog = (level: LogLevel): boolean => {
  return logLevels[level] >= (logLevels[currentLevel] ?? 1);
};

const formatMessage = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'ms-auth',
    level,
    message,
    ...(meta || {})
  });
};

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
  info(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta));
    }
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  error(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  }
};
