import type { ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { logger } from "../utils/logger/index.js";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";



export class UserAccController {
 
    /**
     * @method getUserProfile - Get the profile of the user.
     */
    public static async getUserProfile(request: ServerRequest, response: ServerResponse) {
        const { error } = await safeWrapper(() => {
            / * */

        })();

        if (error) {
            logger.E("Error fetching user profile: " + error.message);
            responseBody(request, response, 500, { message: "Internal Server Error" }, "error fetching user profile", LoggerLevel.ERROR);
        }

        logger.D(request.token);
        logger.D(JSON.stringify(request.user));


        if (request.user.authentic) {
            responseBody(request, response, 200, { message: "User profile fetched successfully", user: request.user }, "user profile fetched", LoggerLevel.INFO);
        }
        responseBody(request, response, 200, { message: "user unauthorized", user: {/* user data */} }, "user unauthorized", LoggerLevel.INFO);
        return;
    }
    
}