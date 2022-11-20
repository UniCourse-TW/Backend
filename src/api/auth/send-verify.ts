import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { send_verification_email } from "@/action";
import { KnownError } from "@/error";

export const router = new UniRouter();

router.post("/send-verify", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Unauthorized", { code: 401 });
        return;
    }

    const snapshot = await prisma.userSnapshot.findFirst({
        where: {
            username: ctx.state.token.username,
            revoked: false
        },
        orderBy: { id: "desc" },
        include: {
            email: { select: { email: true } }
        }
    });

    if (!snapshot) {
        ctx.err("User snapshot not found");
        return;
    }

    try {
        await send_verification_email(snapshot.email_id);
        ctx.ok({ email: snapshot.email.email });
    } catch (err) {
        if (err instanceof KnownError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
