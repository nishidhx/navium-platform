import { IncomingMessage } from "node:http";

export interface ServerRequest extends IncomingMessage {
    parms: Record<string, string>;
    query: Record<string, string>;
    body: any;
    [key: string]: any;
}