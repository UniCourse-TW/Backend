import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { get_version } from "@/utils";

const router = new UniRouter();

router.get("/", async ctx => {
    try {
        await prisma.$connect();

        ctx.ok({
            server: "ok",
            database: "ok",
            version: get_version()
        });
    } catch {
        ctx.err("Not Healthy", {
            data: {
                server: "ok",
                database: "error",
                version: get_version()
            }
        });
    }
});

export default router;
