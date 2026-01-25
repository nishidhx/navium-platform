import { OAuth2Client } from "google-auth-library";
import { logger } from "../utils/logger/index.js";
import "dotenv/config"

const GOOGLE_CLIENT_ID = process.env.NAVIUM_PLT_GOOGLE_OAUTH_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.NAVIUM_PLT_GOOGLE_OAUTH_CLIENT_SECRET || "";



/**
 * @constant GoogleOAuthClient
 * @type {OAuth2Client}
 * @description OAuth client instance used for Google authentication.
 */
export const GoogleOAuthClient: OAuth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "http://localhost:3001/api/v1/auth/google/callback"
)

export class GoogleAuthService {
    /**
     * @method generateGoogleOAuthURL - generate the google OAuth 2.0 url
     * @return {string} - URL to redirect the user to google login page
     */
    public static generateGoogleOAuthURL(): string {
        try {
            logger.I("GOOGLE_CLIENT_ID: " + GOOGLE_CLIENT_ID);
            const _authorized_url = GoogleOAuthClient.generateAuthUrl({
                access_type: "offline",
                prompt: "consent",
                scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
            });

            logger.I("Authorized url generated: " + _authorized_url);
            return _authorized_url;
        } catch(err) {
            logger.E("ERROR: " + err);
            return "";
        }
    }

    /**
     * @method getUserFromCode - Exchange Oauth "code" for a google user profile.
     * @param {string} code - Authorization code from google redirect.
     * @returns {{
     *  googleId: string,
     *  email: string,
     *  name: string,
     *  picture: string 
     * }} - google user information.
     */
    public static async getUserFromCode(code: string): Promise<{ googleId: string; email: string; name: string; picture: string; DOB: string | null; phone_number: string | null } | undefined> {
        try {   
            / * Extracting token from google oauth code */
            const { tokens } = await GoogleOAuthClient.getToken(code);
            GoogleOAuthClient.setCredentials(tokens);

            if (!tokens.id_token) {
                throw new Error("Google oauth code not found");
            };

            / * create ticket */
            const oauth_ticket = await GoogleOAuthClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: GOOGLE_CLIENT_ID
            })

            if (!oauth_ticket.getPayload()) {
                logger.E("Ticket payload not found");
                throw new Error("Payload not found");
            }

            const payload = oauth_ticket.getPayload();

            logger.I("Ticket payload: " + JSON.stringify(payload));

            return {
                googleId: payload?.sub ?? "",
                email: payload?.email ?? "",
                name: payload?.name ?? "",
                picture: payload?.picture ?? "",
                DOB: null,
                phone_number: null
            }
        }catch(err) {
            logger.E("Error: " + err)   
            return;
        }
    }

}