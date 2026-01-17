/**
 * @typedef {"debug" | "info" | "warn" | "error"} LogLevel
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Priority mapping for levels
 */
export const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
