import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import argon from "argon2";
import cuid from "cuid";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { IGNORE_INVITATION } from "@/config";

const log = debug("api:auth:register");

const schema = z.object({
    username: v.username,
    password: v.password,
    email: v.email,
    invitation: z.string().cuid().optional()
});

export const router = new UniRouter();

router.post("/register", async ctx => {
    const { username, password, email, invitation } = schema.parse(ctx.request.body);

    const account = await prisma.userSnapshot.findFirst({
        where: {
            OR: [
                { username: username.toLowerCase() },
                { email: { email } }
            ],
            revoked: false
        },
        orderBy: { id: "desc" }
    });

    if (account) {
        log("Account already exists");
        ctx.err("Account already exists", { code: 409 });
        return;
    }

    const new_user_id = cuid();
    if (!IGNORE_INVITATION) {
        if (!invitation) {
            ctx.err("Invitation code is required", { code: 400 });
            return;
        }

        const result = await prisma.invitation.updateMany({
            where: { id: invitation, to: null },
            data: { to: new_user_id, used: new Date() }
        });

        if (result.count === 0) {
            ctx.err("Invalid invitation", { code: 400 });
            return;
        }
    }

    const hash = await argon.hash(password);

    const user = await prisma.user.create({
        data: { id: new_user_id }
    });

    await prisma.userSnapshot.create({
        data: {
            user: { connect: { id: user.id } },
            email: {
                connectOrCreate: {
                    where: { email },
                    create: { email }
                }
            },
            username,
            password: hash
        }
    });

    await prisma.userProfile.create({
        data: {
            user: { connect: { id: user.id } },
            name: username,
            bio: `Hello! I'm ${username}!`,
            school: "",
            email: "",
            location: "",
            banner: "",
            avatar: "https://placekitten.com/200/200",
            extra: {}
        }
    });

    ctx.ok({ username, email });
});

export default router;
