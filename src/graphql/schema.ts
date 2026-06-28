import { buildSchema } from "graphql";
import { authTypeDefs } from "./modules/auth/auth.schema.js";
import { userTypeDefs } from "./modules/user/user.schema.js";
import {gql} from "graphql-tag";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = [userTypeDefs, authTypeDefs].join("\n");
// const rootTypeDefs = gql`
//     type Query
//     type Mutation
// `;

// export const typeDefs = mergeTypeDefs([
//     rootTypeDefs,
//     userTypeDefs,
//     authTypeDefs
// ]);

export const schema = buildSchema(`
    type Query
    type Mutation

    ${typeDefs}
    `)