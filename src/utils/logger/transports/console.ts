import type { LogLevel } from "../levels.js";
import { formatMessage, colorize_logs } from "../format.js";

/**
 * @class ConsoleTransporter - console transport for logging
 */
export class ConsoleTransporter { 
    /**
     * @method log
     * @param {LogLevel} level
     * @param {string} message
     */
    log(level: LogLevel, message: string) {
        const formatted = formatMessage(level, message);
        console.log(colorize_logs(level, formatted))
    }
}