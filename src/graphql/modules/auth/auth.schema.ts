import { gql } from "graphql-tag";

export const authTypeDefs = `
  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(
      username: String!
      email: String!
      password: String!
    ): AuthPayload!
  }
`;