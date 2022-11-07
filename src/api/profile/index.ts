import { z } from "zod";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const log = debug("api:profile");
const router = new UniRouter();

router.get("/:username", async ctx => {
    try {
        const { username } = ctx.params;

        log("getting profile for %s", username);
        const snapshot = await prisma.userSnapshot.findFirst({
            where: { username, revoked: false },
            orderBy: { id: "desc" }
        });

        if (!snapshot) {
            ctx.err("User not found", { code: 404 });
            return;
        }

        const profile = await prisma.userProfile.findUnique({
            where: { user_id: snapshot.user_id }
        });

        if (!profile) {
            ctx.err("User not found", { code: 404 });
            return;
        }

        ctx.ok({ profile });
    } catch (err) {
        if (err instanceof z.ZodError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
