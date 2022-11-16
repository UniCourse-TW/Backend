import { SearchError, default_course_search } from "@unicourse-tw/course-search";
import { v } from "@unicourse-tw/validation";
import { z } from "zod";
import key from "./key";
import debug from "@/debug";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const log = debug("api:course");
const router = new UniRouter();

const query = z.object({
    q: v.query
});

router.get("/", async ctx => {
    try {
        const { q } = query.parse(ctx.query);

        log("parsing query", q);
        const search = default_course_search(q);
        log("searching courses", search);
        const courses = await prisma.course.findMany(search);
        log("searching courses done", courses.length);

        ctx.ok(courses);
    } catch (error) {
        if (error instanceof z.ZodError) {
            ctx.err(error.message, { code: 400 });
        } else if (error instanceof SearchError) {
            ctx.err(error.message, { code: 400 });
        } else {
            ctx.err("Internal server error");
        }
    }
});

router.use("/:id", key.routes());
export default router;
