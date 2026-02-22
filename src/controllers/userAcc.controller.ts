import type { ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { logger } from "../utils/logger/index.js";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";
import { userAuthSelect } from "../selections/userSelect.js";



export class UserAccController {
 
    /**
     * @method getUserProfile - Get the profile of the user.
     */
    public static async getUserProfile(request: ServerRequest, response: ServerResponse) {
        const { data, error } = await safeWrapper(() => {
            / * * Fetch user profile from request object, which is populated by auth middleware */   
            const condition_check = Boolean(request.user2 && request.user.id && request.token);        
            logger.W(">>>>>>>>> condition_check: " + condition_check );
            return {user: 1};
        })();

        if (error) {
            logger.E("Error fetching user profile: " + error.message);
            responseBody(request, response, 500, { message: "Internal Server Error" }, "error fetching user profile", LoggerLevel.ERROR);
        }

        if (data) {
            responseBody(request, response, 200, { message: "user authorized", user: data }, "user authorized", LoggerLevel.INFO);
            return;
        }

        responseBody(request, response, 200, { message: "user unauthorized", user: {/* user data */} }, "user unauthorized", LoggerLevel.INFO);
        return;
    }
    
}