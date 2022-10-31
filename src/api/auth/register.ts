import Router from "@koa/router";
import { z } from "zod";
import debug from "debug";
import argon from "argon2";
import { Err, Ok } from "@/response";
import { db } from "@/mem";

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

        const account = db.accounts.find(
            account => account.username === username || account.email === email
        );

        if (account) {
            log("Account already exists");
            Err(ctx, "Account already exists", { code: 409 });
            return;
        }

        const hash = await argon.hash(password);

        const user = {
            username,
            password: hash,
            email
        };

        db.accounts.push(user);
        db.profiles[user.username] = {
            username: user.username,
            name: user.username,
            bio: "Nothing",
            avatar: "https://placekitten.com/200/200"
        };

        Ok(ctx, { username, email });
    } catch (err) {
        if (err instanceof z.ZodError) {
            log("Invalid request body");
            Err(ctx, "Invalid request body", { code: 400 });
        }
    }
});

export default router;
