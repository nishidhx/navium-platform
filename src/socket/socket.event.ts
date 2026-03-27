import type { WebSocket } from "ws";
import { logger } from "../utils/logger/index.js";
import { clients } from "./index.js";
import { SocketController } from "./socket.controller.js";


export class SocketEvents {
    /**
     * handles user message
     */
    static handleMessage(ws: WebSocket, clientId: string, data: any) {
        logger.I("User " + clientId + " says: " + data)

        SocketController.broadcast("message", {
            senderId: clientId,
            message: data
        })
    }

    /**
     * handle one to one pvt message
     */
    static handleOneToOneMessage(ws: WebSocket, clientId: string, event: string, data: any) {
        logger.I("User " + clientId + " " + "wants to send a message to receiver: " + data.receiverId + " " + data);

        const { receiverId, message } = data;

        const target = clients.get(receiverId);
        if (!target) {
            ws.send(JSON.stringify({
                event: "error",
                data: "User not found"
            }));
            return;
        }

        SocketController.sendToClient(receiverId, event, {
            senderId: clientId, 
            message: message
        })
    }

    /**
     * handle webSocket events
     */
    static handleEvents(ws: WebSocket, clientId: string, raw: string) {
        try {
            const payload = JSON.parse(raw);

            if (payload && typeof payload === "object" && "event" in payload) {
                const { event, data } = payload;

                switch (event) {
                    case "message":
                        this.handleMessage(ws, clientId, data);
                        break;
                    case "ping":
                        ws.send(JSON.stringify({ event: "pong" }));
                        break;
                    case "private_message":
                        this.handleOneToOneMessage(ws, clientId, event, data);
                        break;
                    default:
                        logger.W("Unknown socket event: " + event);
                        break;
                }
            } else {
                // Fallback: raw text message broadcast
                this.handleMessage(ws, clientId, raw);
            }
        } catch (err) {
            // If raw text is not JSON, broadcast it as plain text.
            if (typeof raw === "string" && raw.trim().length > 0) {
                this.handleMessage(ws, clientId, raw);
                return;
            }

            logger.E("SocketEvents.handleEvents error: " + err);
            ws.send(JSON.stringify({ event: "error", data: "Invalid message format" }));
        }
    }
    
}