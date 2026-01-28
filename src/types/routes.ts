import type { ServerResponse } from "node:http";
import type { ServerRequest } from "./server.js";
import type { MiddlewareFunction } from "./middleware.js";


export enum HTTPMETHOD {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}

export interface DefaultRouteOptions {
    method: HTTPMETHOD;
    path: string;        
    handler: (request: ServerRequest, response: ServerResponse) => void | object | Promise<void | object>;
    middleware?: MiddlewareFunction[];
    description?: string;
}