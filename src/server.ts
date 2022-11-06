import Koa from "koa";
import body from "koa-bodyparser";
import Router from "@koa/router";
import { catcher, guard } from "@/middlewares";
import health from "@/api/health";
import test from "@/api/test";
import courses from "@/api/courses";
import auth from "@/api/auth";
import profile from "@/api/profile";
import manage from "@/api/manage";

const server = new Koa().use(body({ jsonLimit: "100mb" }));

const router = new Router()
    .use("/health", health.routes())
    .use("/test", test.routes())
    .use("/auth", auth.routes())
    .use("/courses", guard, courses.routes())
    .use("/profile", guard, profile.routes())
    .use("/manage", guard, manage.routes());

server
    .use(catcher)
    .use(router.routes())
    .use(router.allowedMethods());

export { server };
