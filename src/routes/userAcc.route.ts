import { UserAccController } from "../controllers/userAcc.controller.js";
import { HTTPMETHOD } from "../types/routes.js";
import { RouteHandler } from "./route.js";


export class UserAccRouter {
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
        this.routeHandler.addRoute({ method: HTTPMETHOD.GET, path: "/api/v1/user/account", handler: UserAccController.getUserProfile, description: "to get the user account"});    
    }

    /**
     * get user acc routes
     */
    public _get_user_acc_routes() {
        return this.routeHandler;
    }
}