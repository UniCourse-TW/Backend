import argon2 from "argon2";
import { hash } from "unicourse";
import { debug } from "@/debug";
import { UNICORSE_ROOT_PASSWORD, UNICORSE_ROOT_USER } from "@/config";
import { prisma } from "@/prisma";

const log = debug("initialize");

export async function initialize(): Promise<void> {
    log("initializing unicourse");

    log("checking default permissions");
    const permissions = await prisma.userPermission.findMany();
    const defaults = ["admin", "moderator", "collaborator", "verified"];
    for (const permission of defaults) {
        if (!permissions.some(p => p.name === permission)) {
            log("permission not found, creating", permission);
            await prisma.userPermission.create({ data: { name: permission } });
            log("permission created", permission);
        } else {
            log("permission found", permission);
        }
    }

    log("checking root user");
    const root = await prisma.userSnapshot.findFirst({
        where: { username: UNICORSE_ROOT_USER },
        orderBy: { id: "desc" }
    });
    if (root === null) {
        log("root user not found, creating");
        const new_root = await prisma.user.create({ data: {} });
        const email = await prisma.email.create({ data: { email: "" } });
        await prisma.userSnapshot.create({
            data: {
                user: { connect: { id: new_root.id } },
                email: { connect: { id: email.id } },
                username: UNICORSE_ROOT_USER,
                password: await argon2.hash(await hash(UNICORSE_ROOT_PASSWORD)),
                perms: { connect: defaults.map(name => ({ name })) }
            }
        });
        await prisma.userProfile.create({
            data: {
                user: { connect: { id: new_root.id } },
                name: "Admin",
                bio: "HM of the UniCourse Kingdom",
                school: "UniCourse Kingdom",
                email: "",
                location: "UniCourse Kingdom",
                banner: "",
                // eslint-disable-next-line max-len
                avatar: "https://raw.githubusercontent.com/UniCourse-TW/Public-Assets/main/icon/UniCourse_icon.svg",
                extra: {}
            }
        });
        log("root user created");
    } else {
        log("root user found");
    }

    log("initializing unicourse done");
}
