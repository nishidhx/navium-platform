import type { WebSocket } from "ws";
import type { Server } from "ws";



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
    getInstance() {
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
}