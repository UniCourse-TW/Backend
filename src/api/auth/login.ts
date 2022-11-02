import Router from "@koa/router";
import type { Token } from "@unicourse-tw/token";
import { sign } from "@unicourse-tw/token";
import { z } from "zod";
import debug from "debug";
import argon from "argon2";
import cuid from "cuid";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const log = debug("api:auth:login");

const schema = z.object({
    username: z.string(),
    password: z.string()
});

export const router = new Router();

router.post("/login", async ctx => {
    try {
        const { username, password } = schema.parse(ctx.request.body);

        const account = await prisma.userSnapshot.findFirst({
            where: {
                revoked: false,
                OR: [
                    { username },
                    { email: { email: username } }
                ]
            },
            orderBy: { id: "desc" }
        });

        if (!account) {
            log("Invalid username or password");
            Err(ctx, "Account not found", { code: 404 });
            return;
        }

        log("checking password for %s", account.username);
        const valid = await argon.verify(account.password ?? "", password);

        if (!valid) {
            log("Invalid username or password");
            Err(ctx, "Invalid username or password", { code: 401 });
            return;
        }

        const token: Token = {
            token: cuid(),
            username: account.username,
            expires: Math.floor(Date.now() / 1000) + 60 * 60,
            traits: []
        };
        log("creating token %s for %s with traits %o", token.token, token.username, token.traits);

        await prisma.userToken.create({
            data: {
                id: token.token,
                user: { connect: { id: account.id } },
                expires: new Date(token.expires * 1_000),
                traits: token.traits
            }
        });

        const jwt_token = sign(token);
        Ok(ctx, { token: jwt_token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            log("Invalid request body");
            Err(ctx, "Invalid request body", { code: 400 });
        }
    }
});

export default router;
