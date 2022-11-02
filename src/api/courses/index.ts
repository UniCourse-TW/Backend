import Router from "@koa/router";
import { SearchError, default_course_search } from "@unicourse-tw/course-search";
import { z } from "zod";
import debug from "debug";
import key from "./key";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const log = debug("api:course");
const router = new Router();

const query = z.object({
    q: z.string().min(1)
});

router.get("/", async ctx => {
    try {
        const { q } = query.parse(ctx.query);

        log("parsing query", q);
        const search = default_course_search(q);
        log("searching courses", search);
        const courses = await prisma.course.findMany(search);
        log("searching courses done", courses.length);

        Ok(ctx, courses);
    } catch (error) {
        if (error instanceof z.ZodError) {
            Err(ctx, error.message, { code: 400 });
        } else if (error instanceof SearchError) {
            Err(ctx, error.message, { code: 400 });
        } else {
            Err(ctx, "Internal server error");
        }
    }
});

router.use("/:id", key.routes());
export default router;
