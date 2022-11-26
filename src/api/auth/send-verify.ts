import type { EndpointResponseBody, POST } from "unicourse";
import UniRouter from "@/router";
import { send_verification_email } from "@/action";
import { KnownError } from "@/error";
import { resolve_user } from "@/utils";

export const router = new UniRouter();

router.post("/send-verify", async ctx => {
    if (!ctx.state.token) {
        ctx.err("Unauthorized", { code: 401 });
        return;
    }

    const snapshot = await resolve_user(ctx.state.token.username, {
        email: { select: { email: true } }
    });

    if (!snapshot) {
        ctx.err("User snapshot not found");
        return;
    }

    try {
        await send_verification_email(snapshot.email_id);
        ctx.ok<EndpointResponseBody<"auth/send-verify", typeof POST>>({
            email: snapshot.email.email
        });
    } catch (err) {
        if (err instanceof KnownError) {
            ctx.err(err.message, { code: 400 });
        } else {
            throw err;
        }
    }
});

export default router;
