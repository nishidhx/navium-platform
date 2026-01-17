import fs from "fs";
import path from "path";
import type { LogLevel } from "../levels.js";
import { formatMessage } from "../format.js";

/**
 * @class FileTransport - logs file transport 
 */
export class FileTransporter {

    private log_filepath: string;

    /**
     * @constructor 
     */
    constructor(filename: string = "_app.log") {
        const safeDate = new Date()
            .toISOString()
            .replace(/[:.]/g, "-"); // remove invalid characters
        const file = `${safeDate}_${filename}`;
        this.log_filepath = path.join(process.cwd(), "storage", "dev", "logs", file);
        
        // Ensure the directory exists
        this.ensureDirectoryExists(path.dirname(this.log_filepath));
    }

    /**
     * @method ensureDirectoryExists - Create directory if it doesn't exist
     */
    private ensureDirectoryExists(dirPath: string) {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (error) {
            console.error(`Failed to create log directory: ${error}`);
        }
    }

    /**
     * @method log - public method to log the logs in the transport file
     * @param {LogLevel} level
     * @param {string} message
     */
    log(level: LogLevel, message: string) {
        try {
            const formatted = formatMessage(level, message);
            fs.appendFileSync(this.log_filepath, formatted + "\n");
        } catch (error) {
            console.error(`Failed to write log: ${error}`);
        }
    }
}