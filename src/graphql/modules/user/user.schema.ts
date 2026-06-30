import { buildSchema } from "graphql";

// those things are written schema that to be returned to the user 
// if any of the fields is not mentioned that could be not meant to be beign shared with the user.

export const Schema = buildSchema(`
    type User {
        id: ID!
        username: String!
        email: String!
        firstname: String!
        lastname: String!
        phone_number: String!
        DOB: String!
        image_url: String!
        followersCount: Int!
        followingCount: Int!
        createdAt: String!
    }    

    type Query {
        getUser(username: String!): User
    }

    type Mutation {
        followUser(userId: ID!): Boolean!
    }
`)

export const userTypeDefs = `
    type User {
        id: ID!
        username: String!
        email: String!
        firstname: String!
        lastname: String!
        phone_number: String!
        DOB: String!
        image_url: String!
        followersCount: Int!
        followingCount: Int!
        createdAt: String!
    }    

    extend type Query {
        getUser: User
    }

    extend type Mutation {
        followUser(userId: ID!): Boolean!
    }
`