
import UniRouter from "@/router";

const router = new UniRouter();

router.get("/error", async ctx => {
    const name = ctx.query.name as string | undefined;
    throw new Error(name || "Error");
});

export default router;
