import type { ServerResponse } from "node:http";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";
import type { ServerRequest } from "../types/server.js";
import { logger } from "../utils/logger/index.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import type { NextFunction } from "../types/middleware.js";
import verifyPLTAuthToken from "../services/tokenGenerator.js";
import { extname } from "node:path";
import { prisma } from "../lib/prisma/prisma.js";
import { userSafeSelect } from "../selections/userSelect.js";



export class AuthMiddleware {

    /**
     * @method getSessionTime - get the current session time for AuthMiddleware.
     */
    public static getSessionTime(): string {
        return new Date().toISOString();
    }

    /**
     * @method extractToken - Extracts the token from the request headers.
     */
    public static async extractToken(request: ServerRequest, response: ServerResponse, next: NextFunction) {
        const { data, error } = await safeWrapper((): string | null => {
            logger.I("Extracting token from cookies");
            console.log("Cookies: ", request.headers);
            const cookies = "" + request.headers.cookie?.split(";");
            const cookies_obj = Object.fromEntries(cookies.split(",").map(cooke => {
                const [key, ...value] = cooke.trim().split("=");
                return [key, value.join("=")];
            }))

            logger.I(JSON.stringify(cookies_obj));

            if (!cookies_obj.plt_tk) {
                responseBody(request, response, 401, { message: "something suspicious detected", authorized: false, callbackUrl: "http://localhost:3000", session: AuthMiddleware.getSessionTime() }, "nav_plt_tk not found for the user authentication", LoggerLevel.WARN, {
                    location: "http://localhost:3000",
                })
                return null;
            }
            return cookies_obj.plt_tk;
        })();

        if (error) {
            logger.E("Failed Extracting token......");
            responseBody(request, response, 500, { message: "Something went wrong", authorized: false, callbackUrl: "http://localhost:3000", session: AuthMiddleware.getSessionTime()}, "Internal Server error failed Extracting token", LoggerLevel.ERROR);
            return;
        }

        if (data) {
            request.token = data;
        };

        next();
        return;
    } 

    /**
     * @method extractDataFromToken - Extracts user data from the token.
     */
    public static async extractDataFromToken(request: ServerRequest, response: ServerResponse, next: NextFunction)  {
        const { data, error } = await safeWrapper(async () => {
            / * get token from the request Object */
            const plt_tk_token = request.token ? request.token : "";
            logger.I(plt_tk_token)
            if (!plt_tk_token) {
                responseBody(request, response, 401, { message: "something suspicious detected", authorized: false, session: AuthMiddleware.getSessionTime() }, "unable to extract plt_tk token from the request Object", LoggerLevel.DEBUG);
                return;
            }

            const filtered_nav_plt_tk = plt_tk_token.substring(0, plt_tk_token.length - "navium_plt".length);
            logger.I("filtered_nav_plt_tk: " + filtered_nav_plt_tk);
            const extractTokenPayload = await verifyPLTAuthToken(filtered_nav_plt_tk); 

            logger.I(JSON.stringify(extractTokenPayload))
            if (!extractTokenPayload) { responseBody(request, response, 401, { message: "Token isn't authenticated", authorized: false, session: AuthMiddleware.getSessionTime() }, "unable to extract payload from the token", LoggerLevel.WARN); return;}

            return { user: extractTokenPayload.username, email: extractTokenPayload.email, DOB: extractTokenPayload.date_of_birth }
        })()

        if (error) {
            logger.E("Failed Extracting token......");
            responseBody(request, response, 500, { message: "Something went wrong", authorized: false, callbackUrl: "http://localhost:3000", session: AuthMiddleware.getSessionTime()}, "Internal Server error failed Extracting token", LoggerLevel.ERROR);
            return;
        }

        if (data) {
            request.user = data;
        }

        next();
        return;
    }

    /**
     * @method checkUserAuthenticAndFetchData - checks the users exists or not;
     */
    public static async checkUserAuthenticAndFetchData(request: ServerRequest, response: ServerResponse, next: NextFunction) {
        const { data, error } = await safeWrapper(async () => {
            const extractedUserPayload = request.user;

            / * Check if the user exists in the db */
            const checkUserExists = await prisma.user.findUnique({
                where: {
                    username: extractedUserPayload.username,
                    email: extractedUserPayload.email
                },select : userSafeSelect
            })

            if (!checkUserExists) { responseBody(request, response, 401, { message: "user not found", authorized: false, session: AuthMiddleware.getSessionTime() }, "user not found", LoggerLevel.INFO); return;};

            logger.D("->>>>>>>>>>>>> " + JSON.stringify(checkUserExists));
            return { authentic: true, id: checkUserExists.id };
        })();

        if (error) {
            logger.E("Failed Extracting token......");
            responseBody(request, response, 500, { message: "Something went wrong", authorized: false, callbackUrl: "http://localhost:3000", session: AuthMiddleware.getSessionTime()}, "Internal Server error failed Extracting token", LoggerLevel.ERROR);
            return;
        }

        if (data) {
            request.user = { ...request.user, ...data};
        }

        next();
        return;
    }

    /**
     * @method checkUserAuthentic - checks the users exists or not;
     */
    public static async checkUserAuthentic(request: ServerRequest, response: ServerResponse, next: NextFunction) {
        const { data, error } = await safeWrapper(async () => {
            const extractedUserPayload = request.user;
            / * Check if the user exists in the db */
            const checkUserExists = await prisma.user.findUnique({
                where: {
                    username: extractedUserPayload.username,
                    email: extractedUserPayload.email
                }, 
                select: {
                    id: true,
                    username: true,
                    email: true,
                    
                }
            })

            if (!checkUserExists) { responseBody(request, response, 401, { message: "user not found", authorized: false, session: AuthMiddleware.getSessionTime() }, "user not found", LoggerLevel.INFO); return;};

            logger.D(JSON.stringify(checkUserExists));
            return { authentic: true, id: checkUserExists.id };
        })();

        if (error) {
            logger.E("Failed Extracting token......");
            responseBody(request, response, 500, { message: "Something went wrong", authorized: false, callbackUrl: "http://localhost:3000", session: AuthMiddleware.getSessionTime()}, "Internal Server error failed Extracting token", LoggerLevel.ERROR);
            return;
        }

        if (data) {
            request.user = { ...request.user, ...data};
        }

        next();
        return;
    }

}