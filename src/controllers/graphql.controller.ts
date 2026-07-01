import type { ServerResponse } from "node:http";
import type { ServerRequest } from "../types/server.js";
import { safeWrapper } from "../utils/wrappers/safe.js";
import { LoggerLevel, responseBody } from "../lib/response_tr/response.js";
import { defaultFieldResolver, graphql } from "graphql";
import { userResolvers } from "../graphql/resolvers/user.resolver.js";
import { schema } from "../graphql/schema.js";
import { conversationResolvers } from "../graphql/resolvers/conversation.resolver.js";


export class GraphQLController {
    /**
     * Graphql handler
     */
    public static async graphqlHandler(request: ServerRequest, respose: ServerResponse) {
        const { error } = await safeWrapper(async () => {
            const { query, variables } = request.body || {};
        
            if (!query) {
                responseBody(request, respose, 400, { errors: [{ message: 'GraphQL query is missing' }] }, "Graphql query is missing", LoggerLevel.INFO, { 'Content-Type': 'application/json' })
                return;
            }

            const result = await graphql({
                schema: schema,
                source: query,
                rootValue: {},
                contextValue: request.user,
                variableValues: variables,
                fieldResolver: (source: any, args: any, context: any, info: any) => {
                    if (info.parentType?.name === "Query") {
                        const conversationResolver = (conversationResolvers.Query as Record<string, any> | undefined)?.[info.fieldName];
                        if (typeof conversationResolver === "function") {
                            return conversationResolver(source, args, context, info);
                        }

                        const resolver = (userResolvers.Query as Record<string, any> | undefined)?.[info.fieldName];
                        if (typeof resolver === "function") {
                            return resolver(source, args, context, info);
                        }
                    }

                    if (info.parentType?.name === "Mutation") {
                        const resolver = (userResolvers.Mutation as Record<string, any> | undefined)?.[info.fieldName];
                        if (typeof resolver === "function") {
                            return resolver(source, args, context, info);
                        }
                    }

                    if (info.parentType?.name === "User") {
                        const resolver = (userResolvers.User as Record<string, any> | undefined)?.[info.fieldName];
                        if (typeof resolver === "function") {
                            return resolver(source, args, context, info);
                        }
                    }

                    if (info.parentType?.name === "Conversation") {
                        const resolver = (conversationResolvers.Query as Record<string, any> | undefined)?.[info.fieldName];
                        if (typeof resolver === "function") {
                            return resolver(source, args, context, info);
                        }
                    }

                    return defaultFieldResolver(source, args, context, info);
                }
            })

            if (result) {
                const responsePayload = { result: JSON.parse(JSON.stringify(result)) };
                return responseBody(request, respose, 200, responsePayload, "user fetched", LoggerLevel.INFO);
            }

            return { error: "unable to execute graph ql query" }
        })();

        if (error) {
            responseBody(request, respose, 403, { message: "" }, "internal server error: graphqlHandler", LoggerLevel.INFO)
            return;
        }
    }
}