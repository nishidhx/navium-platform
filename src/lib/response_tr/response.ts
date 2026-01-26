import type { ServerResponse, OutgoingHttpHeaders } from "http";
import type { ServerRequest } from "../../types/server.js";
import { logger } from "../../utils/logger/index.js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface MessageProps {
  [key: string]: JsonValue;
}

export enum LoggerLevel {
  INFO = 1,
  ERROR = 2,
  WARN = 3,
  DEBUG = 4,
}

export const responseBody = (
  req: ServerRequest,
  res: ServerResponse,
  statusCode: number,
  message: MessageProps,
  loggerMessage: string,
  loggerLevel: LoggerLevel,
  headers: OutgoingHttpHeaders = {
    "Content-Type": "application/json",
  }
) => {
  if (res.headersSent) return;
  switch (loggerLevel) {
    case LoggerLevel.INFO:
      logger.I("[INFO]: " + loggerMessage);
      break;
    case LoggerLevel.ERROR:
      logger.E("[ERROR]: " + loggerMessage);
      break;
    case LoggerLevel.WARN:
      logger.W("[WARN]: " + loggerMessage);
      break;
    case LoggerLevel.DEBUG:
      logger.D("[DEBUG]: " + loggerMessage);
      break;
  }

  // Merge default headers with provided headers
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  res.writeHead(statusCode, finalHeaders);
  res.end(JSON.stringify({ ...message }));
};
