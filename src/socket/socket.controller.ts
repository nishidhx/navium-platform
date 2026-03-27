import { WebSocket } from "ws";
import type { Server } from "ws";
import { generateUniqueId } from "../lib/id/generateUniqueId.js";
import { clients } from "./index.js";



export class SocketController {
    /**
     * private websocket server instance
     */
    private ws_server_io: Server;
    private ws_server_sockets: WebSocket;
    private static SocketControllerInstance: SocketController;

    /**
     * Initializes the SocketController with WebSocket server instances
     * @param ws_server_io 
     * @param ws_server_sockets 
     */
    constructor(ws_server_io: Server, ws_server_sockets: WebSocket) {
        this.ws_server_io = ws_server_io;
        this.ws_server_sockets = ws_server_sockets;
    }

    /**
     * method to get the singleton instance of SocketContoller
     * @returns {SocketController}
     */
    getInstance(): SocketController {
        if (!SocketController.SocketControllerInstance) {
            SocketController.SocketControllerInstance = new SocketController(this.ws_server_io, this.ws_server_sockets);
            return SocketController.SocketControllerInstance;
        }

        return SocketController.SocketControllerInstance;
    }

    /**
     * Registers all the socket event listeners.
     */
    registerSocketEvents() {
        this.ws_server_sockets.on("message", (mesage) => {
            console.log("message: " + mesage.toString("utf8"));
        })
    }

    
    /**
     * Emits the to all the clients
     */
    static broadcast(event: string, payload: any) {
        const extracted_data_payload = JSON.stringify({event, payload});

        for (const client of clients.values()) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(extracted_data_payload);
            }
        }
    }

    /**
     * send to client via it's clientId.
     */
    static sendToClient(clientId: string, event: string, payload: any) {
        const extracted_data_payload = JSON.stringify({ event, payload });

        const ws_client = clients.get(clientId);

        if (ws_client && ws_client.readyState === WebSocket.OPEN) {
            ws_client.send(extracted_data_payload);
        }
    }
}
