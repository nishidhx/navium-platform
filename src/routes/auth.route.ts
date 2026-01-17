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
        this.routeHandler.addRoute({ method: HTTPMETHOD.GET, path: "/x2", handler: (req, res) => {
            res.end(JSON.stringify({message: "Hello from the auth routes"}));
            return {}
        }, description: "checking"});    
    }

    /**
     * get auth routes
     */
    public _get_auth_routes() {
        return this.routeHandler;
    }
}