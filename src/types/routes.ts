import type { ServerResponse } from "node:http";
import type { ServerRequest } from "./server.js";


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
    handler: (request: ServerRequest, response: ServerResponse) => void | object;
    middleware?: (() => void | object)[];
    description?: string;
}