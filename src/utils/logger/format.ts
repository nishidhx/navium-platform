import type { LogLevel } from "./levels.js";

/**
 * ANSI colors for each level.
 */
const COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

/**
 * @method formatMessage - method to format the message for transport log.
 * @param {LogLevel} level
 * @param {string} message
 */
const formatMessage = (level: LogLevel, message: string): string => {
    const time = new Date().toISOString(); // date time format in ISOSTRING
    const logger_text = `[${time}]:[${level.toLocaleUpperCase()}]: ${message}`;
    return logger_text;
}

/**
 * method for adding colors to the formatted log.
 * @param {LogLevel} level
 * @param {string} formatted_string
 */
const colorize_logs = (level: LogLevel, formatted_string: string): string => {
    return COLORS[level] + formatted_string + "\x1b[0m";
} 

export {
    COLORS,
    formatMessage,
    colorize_logs
}