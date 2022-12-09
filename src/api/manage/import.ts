import type {
    CoursePack,
    PackedCourse,
    PackedEntity,
    PackedProgram,
    PackedTeacher
} from "course-pack";
import { verify as verify_course_pack } from "course-pack";
import type { EndpointRequestBody, EndpointResponseBody, POST } from "unicourse";
import cuid from "cuid";
import type { CourseProgram, Entity, Teacher } from "@unicourse-tw/prisma";
import { down } from "@unicourse-tw/arborist";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.post("/", async ctx => {
    const { body } = ctx.request as {
        body: EndpointRequestBody<"manage/import", typeof POST>
    };
    if (!body) {
        ctx.err("No body", { code: 400 });
        return;
    }

    const json = verify_course_pack(body);

    let result: {
        teachers: string[]
        courses: string[]
        programs: string[]
    };
    try {
        if (body.scope) {
            result = await scoped_resolver(json, body.scope);
        } else {
            result = await default_resolver(json);
        }
        ctx.ok<EndpointResponseBody<"manage/import", typeof POST>>(result);
    } catch (err) {
        if (err instanceof Error) {
            ctx.err(err.message, { code: 400 });
        }
    }
});

export default router;

async function default_resolver(pack: CoursePack): Promise<{
    teachers: string[]
    courses: string[]
    programs: string[]
}> {
    const raw_teachers = new Map<string, PackedTeacher>();
    for (const teacher of pack.teachers) {
        if (raw_teachers.has(teacher.id)) {
            throw new Error(`Duplicate teacher id: ${teacher.id}`);
        }
        raw_teachers.set(teacher.id, teacher);
    }
    const teachers = new Map<string, string>();
    for (const teacher of pack.teachers) {
        const existing = await prisma.teacher.findUnique({
            where: { id: teacher.id }
        });
        if (existing) {
            teachers.set(teacher.id, existing.id);
        } else {
            const result = await prisma.teacher.create({
                data: {
                    id: cuid.isCuid(teacher.id) ? teacher.id : cuid(),
                    name: teacher.name
                }
            });
            teachers.set(teacher.id, result.id);
        }
    }

    const raw_programs = new Map<string, PackedProgram>();
    for (const program of pack.programs) {
        if (raw_programs.has(program.id)) {
            throw new Error(`Duplicate program id: ${program.id}`);
        }
        raw_programs.set(program.id, program);
    }
    const programs = new Map<string, string>();
    for (const program of pack.programs) {
        const existing = await prisma.courseProgram.findUnique({
            where: { id: program.id }
        });
        if (existing) {
            programs.set(program.id, existing.id);
        } else {
            const result = await prisma.courseProgram.create({
                data: {
                    id: cuid.isCuid(program.id) ? program.id : cuid(),
                    name: program.name
                }
            });
            programs.set(program.id, result.id);
        }
    }

    const courses = new Map<PackedCourse, string>();
    const course_mapping = new Map<string, string>();
    const roots = pack.entities;
    for (const root of roots) {
        const queue = [root];
        const parent = new Map<PackedEntity, Entity | null>();
        parent.set(root, null);
        while (queue.length > 0) {
            const current = queue.shift()!;

            const node = await prisma.entity.findFirst({
                where: {
                    name: current.name,
                    parent_id: parent.get(current)?.id
                }
            }) ?? await prisma.entity.create({
                data: {
                    name: current.name,
                    parent_id: parent.get(current)?.id
                }
            });

            for (const c of current.children) {
                queue.push(c);
                parent.set(c, node);
            }

            for (const course of current.courses) {
                const c = {
                    id: cuid.isCuid(course.id) ? course.id : undefined,
                    name: course.name,
                    description: course.description,
                    code: course.code,
                    type: course.type,
                    credit: course.credit,
                    extra: course.extra,
                    year: course.year,
                    term: course.term,
                    provider: { connect: { id: node.id } },
                    teachers: {
                        connect: course.teachers.map(t => ({ id: teachers.get(t)! }))
                    },
                    programs: {
                        connect: course.programs.map(p => ({ id: programs.get(p)! }))
                    }
                };
                const result = await prisma.course.upsert({
                    where: { id: course.id },
                    update: c,
                    create: c
                });
                await prisma.entity.update({
                    where: { id: node.id },
                    data: {
                        teachers: {
                            connect: course.teachers.map(t => ({ id: teachers.get(t)! }))
                        }
                    }
                });
                courses.set(course, result.id);
                course_mapping.set(course.id, node.id);
            }
        }
    }

    for (const [course, id] of courses) {
        if (course.prerequisites.length > 0) {
            await prisma.course.update({
                where: { id },
                data: {
                    prerequisites: {
                        connect: course.prerequisites.map(c => ({ id: course_mapping.get(c) }))
                    }
                }
            });
        }
    }

    return {
        teachers: [...(teachers.values())],
        programs: [...(programs.values())],
        courses: [...(courses.values())]
    };
}

async function scoped_resolver(pack: CoursePack, scope: string): Promise<{
    teachers: string[]
    courses: string[]
    programs: string[]
}> {
    const raw_teachers = new Map<string, PackedTeacher>();
    for (const teacher of pack.teachers) {
        if (raw_teachers.has(teacher.id)) {
            throw new Error(`Duplicate teacher id: ${teacher.id}`);
        }
        raw_teachers.set(teacher.id, teacher);
    }

    const raw_programs = new Map<string, PackedProgram>();
    for (const program of pack.programs) {
        if (raw_programs.has(program.id)) {
            throw new Error(`Duplicate program id: ${program.id}`);
        }
        raw_programs.set(program.id, program);
    }

    const root = await prisma.entity.findUnique({
        where: { id: scope },
        ...down({
            include: {
                courses: {
                    select: {},
                    include: {
                        programs: {
                            select: { id: true, name: true }
                        },
                        teachers: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        })
    });
    if (!root) {
        throw new Error(`No such entity: ${scope}`);
    }

    const existing_teachers = new Map<string, Teacher>();
    const existing_programs = new Map<string, CourseProgram>();

    const queue = [root];
    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const c of current.courses) {
            for (const t of c.teachers) {
                existing_teachers.set(t.name, t);
            }
            for (const p of c.programs) {
                existing_programs.set(p.name, p);
            }
        }
        queue.push(...current.children);
    }

    const teachers = new Map<string, string>();
    for (const teacher of pack.teachers) {
        const existing = existing_teachers.get(teacher.name);
        if (existing) {
            teachers.set(teacher.id, existing.id);
        } else {
            const result = await prisma.teacher.create({
                data: {
                    id: cuid.isCuid(teacher.id) ? teacher.id : cuid(),
                    name: teacher.name
                }
            });
            teachers.set(teacher.id, result.id);
        }
    }

    const programs = new Map<string, string>();
    for (const program of pack.programs) {
        const existing = existing_programs.get(program.name);
        if (existing) {
            programs.set(program.id, existing.id);
        } else {
            const result = await prisma.courseProgram.create({
                data: {
                    id: cuid.isCuid(program.id) ? program.id : cuid(),
                    name: program.name
                }
            });
            programs.set(program.id, result.id);
        }
    }

    const courses = new Map<PackedCourse, string>();
    const course_mapping = new Map<string, string>();
    const roots = pack.entities;
    for (const root of roots) {
        const queue = [root];
        const parent = new Map<PackedEntity, Entity | null>();
        parent.set(root, null);
        while (queue.length > 0) {
            const current = queue.shift()!;

            const node = await prisma.entity.findFirst({
                where: {
                    name: current.name,
                    parent_id: parent.get(current)?.id
                }
            }) ?? await prisma.entity.create({
                data: {
                    name: current.name,
                    parent_id: parent.get(current)?.id
                }
            });

            for (const c of current.children) {
                queue.push(c);
                parent.set(c, node);
            }

            for (const course of current.courses) {
                const c = {
                    id: cuid.isCuid(course.id) ? course.id : undefined,
                    name: course.name,
                    description: course.description,
                    code: course.code,
                    type: course.type,
                    credit: course.credit,
                    extra: course.extra,
                    year: course.year,
                    term: course.term,
                    provider: { connect: { id: node.id } },
                    teachers: {
                        connect: course.teachers.map(t => ({ id: teachers.get(t)! }))
                    },
                    programs: {
                        connect: course.programs.map(p => ({ id: programs.get(p)! }))
                    }
                };
                const result = await prisma.course.upsert({
                    where: { id: course.id },
                    update: c,
                    create: c
                });
                await prisma.entity.update({
                    where: { id: node.id },
                    data: {
                        teachers: {
                            connect: course.teachers.map(t => ({ id: teachers.get(t)! }))
                        }
                    }
                });
                courses.set(course, result.id);
                course_mapping.set(course.id, node.id);
            }
        }
    }

    for (const [course, id] of courses) {
        if (course.prerequisites.length > 0) {
            await prisma.course.update({
                where: { id },
                data: {
                    prerequisites: {
                        connect: course.prerequisites.map(c => ({ id: course_mapping.get(c) }))
                    }
                }
            });
        }
    }

    return {
        teachers: [...(teachers.values())],
        programs: [...(programs.values())],
        courses: [...(courses.values())]
    };
}
