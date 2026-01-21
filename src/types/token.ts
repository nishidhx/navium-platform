

/**
 * @interface EllipticCurveKeyJWK 
 * @description Represents an Elliptic Curve JSON Web Key (JWK) for the P-256 curve.
 * @property { "EC" } kty - Key type, always "EC" for Elliptic Curve keys.
 * @property { "P-256" } crv - Curve name, always "P-256".
 * @property {string} x - The x coordinate of the public key point.
 * @property {string} y - The y coordinate of the public key point.
 * @property {string} [d] - The private key value, present only in private keys. // 'd' is present only in private keys 
 */
export interface EllipticCurveKeyJWK { kty: "EC"; crv: "P-256"; x: string; y: string; d?: string;}


export interface NaviumPayload {
    [key: string]: any;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
    id?: string | undefined;
}