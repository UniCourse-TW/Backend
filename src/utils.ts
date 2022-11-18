import { execSync } from "node:child_process";
import type { UserSnapshot } from "@unicourse-tw/prisma";
import { prisma } from "@/prisma";

/**
 * Resolve to latest user snapshot by snapshot id, user id, or username.
 * @param identifier Snapshot id, user id, or username.
 * @returns Latest user snapshot.
 */
export async function resolve_user(identifier: string): Promise<UserSnapshot | null> {
    const snapshot = await prisma.userSnapshot.findFirst({
        where: {
            OR: [
                { id: identifier },
                { username: identifier }
            ],
            revoked: false
        },
        orderBy: { id: "desc" }
    });

    if (snapshot) {
        return snapshot;
    }

    const user = await prisma.user.findFirst({
        where: { id: identifier },
        include: {
            snapshots: {
                where: { revoked: false },
                orderBy: { id: "desc" },
                take: 1
            }
        }
    });

    if (user) {
        return user.snapshots[0];
    }

    return null;
}

let version: string | null = null;
export function get_version(): string {
    if (version === null) {
        if (process.env.UNICOURSE_VER) {
            version = process.env.UNICOURSE_VER;
        } else if (process.env.GIT_COMMIT) {
            version = process.env.GIT_COMMIT;
        } else {
            try {
                version = execSync("git rev-parse HEAD").toString().trim();
            } catch {
                version = "unknown";
            }
        }
    }

    return version;
}
