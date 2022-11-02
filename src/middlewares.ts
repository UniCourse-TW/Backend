import type { Context, Next } from "koa";
import cuid from "cuid";
import debug from "debug";
import { verify } from "@unicourse-tw/token";
import { Err } from "@/response";
import { prisma } from "@/prisma";

const guard_log = debug("middleware:guard");

export async function guard(ctx: Context, next: Next): Promise<void> {
    const token = ctx.request.headers.authorization?.split(" ")[1];

    try {
        guard_log("verifying token", token);
        verify(token ?? "");
        guard_log("token verified");
    } catch {
        Err(ctx, "Invalid token", { code: 401 });
        return;
    }

    await next();
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
