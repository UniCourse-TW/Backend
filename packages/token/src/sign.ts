import jwt from "jsonwebtoken";
import type { Token } from "./types";

/**
 * Sign a new JWT. (default expiration: 1 hour)
 * @param token Token to sign
 * @param options Options to pass to jwt.sign
 * @returns Signed JWT
 */
export function sign(token: Token, options?: jwt.SignOptions): string {
    const exp = token.expires - Math.floor(Date.now() / 1_000);

    if (exp < 0) {
        throw new Error("Token has already expired");
    }

    return jwt.sign({
        user: token.username,
        traits: token.traits
    }, process.env.JWT_SECRET ?? "unicourse", {
        expiresIn: exp,
        jwtid: token.token,
        ...options
    });
}
