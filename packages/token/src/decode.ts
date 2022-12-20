import jwt from "jsonwebtoken";
import type { Token } from "./types";

export function decode(token: string): Token {
    const result = jwt.decode(token) as {
        user: string
        username: string
        traits: string[]
        exp: number
        jti: string
    };

    return {
        user: result.user,
        username: result.username,
        traits: result.traits,
        expires: result.exp,
        token: result.jti
    };
}
