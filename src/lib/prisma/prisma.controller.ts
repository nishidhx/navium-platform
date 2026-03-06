import { prisma } from "./prisma.js";
import { logger } from "../../utils/logger/index.js";
import { prismaUserSafeSelect } from "../../selections/userSelect.js";
import type { userSafeSelect } from "../../types/user.js";
import type { userPostSelect } from "../../types/prisma.types.js";
import { userPostSafeSelect } from "../../selections/postSelect.js";


export class PrismaController {


    /**
     * @method getUserById - Get user by ID from the database.
     * @param userId 
     * @returns 
     */
    static async getUserById(userId: string, selections?: object): Promise<userSafeSelect | null> {
        try {
            const navium_plt_user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: selections ? selections : prismaUserSafeSelect
            })

            if (!navium_plt_user) {
                logger.E("navium plt user not foundd with userId" + userId);
            }
            
            logger.E("navium plt user  foundd with userId" + userId);

            return navium_plt_user ? navium_plt_user : null;
        }catch (err) {
            logger.E("Error fetching user by ID: " + (err as Error).message); 
            return null;
        };
    }

    /**
     * @method getUserByEmail - Get user by email from the database.
     * @param email 
     * @returns 
     */
    static async getUserByEmail(email: string, selections?: object): Promise<userSafeSelect | null> {
            try {
                const navium_plt_user = await prisma.user.findUnique({
                    where: {
                        email: email
                    },
                    select: selections ? selections : prismaUserSafeSelect
                })

                return navium_plt_user ? navium_plt_user : null;
            }catch (err) {
                logger.E("Error fetching user by email: " + (err as Error).message); 
                return null;
            };
        }

    /**
     * @method getUserbyUsername - Get user by username from the database.
     * @param username 
     * @returns 
     */
    static async getUserByUsername(username: string, selections?: object): Promise<userSafeSelect | null> {
            try {
                const navium_plt_user = await prisma.user.findUnique({
                    where: {    
                        username: username
                    },
                    select: selections ? selections : prismaUserSafeSelect
                })

                if (!navium_plt_user) {
                    logger.W("user not found wiht userId: " + username);
                }

                return navium_plt_user ? navium_plt_user : null;
            }catch (err) {
                logger.E("Error fetching user by username: " + (err as Error).message); 
                return null;
            };
        }        
    
    static async getPostById(postId: string, selections?: object): Promise<userPostSelect | null> {
        try {
            const navium_plt_user_post = await  prisma.post.findUnique({
                where: {
                    id: postId
                },
                select: (selections || userPostSafeSelect) as typeof userPostSafeSelect
            })

            if (!navium_plt_user_post) {
                logger.E("user post not found");
            }

            // @ts-ignore
            return navium_plt_user_post ? navium_plt_user_post : null
        }catch(err) {
            return null

        }
    }
}