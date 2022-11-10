import Koa from "koa";
import body from "koa-bodyparser";
import UniRouter from "@/router";
import { catcher, create_guard, parse_token, wrap_response } from "@/middlewares";
import health from "@/api/health";
import test from "@/api/test";
import courses from "@/api/courses";
import auth from "@/api/auth";
import profile from "@/api/profile";
import manage from "@/api/manage";
import me from "@/api/me";

const router = new UniRouter()
    .use("/health", health.routes())
    .use("/test", test.routes())
    .use("/auth", auth.routes())
    .use("/courses", create_guard(["verified"]), courses.routes())
    .use("/profile", create_guard(["verified"]), profile.routes())
    .use("/manage", create_guard(["moderator", "verified"]), manage.routes())
    .use("/me", create_guard(), me.routes());

const server = new Koa()
    .use(catcher)
    .use(wrap_response)
    .use(parse_token)
    .use(body({ jsonLimit: "100mb" }))
    .use(router.routes())
    .use(router.allowedMethods());

export { server };
