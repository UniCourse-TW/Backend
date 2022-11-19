import { prisma } from "@/prisma";

/**
 * Dispatch daily invitation code if eligible
 * @param user_id User ID
 */
export async function dispatch_daily_invitation(user_id: string): Promise<void> {
    const prefix_96h = `c${(Date.now() - 96 * 60 * 60 * 1000).toString(36)}`;
    const prefix_24h = `c${(Date.now() - 24 * 60 * 60 * 1000).toString(36)}`;

    if (user_id < prefix_96h || user_id >= prefix_24h) {
        return;
    }

    const today = await prisma.invitation.findFirst({
        where: { from: user_id, type: "daily", id: { gte: prefix_24h } }
    });

    if (today) {
        return;
    }

    await prisma.invitation.create({
        data: { from: user_id, type: "daily" }
    });
}
