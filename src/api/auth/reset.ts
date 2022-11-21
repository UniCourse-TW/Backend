import { z } from "zod";
import { v } from "@unicourse-tw/validation";
import UniRouter from "@/router";
import { reset_password } from "@/action";
import { KnownError } from "@/error";

export const router = new UniRouter();

router.post("/reset", async ctx => {
    const { id, password } = z.object({
        id: z.string().cuid(),
        password: v.password
    }).parse(ctx.request.body);

    try {
        await reset_password(id, password);
        ctx.ok({ success: true });
    } catch (err) {
        if (err instanceof KnownError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
