import { prisma } from "../../lib/prisma/prisma.js";


export const userResolvers = {
  Query: {
    getUser: async (_: any, { username }: any) => {
      return prisma.user.findUnique({
        where: { username }
      });
    }
  },

  Mutation: {
    followUser: async (_: any, { userId }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");

      await prisma.follow.create({
        data: {
          followerId: context.user.id,
          followingId: userId
        }
      });

      return true;
    }
  },

  User: {
    followersCount: async (parent: any) => {
      return prisma.follow.count({
        where: { followingId: parent.id }
      });
    },

    followingCount: async (parent: any) => {
      return prisma.follow.count({
        where: { followerId: parent.id }
      });
    }
  }
};