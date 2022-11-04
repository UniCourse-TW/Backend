import type { Prisma } from "@unicourse-tw/prisma";
import { SearchError } from "./errors";
import { parse_query } from "./parser";
import { date2term } from "./date";

export function default_course_search(q: string): Prisma.CourseFindManyArgs {
    const map = parse_query(q);

    if (Object.keys(map).length === 0) {
        throw new SearchError("Invalid query");
    }

    const wilds = map._ ?? [];
    const teachers = [...new Set([...(map.teacher ?? []), ...(map.t ?? []), ...wilds])];
    const programs = [...new Set([...(map.program ?? []), ...(map.p ?? []), ...wilds])];

    const conditions: Prisma.Enumerable<Prisma.CourseWhereInput> = [];

    if (teachers.length > 0) {
        conditions.push({
            teachers: { some: { OR: teachers.map(t => ({ name: { contains: t } })) } }
        });
    }

    if (programs.length > 0) {
        conditions.push({
            programs: { some: { OR: programs.map(p => ({ name: { contains: p } })) } }
        });
    }

    if (wilds.length > 0) {
        conditions.push({ OR: wilds.map(w => ({ name: { contains: w } })) });
        conditions.push({ code: { in: wilds } });
    }

    let [year, term] = date2term();
    year = parseInt(map.year?.[0]) || year;
    term = parseInt(map.term?.[0]) || term;

    return {
        where: {
            OR: conditions,
            year,
            term
        },
        include: {
            provider: true,
            programs: true,
            teachers: true
        },
        orderBy: {
            _relevance: {
                fields: ["name", "description"],
                search: wilds.join(" "),
                sort: "desc"
            }
        }
    };
}
