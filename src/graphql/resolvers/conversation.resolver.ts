import type { ConversationType } from "@prisma/client";
import { prisma } from "../../lib/prisma/prisma.js";
import { logger } from "../../utils/logger/index.js";
import { LoggerLevel } from "../../lib/response_tr/response.js";


export const conversationResolvers = {
    Query: {
        getConversationbyId: async (_: any, args: any, context: any) => {
            const { conversationId, conversationType } = args ?? {};
            const username = context?.user ?? context?.username;
            const conversation_type = typeof conversationType === 'string'
                ? (conversationType.toUpperCase() as unknown as ConversationType)
                : undefined;

            logger.I(`conversationId: ${conversationId}, conversationType: ${conversation_type}, username: ${username}`);

            if (!username) {
                throw new Error("Unauthorized");
            }

            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: {
                        some: {
                            user: {
                                username: username,
                            },
                        },
                    },
                    ...(conversation_type ? { type: conversation_type } : {}),
                },
            });

            return conversation;
        }
    }
}