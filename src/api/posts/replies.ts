import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    const { limit, offset } = z.object({
        limit: v.limit,
        offset: v.offset
    }).parse(ctx.query);

    const { id } = ctx.params;

    const replies = await prisma.post.findMany({
        where: { parent_id: id },
        take: limit,
        skip: offset,
        orderBy: {
            id: "desc"
        }
    });

    ctx.ok(replies);
});

export default router;
