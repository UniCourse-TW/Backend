/**
 * This file is temporary until our database schema is stable.
 */
import fs from "node:fs";

const data = fs.existsSync("./data.json")
    ? JSON.parse(fs.readFileSync("./data.json", "utf-8"))
    : {
        accounts: [],
        tokens: [],
        profiles: {}
    };

function nested_proxy<T extends object & { __data_proxied__?: boolean } = any>(source: T): T {
    if (source.__data_proxied__) {
        return source;
    }
    source.__data_proxied__ = true;

    return new Proxy(source, {
        get(target: any, key: string) {
            if (key === "__data_proxied__") {
                return undefined;
            }

            if (typeof target[key] === "object" && !target.__data_proxied__) {
                target[key] = nested_proxy(target[key]);
            }

            return target[key];
        },
        set(target: any, key: string, value: any) {
            if (key === "__data_proxied__") {
                return true;
            }

            target[key] = value;
            return true;
        }
    });
}

export const db: {
    accounts: Account[]
    tokens: Token[]
    profiles: Record<string, Profile>
} = nested_proxy(data);

export interface Account {
    username: string
    password: string
    email: string
}

export interface Token {
    token: string
    username: string
    expires: number
    traits: string[]
}

export interface Profile {
    username: string
    name: string
    bio: string
    avatar: string
}
