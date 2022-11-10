import { z } from "zod";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const log = debug("api:me");
const router = new UniRouter();

router.get("/", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Not logged in", { code: 401 });
        return;
    }

    try {
        const { username } = ctx.state.token;

        log("getting private profile for %s", username);
        const snapshot = await prisma.userSnapshot.findFirst({
            where: { username, revoked: false },
            orderBy: { id: "desc" },
            include: {
                user: {
                    include: {
                        profile: {
                            select: {
                                name: true,
                                bio: true,
                                school: true,
                                email: true,
                                location: true,
                                banner: true,
                                avatar: true,
                                extra: true
                            }
                        }
                    }
                },
                perms: {
                    select: { name: true }
                },
                groups: {
                    select: { name: true }
                },
                email: {
                    select: {
                        email: true,
                        verified: true
                    }
                }
            }
        });

        if (!snapshot) {
            ctx.err("Data not found", { code: 404 });
            return;
        }

        if (!snapshot.user.profile) {
            ctx.err("Profile not found", { code: 404 });
            return;
        }

        const data = {
            username: snapshot.username,
            email: snapshot.email,
            profile: snapshot.user.profile,
            perms: snapshot.perms.map(p => p.name),
            groups: snapshot.groups
        };

        ctx.ok(data);
    } catch (err) {
        if (err instanceof z.ZodError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
