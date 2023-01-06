import type { Context, Next } from "koa";
import { z } from "zod";
import cuid from "cuid";
import { verify } from "@unicourse-tw/token";
import type { UniContext } from "./types";
import debug from "@/debug";
import { Err, Ok } from "@/response";
import { prisma } from "@/prisma";

const guard_log = debug("middleware:guard");

const cuid_cache = new Map<string, string>();

export async function parse_token(ctx: Context, next: Next): Promise<void> {
    const raw_token = ctx.request.headers.authorization?.split(" ")[1].trim();
    ctx.state.raw_token = raw_token;

    try {
        guard_log("verifying token", raw_token);
        ctx.state.token = verify(raw_token ?? "");

        const mappings: string[] = [];
        const unresolved: string[] = [];
        for (const trait of ctx.state.token.traits) {
            if (cuid.isCuid(trait)) {
                if (!cuid_cache.has(trait)) {
                    unresolved.push(trait);
                }
                mappings.push(trait);
            }
        }
        const resolved = await prisma.userPermission.findMany({
            where: { id: { in: unresolved } },
            select: { id: true, name: true }
        });
        for (const perm of resolved) {
            cuid_cache.set(perm.id, perm.name);
        }
        for (const m of mappings) {
            ctx.state.token.traits.push(cuid_cache.get(m) ?? m);
        }
        guard_log("token verified");
    } catch {}

    await next();
}

export async function wrap_response(ctx: Context, next: Next): Promise<void> {
    ctx.ok = (data: any) => Ok(ctx, data);
    ctx.err = (
        error: string,
        { code = 500, data = undefined }: { code?: number; data?: any } = {}
    ) => Err(ctx, error, { code, data });

    await next();
}

/**
 * Create a token permission guard middleware
 * @param requires The permission required (can be id or name)
 * @returns The middleware
 */
export function create_guard(
    requires: string[] = []
): (ctx: Context & UniContext, next: Next) => Promise<void> {
    return async function (ctx: Context & UniContext, next: Next): Promise<void> {
        if (!ctx.state.token) {
            ctx.err("Invalid token", { code: 401 });
            return;
        }

        if (requires.some(p => !ctx.state.token.traits.includes(p))) {
            guard_log("missing perm");
            Err(ctx, "Missing permission", { code: 403 });
            return;
        }

        await next();
    };
}

export async function catcher(ctx: Context, next: Next): Promise<void> {
    const start_t = Date.now();

    try {
        await next();
    } catch (err) {
        if (err instanceof z.ZodError || (err instanceof Error && err.name === "ZodError")) {
            // @ts-expect-error Validation re-exports ZodError, may not be correctly recognized
            Err(ctx, err.issues.map(i => i.message).join(", "), { code: 400 });
        } else if (err instanceof Error) {
            const id = cuid();
            await prisma.serverError.create({
                data: {
                    id,
                    message: err.message,
                    stack: err.stack || "",
                    path: ctx.path
                }
            });
            Err(ctx, `Internal Server Error. ID: #${id}`);
        }
    }

    const time = Date.now() - start_t;
    console.log(`${ctx.method} ${ctx.url} ${ctx.status} ${time}ms`);
    ctx.set("X-Response-Time", time.toString());

    if (ctx.status === 404 && ctx.body === undefined) {
        Err(ctx, "我們在這找不到任何東西 QQ", { code: 404 });
    }
}
