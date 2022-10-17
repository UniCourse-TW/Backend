import Router from "@koa/router";
import { z } from "zod";
import debug from "debug";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";
import { date2term } from "@/utils";

const log = debug("api:course");
const router = new Router();

const query = z.object({
    q: z.string().min(1)
});

router.get("/", async ctx => {
    try {
        const { q } = query.parse(ctx.query);
        const { year, term, key } = parse_query(q);

        log("Querying courses", year, term, key);

        const courses = await prisma.course.findMany({
            where: {
                year,
                term,
                OR: [
                    {
                        teachers: {
                            some: {
                                OR: key.map(k => ({ name: { contains: k } }))
                            }
                        }
                    },
                    {
                        programs: {
                            some: {
                                OR: key.map(k => ({ name: { contains: k.replace("學程", "") } }))
                            }
                        }
                    },
                    { OR: key.map(k => ({ name: { contains: k } })) },
                    { code: { in: key } }
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

function parse_query(q: string): { school: string; year: number; term: number; key: string[] } {
    const regexp = /(?:"[^"]*"|[^"\s]+)/g;
    const matches = q.match(regexp);

    if (matches === null) {
        return { school: "", year: 0, term: 0, key: [] };
    }

    let school = "";
    let [year, term] = date2term();
    const key: string[] = [];

    for (let match of matches) {
        if (match[0] === "\"" && match[match.length - 1] === "\"") {
            match = match.slice(1, -1);
        }

        if (match.startsWith("school:")) {
            school = match.slice(7);
        } else if (match.startsWith("year:")) {
            year = parseInt(match.slice(5));
        } else if (match.startsWith("term:")) {
            term = parseInt(match.slice(5));
        } else {
            key.push(match);
        }
    }

    return { school, year, term, key };
}
