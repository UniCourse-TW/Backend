import Router from "@koa/router";
import { z } from "zod";
import debug from "debug";
import argon from "argon2";
import { Err, Ok } from "@/response";
import { prisma } from "@/prisma";

const log = debug("api:auth:register");

const schema = z.object({
    username: z.string().min(4),
    password: z.string().min(10),
    email: z.string().email()
});

export const router = new Router();

router.post("/register", async ctx => {
    try {
        const { username, password, email } = schema.parse(ctx.request.body);

        const account = await prisma.userSnapshot.findFirst({
            where: { username, revoked: false },
            orderBy: { id: "desc" }
        });

        if (account) {
            log("Account already exists");
            Err(ctx, "Account already exists", { code: 409 });
            return;
        }

        const hash = await argon.hash(password);

        const user = await prisma.user.create({ data: {} });

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

        Ok(ctx, { username, email });
    } catch (err) {
        if (err instanceof z.ZodError) {
            log("Invalid request body");
            Err(ctx, "Invalid request body", { code: 400 });
        }
    }
});

export default router;
