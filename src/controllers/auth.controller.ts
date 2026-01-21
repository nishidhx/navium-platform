import "dotenv/config";
import { prisma } from "./../lib/prisma/prisma.js"
import { logger } from "../utils/logger/index.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { NAVIUM_PHRASES } from "../lib/navium_plt_phr/navium.phrases.js";
import { MessageKey } from "../lib/navium_plt_phr/message.key.js";
import type { ServerRequest } from "../types/server.js";
import { METHODS, type ServerResponse } from "node:http";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";
import { _createHashStringPLT } from "../lib/conversions/hashing.js";

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
    }

}