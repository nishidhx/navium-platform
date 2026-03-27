import { gql } from "graphql-tag";

export const authTypeDefs = gql`
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