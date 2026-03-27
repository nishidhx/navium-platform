import type { Server } from "ws";
import type WebSocket from "ws";
import { logger } from "../utils/logger/index.js";
import { generateUniqueId } from "../lib/id/generateUniqueId.js";
import { SocketController } from "./socket.controller.js";
import { SocketEvents } from "./socket.event.js";
import type { WebSocketServer } from "ws";


export const clients = new Map<string, WebSocket>();


export const InitSocket = (wss: WebSocketServer) => {
  logger.I("Initializing WebSocket server...");

  wss.on("connection", (ws: WebSocket) => {
    const clientId = generateUniqueId(); 
    clients.set(clientId, ws);
    logger.I("client connected with ID: " + clientId);

    new SocketController(wss, ws).getInstance().registerSocketEvents();

    ws.on("message", data => {
      SocketEvents.handleEvents(ws, clientId, data.toString());      
    })

    ws.on("close", () => {
      clients.delete(clientId);
      logger.I("client disconnected with ID: " + clientId);
    });


  });
};
