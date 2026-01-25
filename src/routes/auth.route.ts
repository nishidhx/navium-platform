import { AuthController } from "../controllers/auth.controller.js";
import { HTTPMETHOD } from "../types/routes.js";
import { RouteHandler } from "./route.js";


export class AuthRouter {
    /** 
    * Route Handler Instance
    */   
    private routeHandler: RouteHandler;
    
    /**
     * Constructor
     */
    constructor() {
        this.routeHandler = RouteHandler.getInstance();
        this.initializeRoutes()
    }

    /**
     * Routes Initializers
     */
    private initializeRoutes() {
        this.routeHandler.addRoute({ method: HTTPMETHOD.POST, path: "/api/v1/register_plt", handler: AuthController.navium_plt_register, description: "checking"});    
        this.routeHandler.addRoute({ method: HTTPMETHOD.POST, path: "/api/v1/checkin_plt", handler: AuthController.navium_plt_checkIn.bind(AuthController), description: "checking"});    
        this.routeHandler.addRoute({ method: HTTPMETHOD.GET, path: "/api/v1/auth/google", handler: AuthController.navium_plt_google_oauth, description: "google oauth" });
        this.routeHandler.addRoute({ method: HTTPMETHOD.GET, path: "/api/v1/auth/google/callback", handler: AuthController.googleCallback, description: "google oauth" });
    }

    /**
     * get auth routes
     */
    public _get_auth_routes() {
        return this.routeHandler;
    }
}