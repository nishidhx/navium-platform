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
            const { event, data } = JSON.parse(raw);

            switch (event) {
                case "message": 
                    this.handleEvents(ws, clientId, data);
                    break;
                case "ping":
                    ws.send(JSON.stringify({ event: "pong" }));
                    break;
                case "private_message": 
                    this.handleOneToOneMessage(ws, clientId, event, data);
            }
        }catch(err) {

        }
    }
    
}