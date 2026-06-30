import { ConversationController } from "../controllers/conversation.controller.js";
import { AuthMiddleware } from "../middlewares/authMiddleware.js";
import { HTTPMETHOD } from "../types/routes.js";
import { RouteHandler } from "./route.js";


export class ConversationsRouter {
    /**
     * Route handler for ConversationsRouter
     */
    private routeHandler: RouteHandler;

    /**
     * Constructor
     */
    constructor() {
        this.routeHandler = RouteHandler.getInstance();
        this.initializeRoutes();
    }

    /**
     * ConversationRoutes Initializer
     */
    private initializeRoutes() {
        this.routeHandler.addRoute({ method: HTTPMETHOD.GET, path: "/api/v1/conversation/user/:conversation_type/t/:conversationId", handler: ConversationController.getConversationbyId, middleware: [AuthMiddleware.extractToken, AuthMiddleware.extractDataFromToken, AuthMiddleware.checkUserAuthentic], description: "used to fetch the conversations between the conversation participants" })
    }

    /**
     * get conversation routes
     */
    _get_conversation_routes() {
        return this.routeHandler;
    }
}