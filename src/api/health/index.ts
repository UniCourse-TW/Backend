
import Router from "@koa/router";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const router = new Router();

router.get("/", async ctx => {
    try {
        await prisma.$connect();

        Ok(ctx, {
            server: "ok",
            database: "ok"
        });
    } catch {
        Err(ctx, "Not Healthy", {
            data: {
                server: "ok",
                database: "error"
            }
        });
    }
});

export default router;
