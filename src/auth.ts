import type { Context, Next } from "koa";
import jwt from "jsonwebtoken";
import type { Token } from "@/mem";
import { Err } from "@/response";

export async function auth(ctx: Context, next: Next): Promise<void> {
    const token = ctx.request.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token ?? "", process.env.JWT_SECRET ?? "unicourse") as Token;

    if (!decoded) {
        Err(ctx, "Invalid token", { code: 401 });
        return;
    }

    await next();
}
