import Router from "@koa/router";
import { z } from "zod";
import debug from "debug";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const log = debug("api:profile");
const router = new Router();

router.get("/:username", async ctx => {
    try {
        const { username } = ctx.params;

        log("getting profile for %s", username);
        const snapshot = await prisma.userSnapshot.findFirst({
            where: { username, revoked: false },
            orderBy: { id: "desc" }
        });

        if (!snapshot) {
            Err(ctx, "User not found", { code: 404 });
            return;
        }

        const profile = await prisma.userProfile.findUnique({
            where: { user_id: snapshot.user_id }
        });

        if (!profile) {
            Err(ctx, "User not found", { code: 404 });
            return;
        }

        Ok(ctx, { profile });
    } catch (err) {
        if (err instanceof z.ZodError) {
            Err(ctx, err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
