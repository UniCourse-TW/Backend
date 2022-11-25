import type { Prisma } from "@unicourse-tw/prisma";
import { SearchError } from "./errors";
import { parse_query } from "./parser";
import { date2term } from "./date";

export function default_course_search(q: string): {
    include: {
        provider: true
        programs: true
        teachers: true
    } } & Prisma.CourseFindManyArgs {
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

    if ((map.provider?.length ?? 0) > 0) {
        conditions.push({
            provider: {
                OR: [
                    ...map.provider.map(p => ({ id: p })),
                    ...map.provider.map(p => ({ name: { contains: p } }))
                ]
            }
        });
    }

    if (wilds.length > 0) {
        conditions.push({ OR: wilds.map(w => ({ name: { contains: w } })) });
        conditions.push({ code: { in: wilds } });
    }

    const time_conditions: Prisma.Enumerable<Prisma.CourseWhereInput> = [];
    if (!map.term) {
        const [year, term] = date2term();
        time_conditions.push({ year, term });
    } else {
        for (const raw of map.term) {
            const [year, term] = raw.split("-").map(x => parseInt(x));
            if (!isNaN(year) && !isNaN(term)) {
                time_conditions.push({ year, term });
            }
        }
    }

    const sort = map.sort?.[0] === "asc" ? "asc" : "desc";

    const order: Prisma.Enumerable<Prisma.CourseOrderByWithRelationAndSearchRelevanceInput> = [];
    if (!map.order) {
        order.push({
            _relevance: {
                fields: ["name", "description"],
                search: wilds.join(" "),
                sort
            }
        });
    } else {
        const simple_keys = ["name", "code", "credit", "year", "term", "type"];
        const complex_keys = ["teachers", "programs", "prerequisites"];
        for (const key of map.order) {
            if (simple_keys.includes(key)) {
                order.push({ [key]: sort });
            } else if (complex_keys.includes(key)) {
                order.push({ [key]: { _count: sort } });
            }
        }
    }

    return {
        where: {
            AND: [
                { OR: conditions },
                { OR: time_conditions }
            ]
        },
        include: {
            provider: true,
            programs: true,
            teachers: true
        },
        orderBy: order
    };
}
