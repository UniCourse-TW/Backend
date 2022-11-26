import { v } from "@unicourse-tw/validation";
import type { EndpointResponseBody, GET } from "unicourse";
import { z } from "zod";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    const { q, limit, offset } = z.object({
        q: v.query,
        limit: v.limit,
        offset: v.offset
    }).parse(ctx.query);

    const tags = await prisma.postTag.findMany({
        where: {
            name: { contains: q }
        },
        select: { name: true },
        take: limit,
        skip: offset,
        orderBy: {
            _relevance: {
                fields: ["name"],
                search: q,
                sort: "desc"
            }
        }
    });

    ctx.ok<EndpointResponseBody<"posts/tags", typeof GET>>(tags.map(tag => tag.name));
});

export default router;
