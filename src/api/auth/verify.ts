import { z } from "zod";
import type { EndpointResponseBody, GET } from "unicourse";
import UniRouter from "@/router";
import { verify_email } from "@/action";
import { KnownError } from "@/error";

export const router = new UniRouter();

router.get("/verify", async ctx => {
    const { id } = z.object({ id: z.string().cuid() }).parse(ctx.query);

    try {
        await verify_email(id);
        ctx.ok<EndpointResponseBody<"auth/verify", typeof GET>>({ success: true });
    } catch (err) {
        if (err instanceof KnownError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
