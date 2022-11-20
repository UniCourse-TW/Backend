/* eslint-disable max-len */
import { z } from "zod";
import cuid from "cuid";
import argon from "argon2";
import { send_mail } from "@unicourse-tw/notify";
import { prisma } from "@/prisma";
import { FRONTEND_BASE_URL } from "@/config";
import { KnownError } from "@/error";

/**
 * Send a password reset email to the user.
 * @param id User ID.
 */
export async function request_password_reset(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            snapshots: {
                take: 1,
                where: { revoked: false },
                orderBy: { id: "desc" },
                include: {
                    email: true
                }
            }
        }
    });

    if (!user) {
        throw new KnownError("User not found");
    }

    const snapshot = user.snapshots[0];
    if (!snapshot) {
        throw new KnownError("User snapshot not found");
    }

    if (snapshot.email.verified !== true) {
        throw new KnownError("Email not verified");
    }

    const expires = new Date(Date.now() + 1000 * 60 * 30);
    const action = await prisma.action.upsert({
        where: { key: `reset-password-${id}` },
        update: {
            id: cuid(),
            tags: { set: ["reset-password"] },
            expires,
            actors: { connect: { id: snapshot.user_id } }
        },
        create: {
            key: `reset-password-${id}`,
            tags: ["reset-password"],
            expires,
            state: { user: id },
            actors: { connect: { id: snapshot.user_id } }
        }
    });

    const url = `${FRONTEND_BASE_URL}/reset-password?id=${action.id}`;
    const html = `
        <p>Hello ${snapshot.username},</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <a href="${url}">${url}</a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you did not request to reset your password, please ignore this email.</p>
    `;
    await send_mail(snapshot.email.email, "Reset Your UniCourse Password", html);
}

/**
 * Reset the user's password.
 * @param id Action ID.
 * @param password New password.
 */
export async function reset_password(id: string, password: string): Promise<void> {
    const action = await prisma.action.findUnique({ where: { id } });

    if (!action) {
        throw new KnownError("Action not found");
    }

    if (action.expires < new Date()) {
        throw new KnownError("Action expired");
    }

    if (!action.tags.includes("reset-password")) {
        throw new KnownError("Wrong action type");
    }

    if (action.tags.includes("completed")) {
        throw new KnownError("Action already completed");
    }

    if (typeof action.state !== "object" || action.state === null || !("user" in action.state)) {
        throw new KnownError("Invalid action state");
    }

    const user_id = z.string().cuid().parse(action.state.user);
    const user = await prisma.user.findUnique({
        where: { id: user_id },
        include: {
            snapshots: {
                take: 1,
                where: { revoked: false },
                orderBy: { id: "desc" }
            }
        }
    });

    if (!user) {
        throw new KnownError("User not found");
    }

    const snapshot = user.snapshots[0];
    if (!snapshot) {
        throw new KnownError("User snapshot not found");
    }

    const hash = await argon.hash(password);

    await prisma.$transaction([
        prisma.userSnapshot.update({
            where: { id: snapshot.id },
            data: { revoked: true }
        }),
        prisma.userSnapshot.create({
            data: {
                ...snapshot,
                password: hash,
                id: undefined
            }
        }),
        prisma.action.update({
            where: { id },
            data: {
                expires: new Date(),
                tags: { set: ["reset-password", "completed"] }
            }
        })
    ]);
}
