import type { Token } from "@unicourse-tw/token";
import { sign } from "@unicourse-tw/token";
import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import argon from "argon2";
import cuid from "cuid";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const log = debug("api:auth:login");

const schema = z.object({
    username: z.union([v.email, v.username]),
    password: v.password
});

export const router = new UniRouter();

router.post("/login", async ctx => {
    try {
        const { username, password } = schema.parse(ctx.request.body);

        const account = await prisma.userSnapshot.findFirst({
            where: {
                revoked: false,
                OR: [
                    { username: username.toLowerCase() },
                    { email: { email: username } }
                ]
            },
            orderBy: { id: "desc" },
            include: {
                perms: { select: { id: true } },
                groups: {
                    include: {
                        snapshots: {
                            orderBy: { id: "desc" },
                            take: 1,
                            include: {
                                perms: { select: { id: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!account) {
            log("Invalid username or password");
            ctx.err("Account not found", { code: 404 });
            return;
        }

        log("checking password for %s", account.username);
        const valid = await argon.verify(account.password ?? "", password);

        if (!valid) {
            log("Invalid username or password");
            ctx.err("Invalid username or password", { code: 401 });
            return;
        }

        const token: Token = {
            token: cuid(),
            username: account.username,
            expires: Math.floor(Date.now() / 1000) + 60 * 60,
            traits: [...new Set([
                ...account.perms.map(p => p.id),
                ...account.groups.flatMap(g => g.snapshots[0].perms.map(p => p.id))
            ])]
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
        ctx.ok({ token: jwt_token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            log("Invalid request body");
            ctx.err("Invalid request body", { code: 400 });
        }
    }
});

export default router;
