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

    const invitations = await prisma.invitation.findMany({
        where: { from: snapshot.user.id }
    });

    const data = {
        username: snapshot.username,
        email: snapshot.email,
        profile: snapshot.user.profile,
        perms: snapshot.perms.map(p => p.name),
        groups: snapshot.groups,
        invitations
    };

    ctx.ok(data);
});

export default router;
