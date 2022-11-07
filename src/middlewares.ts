import type { Context, Next } from "koa";
import cuid from "cuid";
import { verify } from "@unicourse-tw/token";
import type { UniContext } from "./types";
import debug from "@/debug";
import { Err, Ok } from "@/response";
import { prisma } from "@/prisma";

const guard_log = debug("middleware:guard");

export async function parse_token(ctx: Context, next: Next): Promise<void> {
    const raw_token = ctx.request.headers.authorization?.split(" ")[1].trim();
    ctx.state.raw_token = raw_token;

    try {
        guard_log("verifying token", raw_token);
        ctx.state.token = verify(raw_token ?? "");
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

const perm_cache = new Map<string, string>();

/**
 * Create a token permission guard middleware
 * @param requires The permission required (can be id or name)
 * @returns The middleware
 */
export function create_guard(
    requires: string[] = []
): (ctx: Context & UniContext, next: Next) => Promise<void> {
    const perms = requires.filter(r => cuid.isCuid(r));
    const deferred = requires.filter(r => !cuid.isCuid(r));

    return async function (ctx: Context & UniContext, next: Next): Promise<void> {
        if (!ctx.state.token) {
            ctx.err("Invalid token", { code: 401 });
            return;
        }

        for (let i = deferred.length - 1; i >= 0; i--) {
            const id = perm_cache.get(deferred[i]);
            if (id) {
                perms.push(id);
                deferred.splice(i, 1);
                continue;
            }

            const p = await prisma.userPermission.findFirst({
                where: { name: deferred[i] }
            });

            if (p) {
                perm_cache.set(deferred[i], p.id);
                perms.push(p.id);
                deferred.splice(i, 1);
            }
        }

        if (perms.some(p => !ctx.state.token.traits.includes(p))) {
            guard_log("missing perm");
            Err(ctx, "Missing permission", { code: 403 });
            return;
        }

        await next();
    };
}

export async function catcher(ctx: Context, next: Next): Promise<void> {
    try {
        const start_t = Date.now();

        await next();

        const time = Date.now() - start_t;
        console.log(`${ctx.method} ${ctx.url} ${ctx.status} ${time}ms`);
        ctx.set("X-Response-Time", time.toString());

        if (ctx.status === 404 && ctx.body === undefined) {
            Err(ctx, "我們在這找不到任何東西 QQ", { code: 404 });
        }
    } catch (err) {
        if (err instanceof Error) {
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
}
