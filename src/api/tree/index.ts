import type { EndpointResponseBody, GET } from "unicourse";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    const { type, id } = ctx.query;

    if (typeof type !== "string") {
        ctx.err("type must be a string", { code: 400 });
        return;
    }
    if (typeof id !== "string") {
        ctx.err("id must be a string", { code: 400 });
        return;
    }
    if (type !== "course" && type !== "entity" && type !== "teacher") {
        ctx.err("type must be course, entity or teacher", { code: 400 });
        return;
    }

    if (type === "course") {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                provider: true,
                teachers: true
            }
        });

        if (!course) {
            ctx.err("course not found", { code: 404 });
            return;
        }

        ctx.ok<EndpointResponseBody<"tree", typeof GET>>(course);
    } else if (type === "entity") {
        const entity = await prisma.entity.findUnique({
            where: { id },
            include: {
                courses: true,
                teachers: true,
                parent: true,
                children: true
            }
        });

        if (!entity) {
            ctx.err("entity not found", { code: 404 });
            return;
        }

        ctx.ok<EndpointResponseBody<"tree", typeof GET>>(entity);
    } else if (type === "teacher") {
        const teacher = await prisma.teacher.findUnique({
            where: { id },
            include: {
                courses: true,
                entities: true
            }
        });

        if (!teacher) {
            ctx.err("teacher not found", { code: 404 });
            return;
        }

        ctx.ok<EndpointResponseBody<"tree", typeof GET>>(teacher);
    }
});

export default router;
