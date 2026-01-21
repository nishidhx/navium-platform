import { importJWK, jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { EllipticCurveKeyJWK, NaviumPayload } from "../types/token.js";
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger/index.js";

// {
//   kty: 'EC',
//   x: 'R8kZ6FE7cRRqplmnurlApVlXyJghn-kOC7WYRApwodw',
//   y: 'jVBHw5uPtpU0VWeCdbPB4NF_yYhmIGsJkivfzu2eDEs',
//   crv: 'P-256'
// }
// {
//   kty: 'EC',
//   x: 'R8kZ6FE7cRRqplmnurlApVlXyJghn-kOC7WYRApwodw',
//   y: 'jVBHw5uPtpU0VWeCdbPB4NF_yYhmIGsJkivfzu2eDEs',
//   crv: 'P-256',
//   d: 'juFInYl_5Ub_EgMF2aBJBvY6J8-LsVZk6yn_IMXXMVQ'
// }

/**
 * @class Service building for JWT generation and validation.
 */
class TokenGeneratorService {
    private readonly JWT_PRIVATE_KEY: EllipticCurveKeyJWK; 
    public static JWT_PUBLIC_KEY: EllipticCurveKeyJWK = {
        kty: 'EC',
        x: 'R8kZ6FE7cRRqplmnurlApVlXyJghn-kOC7WYRApwodw',
        y: 'jVBHw5uPtpU0VWeCdbPB4NF_yYhmIGsJkivfzu2eDEs',
        crv: 'P-256'
    };

    /**
     * Initialize JWTService with a private JWK.
     * If the environment variable is missing, a default development key is used.
     */
    constructor() {
        const envKey = process.env.JWT_PRIVATE_KEY_JWK;
        this.JWT_PRIVATE_KEY = (
            envKey 
                ? (JSON.parse(envKey) as EllipticCurveKeyJWK) 
                : {
                    kty: 'EC',
                    x: 'R8kZ6FE7cRRqplmnurlApVlXyJghn-kOC7WYRApwodw',
                    y: 'jVBHw5uPtpU0VWeCdbPB4NF_yYhmIGsJkivfzu2eDEs',
                    crv: 'P-256',
                    d: 'juFInYl_5Ub_EgMF2aBJBvY6J8-LsVZk6yn_IMXXMVQ'
                }
        ) as EllipticCurveKeyJWK;
    }

    /**
     * @method generatePLTAuthToken - generates a JWT token for a given payload
     * @param { NaviumPayload } payload 
     * @param { string | number } expiresIn 
     * @param { string } secret 
     */
    public async generatePLTAuthToken(
        payload: NaviumPayload,
        expiresIn: string | number,
        secret: string
    ): Promise<string> {
        try {
            const PrivateKeyJWK = await importJWK(this.JWT_PRIVATE_KEY, "ES256");
            const PayloadToSign = {
                ...payload,
                iat: Math.floor(Date.now()/ 1000),
                jti: randomUUID(),
            };
            const filteredPayload = Object.fromEntries(Object.entries(PayloadToSign).filter(([_, v]) => v !== undefined)) as Record<string, unknown>;
            const PLT_TOKEN = await new SignJWT(filteredPayload).setProtectedHeader({ alg: "ES256" }).setExpirationTime(expiresIn).sign(PrivateKeyJWK);
            return PLT_TOKEN;
        }catch(error) {
            logger.D("Error generation plt token: " + (error as Error).message);
            throw error;
        }
    }

    /**
     * @method verifyPLTAuthToken - verifies a JWT token and return the decoded payload.
     * @param {string} token - the jwt token to verify.
     * @returns {Promise<JWTPayload | null>} - the decoded payload if valid, otherwise null. 
     */
    public static async verifyPLTAuthToken(
        token: string
    ): Promise<JWTPayload | null> {
        try {
            / * use the static class directly to avoid reliance on `this` (which can be undefined when the method is called as an unbound function after import) /
            const publicKeyJWK = await importJWK(TokenGeneratorService.JWT_PUBLIC_KEY, "ES256");
            logger.D(`[${this.verifyPLTAuthToken.name}]` + ": " + `Verifying Token: ${publicKeyJWK}` );
            const { payload } = await jwtVerify(token, publicKeyJWK);
            logger.D(`Token verified successfully. Payload: ${JSON.stringify(payload)}`);
            return payload as JWTPayload;
        }catch(error) {
            logger.E("Error verifying PLT auth token: " + (error as Error).message);
            return null;
        }
    }
}

const TokenGenerator = new TokenGeneratorService();

export const generatePLTAuthToken = TokenGenerator.generatePLTAuthToken.bind(TokenGenerator);
export default TokenGeneratorService.verifyPLTAuthToken;