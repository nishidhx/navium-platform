import type { ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { logger } from "../utils/logger/index.js";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";
import { prismaUserSafeSelect, userAuthSelect } from "../selections/userSelect.js";
import { PrismaController } from "../lib/prisma/prisma.controller.js";
import { prisma } from "../lib/prisma/prisma.js";



export class UserAccController {
 
    /**
     * @method getUserProfile - Get the profile of the user.
     */
    public static async getUserProfile(request: ServerRequest, response: ServerResponse) {
        const { data, error } = await safeWrapper(async () => {
            const { username, email } = request.user;

            const user = await prisma.user.findUnique({
                where: {    
                    username: username,
                    email: email
                }, select: prismaUserSafeSelect
            }) 

            if (user) {
                return user;
            }

            throw new Error("User not found");

        })();

        if (error) {
            logger.E("Error fetching user profile: " + error?.message);
            responseBody(request, response, 500, { message: "Internal Server Error" }, "error fetching user profile", LoggerLevel.ERROR);
        }

        if (data) {
            const safeData = JSON.parse(JSON.stringify(data));
            responseBody(request, response, 200, { message: "user authorized", data: safeData }, "user authorized", LoggerLevel.INFO);
            return;
        }

        responseBody(request, response, 200, { message: "user unauthorized", user: {/* user data */} }, "user unauthorized", LoggerLevel.INFO);
        return;
    }

    /**
     * @method getUserTalk
     */
    public static async getUserTalks(request: ServerRequest, response: ServerResponse) {
        const { data, error } = await safeWrapper(async () => {
            const userId = request?.user?.id

            if (!userId) {
                logger.D("Userid: " + userId)
                throw new Error("UserId not found");
            }

            const conversations = await prisma.conversation.findMany({
                where: {
                        participants: { some: { userId: userId } },
                },
                orderBy: { updatedAt: "desc" },
                include: {
                    participants: { select: { user: { select: {
                                    id: true,
                                    username: true,
                                }
                            }
                        }
                    },
                    messages: { orderBy: { createdAt: "desc" },
                        take: 1
                    }
                },
            });

            return conversations;
        })();

        if (error) {
            logger.E("Error fetching user talks: " + error?.message);
            return responseBody(request, response, 500, { message: "Internal Server Error" }, "error fetching user talks", LoggerLevel.ERROR);
        }

        if (data) {
            const conversations = JSON.parse(JSON.stringify(data))
            return responseBody(request, response, 200, { conversations: conversations }, "Conversations fetched successfully", LoggerLevel.INFO);
        }

        return responseBody(request, response, 200, { message: "user unauthorized", user: {/* user data */} }, "user unauthorized", LoggerLevel.INFO);
    }
}