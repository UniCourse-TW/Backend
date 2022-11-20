import { z } from "zod";
import { send_mail } from "@unicourse-tw/notify";
import { prisma } from "@/prisma";
import { FRONTEND_BASE_URL } from "@/config";
import { KnownError } from "@/error";

/**
 * Send a verification email to the user.
 * @param id Email ID.
 */
export async function send_verification_email(id: string): Promise<void> {
    const email = await prisma.email.findFirst({
        where: { id },
        include: {
            snapshots: {
                take: 1,
                where: { revoked: false },
                orderBy: { id: "desc" }
            }
        }
    });

    if (!email) {
        throw new KnownError("Email not found");
    }

    if (email.verified) {
        throw new KnownError("Email already verified");
    }

    const snapshot = email.snapshots[0];
    if (!snapshot) {
        throw new KnownError("User snapshot not found");
    }

    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const action = await prisma.action.upsert({
        where: { key: `verify-email-${id}` },
        update: {
            expires,
            actors: { connect: { id: snapshot.user_id } }
        },
        create: {
            key: `verify-email-${id}`,
            tags: ["verify-email"],
            expires,
            state: { email: id },
            actors: { connect: { id: snapshot.user_id } }
        }
    });

    const url = `${FRONTEND_BASE_URL}/email-verify?id=${action.id}`;
    const html = `
        <p>Hello ${snapshot.username},</p>
        <p>Click the link below to verify your email:</p>
        <a href="${url}">${url}</a>
    `;
    await send_mail(email.email, "Verify Your UniCourse Account", html);
}

/**
 * Verify an email.
 * @param id Action ID.
 */
export async function verify_email(id: string): Promise<void> {
    const action = await prisma.action.findUnique({ where: { id } });

    if (!action) {
        throw new KnownError("Action not found");
    }

    if (action.expires < new Date()) {
        throw new KnownError("Action expired");
    }

    if (!action.tags.includes("verify-email")) {
        throw new KnownError("Wrong action type");
    }

    if (typeof action.state !== "object" || action.state === null || !("email" in action.state)) {
        throw new KnownError("Invalid action state");
    }

    const email_id = z.string().cuid().parse(action.state.email);
    const email = await prisma.email.findUnique({ where: { id: email_id } });

    if (!email) {
        throw new KnownError("Email not found");
    }

    if (email.verified) {
        throw new KnownError("Email already verified");
    }

    await prisma.email.update({
        where: { id: email.id },
        data: { verified: true }
    });

    await prisma.action.delete({ where: { id } });
}
