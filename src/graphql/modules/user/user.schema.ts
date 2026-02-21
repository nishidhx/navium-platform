import { buildSchema } from "graphql";


export const Schema = buildSchema(`
    type User {
        id: ID!
        username: String!
        email: String!
        firstname: String!
        lastname: String!
        phone_number: String!
        DOB: String!
        image_url String!
        followersCount: Int!
        followingCount: Int!
        createdAt: String!
    }    

    extend type Query {
        getUser(username: String!): User
    }

    extend type Mutation {
        followUser(userId: ID!): Boolean!
    }
`)