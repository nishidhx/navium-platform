import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";
import type { DefaultRouteOptions } from "../types/routes.js"
import { logger } from "../utils/logger/index.js";
import url from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import { runMiddleware } from "../middlewares/middleware.js";
import { HTTPMETHOD } from "../types/routes.js";


export class RouteHandler {

    private static instance: RouteHandler;
    private static readonly SAFE_QUERY_PARAM_REGEX = /^(?![.-])(?!.*\.\.)[A-Za-z0-9._~-]{1,100}$/;
    private static readonly SAFE_PARAM_REGEX =/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,98}[a-zA-Z0-9])?$/;

    /**
     * @private {DefaultRouteOptions[]} - static array to hold all registered routes.
     */
    private routes: DefaultRouteOptions[] = [];

    /**
     * @constructor - initializes the empty routes array in the route handler .
     */
    constructor() {
        this.routes = [];
        this.addRoute({ method: HTTPMETHOD.GET, path: "/", handler: (req: ServerRequest, res: ServerResponse) => {
            res.end(JSON.stringify({message: "Hello from the server"}));
            return {}
        }, middleware: [], description: "get request for checking"});
    }

    /**
     * only runs a single instance of routeHandler 
     */
    public static getInstance(): RouteHandler{
        if (!RouteHandler.instance) {
            RouteHandler.instance = new RouteHandler();
        }
        return RouteHandler.instance;
    }


    /**
     * @method addRoute - adds a new route to the static routes array.
     * @param {DefaultRouteOptions} routeOptions - options for the new routes.
     * @returns {number} 
    */
    public addRoute(routeOptions: DefaultRouteOptions): number {
        logger.D(`Registering new route: [${routeOptions.method}] ${routeOptions.path} ${routeOptions.middleware ? 'with middleware' : 'without middleware'}`);
        this.routes.push(routeOptions);
        return this.routes.length
    }

    public addRouteFrom(other: RouteHandler) {
        this.routes.push(...other.routes)
    }

    /**
     * @method getRoutes - retrieves all the registered routes.
     * @returns {string[]} - array of registered routes.
     */
    public getRoutes(): string[] {
        return this.routes.map(route => `[${route.method} ${route.path} - ${route.description ?? 'No description'}]`);
    }

    /**
     * @method handleRequestRoutes - handles incoming requests and validate if the route exists.
     * @param {Http2ServerRequest} request - HTTP request.
     * @param {Http2ServerResponse} response - HTTP response.
     */
    public async handleRequestRoute(request: ServerRequest, response: ServerResponse) {
        try {
            const routes = this.routes;
            const requestMethod = request.method ?? "GET";
            const parsedUrl = url.parse(request.url || '', true);
            const requestPathname = parsedUrl.path || "/";
            logger.D(`Handling request route: method=${requestMethod}, pathname=${requestPathname}`);

            console.log(requestPathname);
            console.log(parsedUrl);
                for (const route of routes) {
                const isRouteMactched = await RouteHandler.validateRoutePath(route.path, requestPathname || "", request as unknown as Http2ServerRequest);
                const isEndpointSafe = RouteHandler.validateRouteEndpoint(route.path, requestPathname);
                logger.W(`Route Endpoint Safe: ${isEndpointSafe} : ${requestPathname}`)
                logger.D(`Route match result for [${route.method}] ${route.path}: ${isRouteMactched?.matched}`);

                if (route.method === requestMethod && isRouteMactched?.matched) {
                    request.params = isRouteMactched.params ?? {}
                    logger.D(`req params: ${JSON.stringify(request.params)}`)
                    request.query = isRouteMactched.query ?? {}
                    logger.D(`req query: ${JSON.stringify(request.query)}`)
                    request.body = isRouteMactched.body ?? {}
                    logger.D(`req body: ${JSON.stringify(request.body)}`)
                
                    logger.D(`Condition: ${Boolean(route.middleware && (route.middleware?.length ?? [].length) > 0)}`)

                    if (route.middleware && (route.middleware?.length ?? [].length) > 0) {
                        logger.I("Middleware Entered");
                        / * Enters the middleware */
                        runMiddleware(request, response, route.middleware, route.handler);
                        return;
                    }else {
                        logger.I("no middleware found");
                        return route.handler(request, response);
                    }
                }

                    // continue to next route if not matched; final 404 handled after loop
            }
                // No route matched after checking all registered routes
                logger.I("route not found");
                response.statusCode = 404;
                response.end(JSON.stringify({ message: "404 route not found" }));
        }catch (error) {
            logger.E(`Error handling request route: ${(error as Error).message}`);
            return null;
        }
    }

    /**
     * @method validateRoutePath - validates if the request path matches the route path.
     * @param routePath 
     * @param requestPath 
     * returns: a boolean indicating if the paths match, along with any extracted params, query, and body.
     *  {
     *      matched: boolean,
     *      params: Record<string, string>,
     *      query: Record<string, string>,
     *      body: requestBody
     *  }
     */
    private static async validateRoutePath(routePath: string, requestPath: string, request: Http2ServerRequest) {
        try {
            logger.D(`Validating route path: routePath=${routePath}, requestPath=${requestPath}`);
            
            / * Required Query Parameters */
            const [pathWithoutQuery, queryString] = requestPath.split("?");

            logger.D(`query string: ` + queryString);
            
            / * Path segements */
            const routePathSegements = routePath.split("/").filter(seg => seg.length > 0);
            const requestPathSegements = pathWithoutQuery?.split("/").filter(seg => seg.length > 0);
            const routePathSegementsLength = routePathSegements.length;
            const requestPathSegementsLength = requestPathSegements?.length || 0;

            // Special-case: both route and request are root ("/") -> zero segments
            if (routePathSegementsLength === 0 && requestPathSegementsLength === 0) {
                const requestQuery: Record<string, string> = {};
                if (queryString && queryString.length > 0) {
                    const pairs = queryString.split("&");
                    for (const queryPair of pairs) {
                        const [queryKey, queryValue] = queryPair.split("=");
                        if (queryKey && RouteHandler.SAFE_QUERY_PARAM_REGEX.test(queryValue ?? "")) {
                            requestQuery[decodeURIComponent(queryKey)] = decodeURIComponent(queryValue ?? "");
                        }
                    }
                }

                const requestBody = await RouteHandler.parseRequestBody(request as unknown as IncomingMessage);
                return { matched: true, params: {}, query: requestQuery, body: { ...requestBody } };
            }

            / * Early return if segment lengths do not match */
            if (routePathSegements.length !== requestPathSegements?.length) {
                logger.D(`Segment length mismatch: routeSegments=${routePathSegementsLength}, requestSegments=${requestPathSegementsLength}, routePath=${routePath}, requestPath=${requestPath}`);
                return { matched: false, params: {}, query: {}, body: {}};
            }

            const params: Record<string, string> = {};  
            for (let idx=0; idx < routePathSegementsLength; idx++) {
                const routeSegment = routePathSegements[idx];
                const requestPathSegement = requestPathSegements ? requestPathSegements[idx] : "";

                / * Early return if any of the route and request segement not found  */
                if (!routeSegment || !requestPathSegement) return { matched: false, params: {}, query: {}, body: {}};

                if (routeSegment.startsWith(":")) {
                    logger.W(`reqSegment safe param test: ${RouteHandler.SAFE_PARAM_REGEX.test(requestPathSegement)}`)
                    logger.D(`Extracting prams: routeSegment=${routeSegment}, requestSegment=${requestPathSegement}`);
                    if (!RouteHandler.SAFE_PARAM_REGEX.test(requestPathSegement)) {
                        logger.D(`Unsafe parameter value detected: ${requestPathSegement}`);
                        return { matched: false, params: {}, query: {}, body: {}};
                    }   

                    / * Extract the param name from the idx of 1 */
                    const paramName = routeSegment ? routeSegment.slice(1) ? routeSegment.slice(1) : "" : "" ;
                    / * Assign the request segement to the params object */
                    /* e.g., /user/:id  => params = { id: 'requestPathSegement' } */
                    params[paramName] = requestPathSegement; / * Dyanmic params */
                    continue;
                }else if (routeSegment !== requestPathSegement) {
                    return { matched: false, params: {}, query: {}, body: {}}
                }
            }

            / * Parse Query parameters after all segments match */
            const requestQuery: Record<string, string> = {};
            if (queryString && queryString?.length > 0) {
                const pairs = queryString.split("&");
                for (const queryPair of pairs) {
                    const [queryKey, queryValue] = queryPair.split("=");
                    if (queryKey && RouteHandler.SAFE_QUERY_PARAM_REGEX.test(queryValue ?? "")) {
                        requestQuery[decodeURIComponent(queryKey)] = decodeURIComponent(queryValue ?? "");
                    }
                }
            }

            const requestBody = await RouteHandler.parseRequestBody(request as unknown as IncomingMessage);

            return { matched: true, params: params, query: requestQuery, body: {...requestBody}}

        }catch (error) {
            logger.E(`Error validating route path: ${(error as Error).message}`);
        }

    }

    /**
     * @method parseRequestBody - parses the request body as JSON.
     * @param {IncomingMessage} request  
     * @returns {Promisee<Object>} - parsed request body object. 
     */ 
    private static parseRequestBody(request: IncomingMessage): Promise<Object> {
        return new Promise((resolve, reject) => {
            / * Accumulate data chunks */ 
            let requestBody = "";

            / * data channel */
             request.on("data", (chunks) => {
                requestBody += chunks.toString();
             });

             / * end channel and parse JSON */
             request.on("end", () => {
                try {
                    logger.D(`Parsing request body: ${requestBody}`);
                    const parsedBody = JSON.parse(requestBody || "{}");
                    resolve(parsedBody);
                }catch (error) {
                    logger.E(`Error parsing request body: ${(error as Error).message}`)
                    reject(error);
                }
             });

             / * error channel */
             request.on("error", (err) => {
                logger.E(`Request error while parsing body: ${err.message}`);
                reject(err);
             })
        })
    }

        /**
     * Validates whether a given pathname safely matches a predefined endpoint route.
     *
     * This method performs **segment-by-segment route validation** instead of
     * raw string comparison, making it safer against malformed or injected paths.
     *
     * How it works:
     * 1. Splits both `endpoint_route` and `pathname` by `/` into individual segments.
     * 2. Removes empty segments to avoid false matches caused by leading/trailing slashes.
     * 3. Ensures both routes have the **same number of segments**.
     * 4. Compares each segment:
     *    - Static segments must match exactly.
     *    - Dynamic segments (prefixed with `:`) are validated against
     *      a strict allow-list regex.
     * 5. Fails immediately on the first mismatch (fail-fast).
     *
     * Example:
     * ```ts
     * validateRouteEndpoint("/api/user/:id", "/api/user/123"); // true
     * validateRouteEndpoint("/api/user/:id", "/api/user/../admin"); // false
     * validateRouteEndpoint("/api/user/:id", "/api/user/123/extra"); // false
     * ```
     *
     * @param {string} endpoint_route
     * The expected route pattern (can include dynamic params like `:id`).
     *
     * @param {string} pathname
     * The actual route/pathname received from the request.
     *
     * @returns {boolean}
     * Returns `true` if the pathname safely matches the endpoint route,
     * otherwise returns `false`.
     */
    private static validateRouteEndpoint(endpoint_route: string = "", pathname: string = ""): boolean {
      const pathnamePackets = pathname.split("/").filter(Boolean);
      const endpointPackets = endpoint_route.split("/").filter(Boolean);

      // Step 1: Route structure must match
      if (pathnamePackets.length !== endpointPackets.length) {
        return false;
      }

      // Step 2: Validate each route segment
      for (let i = 0; i < endpointPackets.length; i++) {
        const expected = endpointPackets[i];
        const actual = pathnamePackets[i];

        // Step 3: Handle dynamic parameters (e.g., :id)
        if (expected?.startsWith(":")) {
          // Allow only safe characters for dynamic values
          if (!/^[A-Za-z0-9_-]{1,64}$/.test(actual ?? "")) {
            return false;
          }
          continue;
        }

        // Step 4: Static segments must match exactly
        if (expected !== actual) {
          return false;
        }
      }

      // Step 5: All checks passed — route is safe
      return true;
    }

}