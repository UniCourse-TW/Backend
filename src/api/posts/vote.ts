import { z } from "zod";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { resolve_user } from "@/utils";

const router = new UniRouter();

router.put("/", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Unauthorized", { code: 401 });
        return;
    }

    const { id } = ctx.params;
    const data = z.object({
        type: z.number().int()
    }).parse(ctx.request.body);

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

    if (data.type === 0) {
        await prisma.post.update({
            where: { id },
            data: {
                vote_up: {
                    disconnect: { id: snapshot.user_id }
                },
                vote_down: {
                    disconnect: { id: snapshot.user_id }
                }
            }
        });
    } else if (data.type > 0) {
        await prisma.post.update({
            where: { id },
            data: {
                vote_up: {
                    connect: { id: snapshot.user_id }
                },
                vote_down: {
                    disconnect: { id: snapshot.user_id }
                }
            }
        });
    } else if (data.type < 0) {
        await prisma.post.update({
            where: { id },
            data: {
                vote_up: {
                    disconnect: { id: snapshot.user_id }
                },
                vote_down: {
                    connect: { id: snapshot.user_id }
                }
            }
        });
    }

    ctx.ok({});
});

export default router;
