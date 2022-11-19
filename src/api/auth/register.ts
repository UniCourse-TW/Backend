import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import argon from "argon2";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";
import { send_verification_email } from "@/action";

const log = debug("api:auth:register");

const schema = z.object({
    username: v.username,
    password: v.password,
    email: v.email
});

export const router = new UniRouter();

router.post("/register", async ctx => {
    const { username, password, email } = schema.parse(ctx.request.body);

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

    const hash = await argon.hash(password);

    const user = await prisma.user.create({ data: {} });

    const snapshot = await prisma.userSnapshot.create({
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
    send_verification_email(snapshot.email_id).catch(err => {
        log("Failed to send verification email: %O", err);
    });
});

export default router;
