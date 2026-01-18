import {prisma} from "../lib/prisma/prisma.js";
import { safeWrapper } from "../utils/wrappers/safe.js";

export class AuthController {

    /**
     * @method navium_plt_register - Registers a new user.
     */
    public static async navium_plt_register() {
       console.log("entered navium")
        const {data, error} = await safeWrapper(() => {
            //@ts-ignore
            const fspath = 2;
        })();

        console.log(data, error)
    }

}