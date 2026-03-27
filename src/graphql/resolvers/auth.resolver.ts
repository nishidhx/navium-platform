import { AuthController } from "../../controllers/auth.controller.js";

export const authResolvers = {
  Mutation: {
    login: async (_: any, args: any) => {
      return AuthController.navium_plt_checkIn(
        args.email,
        args.password
      );
    },

    register: async (_: any, args: any) => {
      return AuthController.navium_plt_register(
        args.username,
        args.email,
      );
    }
  }
};