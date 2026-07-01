


export const ConversationTypeDef = `
    enum ConversationType {
        DIRECT
        GROUP       
    }

    type Conversation {
        id: ID!
        type: ConversationType!
        imageUrl: String
        name: String
        createdAt: String!
        updatedAt: String!
    }

    type ConversationParticipant {
        id: ID!
        conversationId: String!
        userId: String!
        joinedAt: String!
    }

    extend type Query {
        getConversationbyId(conversationId: String!, conversationType: ConversationType): Conversation
    }
`