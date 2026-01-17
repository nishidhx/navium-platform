
/**
 * Middleware types
 * @module types/middleware
 */


import type { ServerResponse } from "node:http";
import type { ServerRequest } from "./server.js";

/**
 * Next function
*/
export type NextFunction = () => void;

/**
 * Type definition for a middleware function.
 */
export type MiddlewareFunction = (req: ServerRequest, res: ServerResponse, next: NextFunction) => void;
