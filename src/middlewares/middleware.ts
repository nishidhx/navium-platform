import type { ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import type { MiddlewareFunction, NextFunction } from "../types/middleware.js";

/**
 * FinalHandler type definition
 */
type FinalHandler = (request: ServerRequest, response: ServerResponse) => void;

/**
 * @method runMiddleware - executes middleware functions in sequence.
 * @param {ServerRequest} request - ServerRequest
 * @param {ServerResponse} response - ServerResponse
 * @param {MiddlewareFunction[]} middleware - Array of middleware functions to execute.
 * @param {FinalHandler} FinalHandler - FinalHandler called next.
 */
export const runMiddleware = (request: ServerRequest, response: ServerResponse, middleware: MiddlewareFunction[], FinalHandler: FinalHandler) => {
    let middlewareIdex = 0;

    const next: NextFunction = (): void => {
        const middleware_for_execution = middleware[middlewareIdex];
        middlewareIdex++;

        if (middleware_for_execution) {
            middleware_for_execution(request, response, next);
        }else {
            FinalHandler(request, response);
        }
    }

    next();
}

