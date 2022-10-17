
import Router from "@koa/router";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const router = new Router();

router.get("/", async ctx => {
    const id = parseInt(ctx.params.id);

    if (isNaN(id)) {
        Err(ctx, "Invalid course id", { code: 400 });
        return;
    }

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            department: true,
            programs: true,
            teachers: true
        }
    });

    if (course === null) {
        Err(ctx, "Course not found", { code: 404 });
        return;
    }

    Ok(ctx, course);
});

export default router;
