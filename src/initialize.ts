import { debug } from "@/debug";
import { UNICORSE_ROOT_PASSWORD, UNICORSE_ROOT_USER } from "@/config";
import { prisma } from "@/prisma";

const log = debug("initialize");

export async function initialize(): Promise<void> {
    return;
    log("initializing unicourse");

    log("checking root user");
    const root = await prisma.userSnapshot.findFirst({
        where: { username: UNICORSE_ROOT_USER },
        orderBy: { id: "desc" }
    });
    if (root === null) {
        log("root user not found, creating");
        const new_root = await prisma.user.create({ data: {} });
        const email = await prisma.email.create({ data: { email: "" } });
        log("root user created");
    } else {
        log("root user found");
    }

    log("checking default permissions");
    const permissions = await prisma.userPermission.findMany();
    const defaults = ["admin", "moderator", "collaborator", "user"];
    for (const permission of defaults) {
        if (!permissions.some(p => p.name === permission)) {
            log("permission not found, creating", permission);
            await prisma.userPermission.create({ data: { name: permission } });
            log("permission created", permission);
        } else {
            log("permission found", permission);
        }
    }

    log("initializing unicourse done");
}
