import { Logger } from "./logger.js";
import { ConsoleTransporter } from "./transports/console.js";
import { FileTransporter } from "./transports/file.js";

export const logger = new Logger({
  level: "debug",
  transports: [
    new ConsoleTransporter(),
    new FileTransporter("_server.log")
  ]
});
