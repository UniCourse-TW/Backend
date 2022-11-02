import jwt from "jsonwebtoken";
import type { Token } from "./types";

export function verify(token: string): Token {
    const result = jwt.verify(token, process.env.JWT_SECRET ?? "unicourse") as {
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
