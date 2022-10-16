import Koa from "koa";
import body from "koa-bodyparser";
import Router from "@koa/router";
import { BACKEND_PORT } from "@/config";
import { Err } from "@/response";
import health from "@/api/health";
import course from "@/api/course";

const server = new Koa().use(body());

const router = new Router()
    .use("/health", health.routes())
    .use("/course", course.routes());

server
    .use(async (ctx, next) => {
        try {
            const start_t = Date.now();

            await next();
            if (ctx.status === 404) {
                Err(ctx, "我們在這找不到任何東西 QQ", { code: 404 });
            } else {
                const time = Date.now() - start_t;
                console.log(`${ctx.method} ${ctx.url} ${ctx.status} ${time}ms`);
                ctx.set("X-Response-Time", time.toString());
            }
        } catch (err) {
            if (err instanceof Error) {
                Err(ctx, `Internal server error: ${err.message.substring(0, 100)}`);
            }
        }
    })
    .use(router.routes())
    .use(router.allowedMethods());

server.listen(BACKEND_PORT, () => {
    console.log(`Server is running on port ${BACKEND_PORT}`);
});
