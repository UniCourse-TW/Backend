import { v } from "@unicourse-tw/validation";
import type { EndpointResponseBody, GET, PATCH } from "unicourse";
import { z } from "zod";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { resolve_user } from "@/utils";

const log = debug("api:profile");
const router = new UniRouter();

router.get("/:username", async ctx => {
    const username = v.username.parse(ctx.params.username);

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

    if (!ctx.state.token || !ctx.state.token.traits.includes("verified")) {
        profile.email = "";
        profile.location = "";
        profile.school = "";
    }

    ctx.ok<EndpointResponseBody<`profile/${string}`, typeof GET>>(profile);
});

router.patch("/:username", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Not logged in", { code: 401 });
        return;
    }

    const username = v.username.parse(ctx.params.username);

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
    const last = await resolve_user(username, { email: true });

    if (!last) {
        ctx.err("Data not found", { code: 404 });
        return;
    }

    if (data.email && (data.email !== last.email.email || !last.email.verified)) {
        ctx.err("The email is not verified to be owned by you", { code: 400 });
        return;
    }

    const profile = await prisma.userProfile.update({
        where: { user_id: last.user_id },
        data: {
            ...data,
            extra: {}
        }
    });

    ctx.ok<EndpointResponseBody<`profile/${string}`, typeof PATCH>>(profile);
});

export default router;
