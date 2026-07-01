export const MessagesTypeDef = `
    enum MessageType {
        TEXT
        IMAGE
        VIDEO
        FILE
        POST_SHARE
    }

    type MessageRead {
        id: ID!
        messageId: ID!
        userId: ID!
        readAt: String!
    }

    type MessageAttachment {
        id: ID!
        messageId: ID!
        url: String!
        type: String!
        createdAt: String!
    }

    type Message {
        id: ID!
        conversationId: ID!
        senderId: ID!
        content: String!
        postId: ID
        type: MessageType!
        createdAt: String!
        reads: [MessageRead!]
        attachments: [MessageAttachment!]
    }
`