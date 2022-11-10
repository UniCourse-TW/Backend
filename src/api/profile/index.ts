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

router.patch("/:username", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Not logged in", { code: 401 });
        return;
    }

    try {
        const { username } = ctx.params;

        if (username !== ctx.state.token.username && !ctx.state.token.traits.includes("admin")) {
            ctx.err("Not authorized", { code: 403 });
            return;
        }

        const schema = z.object({
            name: z.string().min(1).max(64).optional(),
            bio: z.string().max(1024).optional(),
            school: z.string().max(1024).optional(),
            email: z.string().email().max(1024).optional(),
            location: z.string().max(1024).optional(),
            banner: z.string().url().max(1024).optional(),
            avatar: z.string().url().max(1024).optional(),
            extra: z.object({}).optional()
        }).strict();

        const data = schema.parse(ctx.request.body);

        log("updating profile for %s", username);
        const last = await prisma.userSnapshot.findFirst({
            where: { username, revoked: false },
            orderBy: { id: "desc" }
        });

        if (!last) {
            ctx.err("Data not found", { code: 404 });
            return;
        }

        const profile = await prisma.userProfile.update({
            where: { user_id: last.user_id },
            data: {
                ...data,
                extra: {}
            }
        });

        ctx.ok(profile);
    } catch (err) {
        if (err instanceof z.ZodError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
