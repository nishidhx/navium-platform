import { GraphQLController } from "../controllers/graphql.controller.js";
import { HTTPMETHOD } from "../types/routes.js";
import { RouteHandler } from "./route.js";

export class GraphQLRoutes  {
    /**
     * Route handler Instance
     */
    private routeHandler: RouteHandler;

    /**
     * @constructor
     */
    constructor() {
        this.routeHandler = RouteHandler.getInstance();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.routeHandler.addRoute({method: HTTPMETHOD.POST, path: "/api/v1/graphql", handler: GraphQLController.graphqlHandler})
    }


    /**
     * Get GraphQL routes
     */
    public _get_graphql_routes() {
        return this.routeHandler;
    }
}