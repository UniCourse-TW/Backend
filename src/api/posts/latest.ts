import { v } from "@unicourse-tw/validation";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    const posts = await prisma.post.findMany({
        where: {
            parent_id: null
        },
        take: v.CONFIG.LIMIT_DEFAULT,
        orderBy: {
            id: "desc"
        },
        include: {
            children: {
                select: {
                    author_id: true,
                    content: true
                },
                take: 2,
                orderBy: {
                    vote_up: {
                        _count: "desc"
                    }
                }
            },
            _count: {
                select: {
                    vote_up: true,
                    vote_down: true
                }
            }
        }
    });

    const result = posts.map(post => ({
        ...post,
        vote: {
            up: post._count.vote_up,
            down: post._count.vote_down
        },
        replies: post.children,
        _count: undefined,
        children: undefined
    }));

    ctx.ok(result);
});

export default router;
