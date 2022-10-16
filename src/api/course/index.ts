import Router from "@koa/router";
import { z } from "zod";
import debug from "debug";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const log = debug("api:course");
const router = new Router();

const query = z.object({
    year: z.string().transform(year => parseInt(year)).refine(year => year >= 107 && year <= 111),
    term: z.string().transform(term => parseInt(term)).refine(term => term >= 1 && term <= 2),
    q: z.string().min(1)
});

router.get("/query", async ctx => {
    try {
        const { year, term, q } = query.parse(ctx.query);

        log("Querying courses", year, term, q);
        const courses = await prisma.course.findMany({
            where: {
                year,
                term,
                OR: [
                    { teachers: { some: { name: q } } },
                    { programs: { some: { name: { contains: q } } } },
                    { name: { contains: q } },
                    { code: q }
                ]
            },
            include: {
                department: true,
                programs: true,
                teachers: true
            }
        });
        log("Querying courses done", courses.length);

        Ok(ctx, courses);
    } catch (error) {
        if (error instanceof z.ZodError) {
            Err(ctx, error.message, { code: 400 });
        } else {
            Err(ctx, "Internal server error");
        }
    }
});

export default router;
