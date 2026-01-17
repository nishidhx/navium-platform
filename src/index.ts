import http from 'http';
import { Server } from "socket.io";
import { RouteHandler } from './routes/route.js';
import type { ServerRequest } from './types/server.js';
import { AuthRouter } from './routes/auth.route.js';

const PORT = process.env.PORT || 3001;

const routeHandler = RouteHandler.getInstance();

const authRouter = new AuthRouter();
routeHandler.addRouteFrom(authRouter._get_auth_routes());


const server = http.createServer((req, res) => {
    / * Set CORS headers */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    /* Handle OPTIONS request for CORS preflight */
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    /* Handle the route */
    routeHandler.handleRequestRoute(req as ServerRequest, res);
});

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    

    socket.on("message", (msg) => {
        console.log("Message received:", msg);
        io.emit("message", msg);
    })

    io.emit("welcome", "Welcome to the Socket.io server!");

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})