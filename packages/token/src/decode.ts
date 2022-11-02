import jwt from "jsonwebtoken";
import type { Token } from "./types";

export function decode(token: string): Token {
    const result = jwt.decode(token) as {
        user: string
        traits: string[]
        exp: number
        jti: string
    };

    return {
        username: result.user,
        traits: result.traits,
        expires: result.exp,
        token: result.jti
    };
}
