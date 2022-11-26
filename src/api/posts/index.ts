import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import { PostType } from "@unicourse-tw/prisma";
import type { EndpointResponseBody, GET, POST } from "unicourse";
import latest from "./latest";
import tags from "./tags";
import key from "./key";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { resolve_user } from "@/utils";

const log = debug("api:posts");
const router = new UniRouter();

router.get("/", async ctx => {
    const query = z.object({
        q: v.query,
        limit: v.limit,
        offset: v.offset,
        type: v.post.shape.type.optional()
    }).parse(ctx.query);

    const posts = await prisma.post.findMany({
        where: {
            type: query.type,
            parent_id: null,
            OR: [
                { title: { contains: query.q } },
                { content: { contains: query.q } }
            ]
        },
        take: query.limit,
        skip: query.offset,
        orderBy: {
            _relevance: {
                fields: ["title", "content"],
                search: query.q,
                sort: "desc"
            }
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

    ctx.ok<EndpointResponseBody<"posts", typeof GET>>(result);
});

router.post("/", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Unauthorized", { code: 401 });
        return;
    }

    const { username } = ctx.state.token;

    const snapshot = await resolve_user(username);

    if (!snapshot) {
        ctx.err("User not found", { code: 404 });
        return;
    }

    const data = v.post.parse(ctx.request.body);
    log("parsed data", data);

    const post = await prisma.post.create({
        data: {
            type: PostType[data.type],
            title: data.title,
            content: data.content,
            tags: {
                connectOrCreate: data.tags.map(tag => ({
                    where: { name: tag },
                    create: { name: tag }
                }))
            },
            author: { connect: { id: snapshot.user_id } },
            course: data.course ? { connect: { id: data.course } } : undefined
        }
    });

    ctx.ok<EndpointResponseBody<"posts", typeof POST>>(post);
});

router.use("/latest", latest.routes());
router.use("/tags", tags.routes());
router.use("/:id", key.routes());

export default router;
