import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    try {
        await prisma.$connect();

        ctx.ok({
            server: "ok",
            database: "ok"
        });
    } catch {
        ctx.err("Not Healthy", {
            data: {
                server: "ok",
                database: "error"
            }
        });
    }
});

export default router;
