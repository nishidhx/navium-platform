import type { ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import { logger } from "../utils/logger/index.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { prisma } from "../lib/prisma/prisma.js";
import { responseBody } from "../lib/response_tr/response.js";
import { LoggerLevel } from "../lib/response_tr/response.js";
import type { ConversationType } from "@prisma/client";

export class ConversationController {

    /**
     * @method getConversationbyId
     */
    public static async getConversationbyId(request: ServerRequest, response: ServerResponse) {
        const { data, error } = await safeWrapper(async () => {
            const conversationId = request.params?.conversationId as string;
            const conversation_type = (request.params?.conversation_type as string).toUpperCase() as ConversationType;
            if (!conversationId) throw new Error("conversation not found")
    

            const convesrationMessages = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    type: conversation_type,
                    participants: {
                        some: {
                            userId: request?.user?.id,
                        }
                    }
                },
                select: {
                    id: true,
                    type: true,
                    participants: {
                        select: {
                            id: true,
                            userId: true,
                                user: {
                                select: {
                                    username: true,
                                    firstname: true,
                                    lastname: true,
                                    image_url: true
                                }}
                        },
                        
                    },
                    messages: {
                        orderBy: {
                            createdAt: "asc"
                        },
                        select: {
                            content: true,
                            postId: true,
                            type: true,
                            createdAt: true,
                            sender: {
                                select: {
                                    username: true,
                                    id: true,
                                    firstname: true,
                                    lastname: true
                                }
                            }
                        }
                    }
                },
            })

            // if (!convesrationMessages || convesrationMessages.participants.length !== 2) return null;

            return convesrationMessages
        })()

        if (error) {
            responseBody(request, response, 500, { message: "Internal Server Error" }, "error fetching conversation messages", LoggerLevel.ERROR);
            logger.E("Error fetching conversation messages: " + error?.message);
            return;
        }

        if (data) {
            const safeData = JSON.parse(JSON.stringify(data));
            responseBody(request, response, 200, { message: "conversation messages fetched successfully", data: safeData }, "conversation messages fetched successfully", LoggerLevel.INFO);
            return;
        }

        responseBody(request, response, 404, { message: "conversation messages not found" }, "conversation messages not found", LoggerLevel.INFO);
        return;
    }
}