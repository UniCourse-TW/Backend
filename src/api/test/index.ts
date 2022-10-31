
import Router from "@koa/router";

const router = new Router();

router.get("/error", async ctx => {
    const name = ctx.query.name as string | undefined;
    throw new Error(name || "Error");
});

export default router;
