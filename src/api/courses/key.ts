import type { EndpointResponseBody, GET } from "unicourse";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    const id = ctx.params.id;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            provider: true,
            programs: true,
            teachers: true
        }
    });

    if (course === null) {
        ctx.err("Course not found", { code: 404 });
        return;
    }

    ctx.ok<EndpointResponseBody<`courses/${string}`, typeof GET>>(course);
});

export default router;
