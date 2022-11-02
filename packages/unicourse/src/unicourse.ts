import fetch from "cross-fetch";
import debug from "debug";
import type { Token } from "@unicourse-tw/token";
import { decode } from "@unicourse-tw/token";
import { hash } from "./hash";
import type { EndpointPath, EndpointResponse } from "./types";
import { UniCourseApiError } from "./errors";

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
    public async req<T extends EndpointPath = EndpointPath>(
        path: T,
        options?: RequestInit
    ): Promise<EndpointResponse[T]>;
    public async req(path: string, options?: RequestInit): Promise<unknown>;
    public async req(path: string, options: RequestInit = {}): Promise<unknown> {
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        if (this.token) {
            headers.set("Authorization", `Bearer ${this.token.token}`);
        }

        for (const [key, value] of Object.entries(options.headers ?? {})) {
            headers.set(key, value);
        }

        log("request", path, options);
        const response = await fetch(`${this.server}/${path}`, {
            ...options,
            headers
        });
        log("response", path, response.status, response.statusText);

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
            body: JSON.stringify({
                username,
                password: await hash(password),
                email
            })
        });
    }

    public async login(username: string, password: string): Promise<Token> {
        const response = await this.req("auth/login", {
            method: "POST",
            body: JSON.stringify({
                username,
                password: await hash(password)
            })
        });

        this.use(response.token);
        return this.token!;
    }

    public async status(): Promise<EndpointResponse["health"]> {
        return await this.req("health");
    }
}
