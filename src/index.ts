import Koa from "koa";
import body from "koa-bodyparser";
import Router from "@koa/router";
import cuid from "cuid";
import jwt from "jsonwebtoken";
import type { Token } from "./mem";
import { BACKEND_PORT } from "@/config";
import { initialize } from "@/initialize";
import { Err } from "@/response";
import { prisma } from "@/prisma";
import health from "@/api/health";
import test from "@/api/test";
import courses from "@/api/courses";
import auth from "@/api/auth";

const server = new Koa().use(body());

const router = new Router()
    .use("/health", health.routes())
    .use("/test", test.routes())
    .use("/auth", auth.routes())
    .use("/courses", async (ctx, next) => {
        const token = ctx.request.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token ?? "", process.env.JWT_SECRET ?? "unicourse") as Token;

        if (!decoded) {
            Err(ctx, "Invalid token", { code: 401 });
            return;
        }

        await next();
    }, courses.routes());

server
    .use(async (ctx, next) => {
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
    })
    .use(router.routes())
    .use(router.allowedMethods());

initialize().then(() => {
    server.listen(BACKEND_PORT, () => {
        console.log(`Server is running on port ${BACKEND_PORT}`);
    });
});
