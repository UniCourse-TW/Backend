import Router from "@koa/router";
import { z } from "zod";
import debug from "debug";
import argon from "argon2";
import cuid from "cuid";
import jwt from "jsonwebtoken";
import { Err, Ok } from "@/response";
import { db } from "@/mem";

const log = debug("api:auth:login");

const schema = z.object({
    username: z.string(),
    password: z.string()
});

export const router = new Router();

router.post("/login", async ctx => {
    try {
        const { username, password } = schema.parse(ctx.request.body);

        const account = db.accounts.find(
            account => account.username === username || account.email === username
        );

        if (!account) {
            log("Invalid username or password");
            Err(ctx, "Account not found", { code: 404 });
            return;
        }

        log("checking password for %s", account.username);
        const valid = await argon.verify(account?.password ?? "", password);

        if (!valid) {
            log("Invalid username or password");
            Err(ctx, "Invalid username or password", { code: 401 });
            return;
        }

        const token = {
            token: cuid(),
            username: account.username,
            expires: Date.now() + 1000 * 60 * 60,
            traits: []
        };
        log("creating token %s for %s", token.token, token.username);

        db.tokens.push(token);

        const jwt_token = jwt.sign(token, process.env.JWT_SECRET ?? "unicourse", {
            expiresIn: "1h"
        });
        Ok(ctx, {
            token: jwt_token
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            log("Invalid request body");
            Err(ctx, "Invalid request body", { code: 400 });
        }
    }
});

export default router;
