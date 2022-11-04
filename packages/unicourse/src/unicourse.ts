import fetch from "cross-fetch";
import debug from "debug";
import type { Token } from "@unicourse-tw/token";
import { decode } from "@unicourse-tw/token";
import { hash } from "./hash";
import type { EndpointRequestInit, EndpointResponse } from "./types";
import { UniCourseApiError } from "./errors";
import type { PackedJson } from "./json-pack";
import { verify_packed_json } from "./json-pack";

const log = debug("unicourse:client");

export class UniCourse {
    private _raw_token?: string;
    private token?: Token;
    public server: string;

    constructor(token?: string, { server = "http://localhost:8080" } = {}) {
        this.server = server;
        if (token) {
            this.use(token);
        }
    }

    /**
     * Get the raw JWT.
     */
    public get raw_token(): string | undefined {
        return this._raw_token;
    }

    /**
     * Use a JWT to authenticate.
     * @param token The JWT to use.
     */
    public use(token: string): void {
        this._raw_token = token;
        this.token = decode(token);
    }

    /**
     * Check if the current token is valid.
     * @returns true if there is a valid token, false otherwise.
     */
    public is_valid(): boolean {
        return !!this.token && this.token.expires > Math.floor(Date.now() / 1000);
    }

    /**
     * Get the parsed information of the current token.
     * @returns The parsed token information.
     */
    public whoami(): Token | undefined {
        return this.token;
    }

    /**
     * Send a request to the server.
     * @param path The path of the endpoint. (without the leading slash)
     * @param options The options passed to the native fetch.
     */
    public async req<T extends keyof EndpointResponse = keyof EndpointResponse>(
        path: T,
        options?: EndpointRequestInit<T>
    ): Promise<EndpointResponse[T]>;
    public async req(path: string, options?: RequestInit): Promise<unknown>;
    public async req(
        path: string,
        options: RequestInit | EndpointRequestInit = {}
    ): Promise<unknown> {
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        if (this.is_valid()) {
            headers.set("Authorization", `Bearer ${this.raw_token}`);
        }

        for (const [key, value] of Object.entries(options.headers ?? {})) {
            headers.set(key, value);
        }

        log("request", path, options);
        const response = await fetch(`${this.server}/${path}`, {
            ...options,
            body: typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
            headers
        });
        log("response", path, response.status, response.statusText);

        if (Math.floor(response.status / 100) !== 2) {
            let msg: string;
            try {
                const { error } = await response.json();
                msg = error;
            } catch {
                msg = response.statusText;
            }

            throw new UniCourseApiError(msg, response.status);
        }

        const { data, error } = await response.json();
        log("result", path, data, error);
        if (error) {
            throw new UniCourseApiError(error, response.status);
        }

        return data;
    }

    public async register(
        username: string,
        password: string,
        email: string
    ): Promise<EndpointResponse["auth/register"]> {
        return await this.req("auth/register", {
            method: "POST",
            body: {
                username,
                password: await hash(password),
                email
            }
        });
    }

    public async login(username: string, password: string): Promise<Token> {
        const response = await this.req("auth/login", {
            method: "POST",
            body: {
                username,
                password: await hash(password)
            }
        });

        this.use(response.token);
        return this.token!;
    }

    public async status(): Promise<EndpointResponse["health"]> {
        return await this.req("health");
    }

    public async profile<T extends string = string>(
        username: T
    ): Promise<EndpointResponse[`profile/${T}`]> {
        return await this.req(`profile/${username}`);
    }

    public async import(json: PackedJson): Promise<EndpointResponse["manage/import"]> {
        const packed = verify_packed_json(json);
        return await this.req("manage/import", {
            method: "POST",
            body: packed
        });
    }
}
