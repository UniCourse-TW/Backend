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
    q: v.query,
    offset: v.offset,
    limit: v.limit
});

router.get("/", async ctx => {
    try {
        const { q, offset, limit } = query.parse(ctx.query);

        log("parsing query", q);
        const search = default_course_search(q);
        log("searching courses", search);
        const courses = await prisma.course.findMany({
            ...search,
            take: limit,
            skip: offset
        });
        log("searching courses done", courses.length);

        ctx.ok(courses);
    } catch (error) {
        if (error instanceof SearchError) {
            ctx.err(error.message, { code: 400 });
        } else {
            throw error;
        }
    }
});

router.use("/:id", key.routes());
export default router;
