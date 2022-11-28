import type { EndpointResponseBody, POST } from "unicourse";
import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { request_password_reset } from "@/action";
import { KnownError } from "@/error";

export const router = new UniRouter();

router.post("/send-reset", async ctx => {
    const { email } = z.object({ email: v.email }).parse(ctx.request.body);

    const snapshot = await prisma.userSnapshot.findFirst({
        where: {
            email: { email, verified: true },
            revoked: false
        },
        orderBy: { id: "desc" }
    });

    if (!snapshot) {
        ctx.err("User not found", { code: 404 });
        return;
    }

    try {
        await request_password_reset(snapshot.user_id);
        ctx.ok<EndpointResponseBody<"auth/send-reset", typeof POST>>({ email });
    } catch (err) {
        if (err instanceof KnownError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
