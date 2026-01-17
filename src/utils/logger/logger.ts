import { LEVELS, type LogLevel } from "./levels.js";
import { ConsoleTransporter } from "./transports/console.js";
import { FileTransporter } from "./transports/file.js";


/**
 * @typedef {Object} LoggerOptions
 * @property {LogLevel} [level]
 * @property {Array<T>} [transports]
 */
export interface LoggerOptions {
    level?: LogLevel;
    transports?: Array<any>
}

/**
 * Core logger class
 */
export class Logger {
    private level: LogLevel;
    private transports: Array<any>;

    constructor(options: LoggerOptions = {}) {
        this.level = options.level ?? "info";
        this.transports = options.transports ?? [
            new ConsoleTransporter(),
            new FileTransporter("_app.log")
        ]
    }

    /**
     * @method shouldLog - public method to check if the level exists .
     * @param {LogLevel} level 
     */
    private shouldLog(level: LogLevel) {
        return LEVELS[level] >= LEVELS[this.level];
    }

    /**
     * @method dispathLog - public method to dispatch the log .
     */
    private dispatchLog(level: LogLevel, message: string) {
        this.transports.forEach(t => t.log(level, message))
    }

    /**
     * @method log - public method  to log the logs to the transport file.
     * @param {LogLevel} level
     * @param {string} message
     */
    log(level: LogLevel, message: string) {
        if (this.shouldLog(level)) {
            this.dispatchLog(level, message)
        }
    }

    /**
     * convenince api
     */
    debug(msg: string) {this.log("debug", msg)}
    info(msg: string) {this.log("info", msg)}
    warn(msg: string) {this.log("warn", msg)}
    error(msg: string) {this.log("error", msg)}


}

