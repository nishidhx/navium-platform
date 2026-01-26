import "dotenv/config";
import { prisma } from "./../lib/prisma/prisma.js"
import { logger } from "../utils/logger/index.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { NAVIUM_PHRASES } from "../lib/navium_plt_phr/navium.phrases.js";
import { MessageKey } from "../lib/navium_plt_phr/message.key.js";
import type { ServerRequest } from "../types/server.js";
import { METHODS, Server, type ServerResponse } from "node:http";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";
import { _compareHashPLTpass, _createHashStringPLT } from "../lib/conversions/hashing.js";
import { generatePLTAuthToken } from "../services/tokenGenerator.js";
import cookie from "cookie";
import { GoogleAuthService } from "../services/google.services.js";

export class AuthController {

    /**
     * @method navium_plt_register - Registers a new user.
     * @param {ServerRequest} request - a request object.
     * @param {ServerResponse} response - a response object.
     */
    public static async navium_plt_register(request: ServerRequest, response: ServerResponse) {
       logger.I(`[${"navium_plt_register"}]` + ": " +  NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_ETR])
        const {data, error} = await safeWrapper(async () => {
            const sessionTime = Date.now() + "\t" + "navium_plt";
            const clientUserAgent = request.headers["user-agent"] ?? "chrome";
            const userhteIplc = request.headers['x-forwarded-for'] ? (request.headers["x-forwarded-for"] as string).split(",")[0]?.trim() : request.socket.remoteAddress;
            / * Extracting necessary details from the request body object */
            const { username, firstname, lastname, phone_number, email, DOB, password } = request.body;
            if (!username || !firstname || !phone_number || !email || !DOB || !password) {
                if (!email.match("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$")) {
                    logger.W(NAVIUM_PHRASES[MessageKey.INVALID_EMAIL]);
                    request.end(JSON.stringify({ message: NAVIUM_PHRASES[MessageKey.INVALID_EMAIL], isRegistered: false }));
                    return { message: NAVIUM_PHRASES[MessageKey.INVALID_EMAIL] };
                }
                responseBody(request, response, 400, { message: "all the fields are necessary", session: sessionTime }, NAVIUM_PHRASES[MessageKey.NAVIUM_REG_CREDS], LoggerLevel.INFO);
                return;
            }

            const {data, error} = await safeWrapper(async () => {
                // Check if username already exists
                const existingUser = await prisma.user.findUnique({
                    where: { username: username }
                });

                if (existingUser) {
                    const errorMsg = `Username "${username}" is already taken`;
                    logger.W(errorMsg);
                    responseBody(request, response, 409, { message: errorMsg, session: sessionTime }, errorMsg, LoggerLevel.WARN);
                    return null;
                }

                const _hash_plt_passkey = await _createHashStringPLT(password);
                logger.D(`hashed password: ${_hash_plt_passkey}`);
                logger.D(`db url: ${process.env.DATABASE_URL}`);
                logger.D(`ptype: ${typeof _hash_plt_passkey}`);
                const navium_account_creation = await prisma.user.create({
                    data: {
                        username: username,
                        firstname: firstname,
                        lastname: lastname,
                        phone_number: phone_number,
                        email: email,
                        hash_pass: _hash_plt_passkey ?? "",
                        DOB: new Date(DOB)
                    }
                })

                if (!navium_account_creation) { responseBody(request, response, 417, { message: NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CR_F], session: sessionTime, userhteIplc: userhteIplc ?? ""}, NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CR_F],  LoggerLevel.WARN); return;}
                return navium_account_creation;
            })();
            
            if (error) {
                logger.E(error.message);
                responseBody(request, response, 417, { message: NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CR_F], session: sessionTime, userhteIplc: userhteIplc ?? ""}, NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CR_F],  LoggerLevel.WARN); 
            }

            if (data) {
                responseBody(request, response, 200, { message: "user created successfully", session: sessionTime }, "user registered successfully", LoggerLevel.INFO);
                return;
            }
        })();
        if (error) {
                logger.E(error.message);
                responseBody(request, response, 417, { message: NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CR_F] }, NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CR_F],  LoggerLevel.WARN); 
            }

        return data;
    }


    /**
     * @method navium_plt_google_oauth - logins user in with google oauth.
     * @param {ServerRequest} request - request object.
     * @param {ServerResponse} response - response object.
     */
    public static async navium_plt_google_oauth(request: ServerRequest, response: ServerResponse) {
        const { error } = await safeWrapper(async () => {
            const oauth_url = GoogleAuthService.generateGoogleOAuthURL();
            logger.I("Google's oauth url: " + oauth_url);
            if (!oauth_url) {
                logger.W("Google oauth url not found");
                responseBody(request, response, 500, { message: "failed to generate google oauth url" }, "failed to generate google oauth url", LoggerLevel.ERROR);
                return;
            }
            responseBody(request, response, 302, {}, "redirecting to google oauth", LoggerLevel.INFO, { Location: oauth_url });
            return;
        })();

        if (error) {
            logger.E("" + error);
            responseBody(request, response, 500, { message: "internal server error" }, "internal server error", LoggerLevel.ERROR);
            return;
        }
        responseBody(request, response, 501, { message: "not implemented yet" }, "not implemented yet", LoggerLevel.WARN);
        return;
    }

    /**
     * @method googleCallback - handles google oauth callback, verifies user, saves and creates user in the database, and returns the jwt.
     * @param {ServerRequest} request - request object
     * @param {ServerResponse} response - response object
     */
    public static async googleCallback(request: ServerRequest, response: ServerResponse): Promise<void> {
        try {
            const search = new URL(request.url ?? "/", "http://localhost:3001").searchParams;
            logger.I("google callback search params: " + search);

            / * extracting code from search parameters from the request url */
            const _google_oauth_code = search.get("code");
            logger.I("google_oauth_code: " + _google_oauth_code);
            
            if (!_google_oauth_code) {
                responseBody(request, response, 401, { message: "google oauth code not found" }, "google oauth code not found", LoggerLevel.WARN);
                return;
            }

            / * fetch google user via code */
            /**
             * @type {{
             *  googleId: string,
             *  email: string,
             *  name: string,
             *  picture: string
             * }}
             */
            const _google_user = await GoogleAuthService.getUserFromCode(_google_oauth_code);

            if (!_google_user) {
                responseBody(request, response, 500, { message: "failed to fetch google user" }, "failed to fetch google user", LoggerLevel.ERROR);
                return;
            }

            / * destructure google user */
            const { email, googleId, name, picture, DOB, phone_number } = _google_user;

            let google_oauth_user = await prisma.user.findUnique({
                where: {
                    email: email
                }, 
                select: {
                    firstname: true,
                    lastname: true,
                    id: true,
                    email: true,
                    username: true
                }
            });

            if (!google_oauth_user) {
                google_oauth_user = await prisma.user.create({
                    data: {
                        email: email,
                        username: email.split("@")[0] ?? "name" + "_google" + Date.now(),
                        firstname: name.split(" ")[0] ?? "Google",
                        lastname: name.split(" ")[1] ?? "User",
                        phone_number: phone_number ?? "0000000000",
                        hash_pass: "google_oauth_no_pass_" + Date.now(),
                        DOB: DOB ? new Date(DOB) : new Date("2000-01-01"),
                        image_url: picture
                    },
                    select: {
                        firstname: true,
                        lastname: true,
                        id: true,
                        email: true,
                        username: true
                    }
                })
            }

            const _token_creation_plt_payload = {
                username: google_oauth_user.username,
                id: google_oauth_user.id + "navium_plt",
                email: google_oauth_user.email,
                date_of_birth: DOB,
                provider: "google_oauth"
            }

            const oauth_user_plt_token = await generatePLTAuthToken(_token_creation_plt_payload, "7d");

            / * set cookie */
            const setCookieOption = cookie.serialize("plt_tk", oauth_user_plt_token + "navium_plt", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                path: "/",
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            })

            const redirectURL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL + "/accounts/profile?auth_success=true&plt="+ oauth_user_plt_token : "http://localhost:3000//accounts/profile?auth_success=true&plt="+ oauth_user_plt_token;

            responseBody(request, response, 302, { message: "user logged in successfully", authorized: true, token: oauth_user_plt_token }, "user logged in successfully", LoggerLevel.INFO, { "Set-Cookie": setCookieOption, "content-type": "application/json", location: redirectURL });
            return;
        }catch(err) {
            logger.E("Error in googleCallback: " + err);
            responseBody(request, response, 500, { message: "internal server error" }, "internal server error", LoggerLevel.ERROR);
            return;
        }
    }

    /**
     * @method navium_plt_checkIn - logins user in .
     * @param {ServerRequest} request - request object.
     * @param {ServerResponse} response - response object.
     */
    public static async navium_plt_checkIn(request: ServerRequest, response: ServerResponse) {
        logger.I(`${"[navium_plt_checkIn]"} ` + NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_CHK_ETR]);
        const { error } = await safeWrapper(async () => {
            / * extracting out username and password for user login */
            const { username, password } = request.body;

            if (!username || !password) {
                logger.I(NAVIUM_PHRASES[MessageKey.NAVIUM_REG_CREDS]);
                responseBody(request, response, 400, { message: "username and password not found" }, "credentials not found", LoggerLevel.DEBUG);
                return { message: NAVIUM_PHRASES[MessageKey.NAVIUM_REG_CREDS ]}
            }   

            const isAccountExists = await prisma.user.findUnique({
                where: {
                    username: username
                }, 
                select: {
                    id: true,
                    username: true,
                    email: true,
                    DOB: true,
                    hash_pass: true
                }
            }); 

            if (!isAccountExists) {
                logger.D(`[${this.navium_plt_checkIn.name}]: username not found `);
                responseBody(request, response, 400, { message: "username not found, try different username or password", authorized: false }, "username not found", LoggerLevel.DEBUG);
                return;
            }

            const current = new Date();
            const isCustomerPasswordValid = await _compareHashPLTpass(password, isAccountExists.hash_pass);
            const sessionTime = current.toISOString(); 

            if (!isCustomerPasswordValid) {
                logger.I("isCustomerPasswordValid: " + isCustomerPasswordValid);
                responseBody(request, response, 400, { message: NAVIUM_PHRASES[MessageKey.NAVIUM_PLT_PASS_INVALID], authorized: false, session: sessionTime + "navium_plt" }, MessageKey.NAVIUM_PLT_PASS_INVALID, LoggerLevel.WARN);
                return;
            }

            logger.D("account Exists: " + JSON.stringify(isAccountExists));
            const _token_creation_plt_payload = { username: isAccountExists.username, id: isAccountExists.id + "navium_plt", email: isAccountExists.email, date_of_birth: isAccountExists.DOB };
            const generateUserToken = await generatePLTAuthToken(_token_creation_plt_payload, "7d", );

            if (!generateUserToken) { 
                logger.E("Failed to generate user token");
                responseBody(request, response, 500, { message: "Failed to generate user token" }, "Failed to generate user token", LoggerLevel.ERROR);
                return;
            }

            const setCookieOption = cookie.serialize("plt_tk", generateUserToken + "navium_plt", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                path: "/",
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            })

            responseBody(request, response, 200, { message: "user logged in successfully", authorized: true, token: generateUserToken, session: sessionTime + "navium_plt" }, "user logged in successfully", LoggerLevel.INFO, { "Set-Cookie": setCookieOption, "content-type": "application/json" });
            return;
        })();
        logger.D("" + error)
        responseBody(request, response, 500, { message: "internal server error" }, "internal server error", LoggerLevel.ERROR);
        return;
    }

    /**
     * @method checkUserExists - checks the user coming from the redirection is authenticated or not.
     * @param {ServerRequest} request - request object.
     * @param {ServerResponse} response - response object.
     */
    public static async checkUserExists(request: ServerRequest, response: ServerResponse) {
        const { error } = await safeWrapper(() => {
            console.log(request)
            const cookies: string = "" +request.headers.cookie?.split(";")
            const cookies_obj = Object.fromEntries(cookies?.split(", ").map(pair => {
                    const [key, ...value] = pair.split("=");
                    return [key, value.join("=")]; // handles '=' inside JWT
                    })
            );
            if (!cookies_obj.plt_tk) {
                responseBody(request, response, 401, { message: "something suspicious detected", authorized: false, callbackUrl: "http://localhost:3000" }, "nav_plt_tk not found for the user authentication", LoggerLevel.WARN, {
                    location: "http://localhost:3000",
                })
                return;
            }

            const filtered_nav_plt_tk = (cookies_obj.plt_tk as string).substring(0, "navium_plt".length);

            responseBody(request, response, 200, { message: "user exists", authorized: true }, "user exists", LoggerLevel.INFO);
            return;
        })();
        if (error) {
            logger.E("" + error);
            responseBody(request, response, 500, { message: "internal server error" }, "internal server error", LoggerLevel.ERROR);
            return;
        }
        return;
    }
}