import type { Server } from "ws";
import { logger } from "../utils/logger/index.js";
import { generateUniqueId } from "../lib/id/generateUniqueId.js";
import { WebSocket } from "ws";
import { SocketController } from "./socket.controller.js";


export const clients = new Map<string, WebSocket>();


export const InitSocket = (wss: Server) => {
  logger.I("Initializing WebSocket server...");

  wss.on("connection", (ws: WebSocket) => {
    const clientId = generateUniqueId(); 
    clients.set(clientId, ws);
    logger.I("client connected with ID: " + clientId);

    new SocketController(wss, ws).getInstance().registerSocketEvents();

    ws.on("close", () => {
      clients.delete(clientId);
      logger.I("client disconnected with ID: " + clientId);
    });


  });
};
