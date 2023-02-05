import Koa from "koa";
import body from "koa-bodyparser";
import UniRouter from "@/router";
import { catcher, create_guard, parse_token, wrap_response } from "@/middlewares";
import health from "@/api/health";
import stats from "@/api/stats";
import test from "@/api/test";
import courses from "@/api/courses";
import auth from "@/api/auth";
import posts from "@/api/posts";
import profile from "@/api/profile";
import manage from "@/api/manage";
import me from "@/api/me";
import tree from "@/api/tree";

const router = new UniRouter()
    .use("/health", health.routes())
    .use("/stats", stats.routes())
    .use("/test", test.routes())
    .use("/auth", auth.routes())
    .use("/courses", courses.routes())
    .use("/posts", create_guard(["verified"]), posts.routes())
    .use("/profile", create_guard(), profile.routes())
    .use("/manage", create_guard(["moderator", "verified"]), manage.routes())
    .use("/me", create_guard(), me.routes())
    .use("/tree", create_guard(["verified"]), tree.routes());

const server = new Koa()
    .use(catcher)
    .use(wrap_response)
    .use(parse_token)
    .use(body({ jsonLimit: "100mb" }))
    .use(router.routes())
    .use(router.allowedMethods());

export { server };
