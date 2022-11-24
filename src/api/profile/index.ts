import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { resolve_user } from "@/utils";

const log = debug("api:profile");
const router = new UniRouter();

router.get("/:username", async ctx => {
    const { username } = ctx.params;

    log("getting profile for %s", username);
    const snapshot = await resolve_user(username);

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

    ctx.ok(profile);
});

router.patch("/:username", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Not logged in", { code: 401 });
        return;
    }

    const { username } = ctx.params;

    if (username !== ctx.state.token.username && !ctx.state.token.traits.includes("admin")) {
        ctx.err("Not authorized", { code: 403 });
        return;
    }

    const schema = z.object({
        name: z.string().min(1).max(64).optional(),
        bio: v.string.optional(),
        school: v.string.optional(),
        email: z.union([z.string().max(0), v.email]).optional(),
        location: v.string.optional(),
        banner: z.union([z.string().max(0), v.url]).optional(),
        avatar: z.union([z.string().max(0), v.url]).optional(),
        extra: z.object({}).optional()
    }).strict();

    const data = schema.parse(ctx.request.body);

    log("updating profile for %s", username);
    const last = await resolve_user(username);

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
});

export default router;
