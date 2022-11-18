import { v } from "@unicourse-tw/validation";
import vote from "./vote";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { resolve_user } from "@/utils";

const router = new UniRouter();

router.get("/", async ctx => {
    const { id } = ctx.params;

    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) {
        ctx.err("Post not found", { code: 404 });
        return;
    }

    ctx.ok(post);
});

router.put("/", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Unauthorized", { code: 401 });
        return;
    }

    const { id } = ctx.params;
    const data = v.post.parse(ctx.request.body);

    const { username } = ctx.state.token;

    const snapshot = await resolve_user(username);
    if (!snapshot) {
        ctx.err("User not found", { code: 404 });
        return;
    }

    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) {
        ctx.err("Post not found", { code: 404 });
        return;
    }

    if (post.author_id !== snapshot.user_id && ctx.state.token.traits.includes("admin") === false) {
        ctx.err("Unauthorized", { code: 401 });
        return;
    }

    const result = await prisma.post.update({
        where: { id },
        data: {
            ...data,
            course: {
                connect: { id: data.course }
            },
            tags: {
                updateMany: data.tags.map(tag => ({
                    where: { name: tag },
                    data: { name: tag }
                }))
            }
        }
    });

    ctx.ok(result);
});

router.use("/vote", vote.routes());

export default router;
