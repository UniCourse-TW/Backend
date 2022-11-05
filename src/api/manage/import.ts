import Router from "@koa/router";
import type { PackedCourse, PackedEntity, PackedProgram, PackedTeacher } from "course-pack";
import { verify as verify_course_pack } from "course-pack";
import debug from "debug";
import cuid from "cuid";
import type { Entity } from "@unicourse-tw/prisma";
import { prisma } from "@/prisma";
import { Err, Ok } from "@/response";

const log = debug("api:manage:import");
const router = new Router();

router.post("/", async ctx => {
    const { body } = ctx.request;
    if (!body) {
        Err(ctx, "No body", { code: 400 });
        return;
    }

    try {
        const json = verify_course_pack(body);

        const raw_teachers = new Map<string, PackedTeacher>();
        for (const teacher of json.teachers) {
            if (raw_teachers.has(teacher.id)) {
                Err(ctx, `Duplicate teacher id: ${teacher.id}`, { code: 400 });
                return;
            }
            raw_teachers.set(teacher.id, teacher);
        }
        const teachers = new Map<string, string>();
        for (const teacher of json.teachers) {
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
        for (const program of json.programs) {
            if (raw_programs.has(program.id)) {
                Err(ctx, `Duplicate program id: ${program.id}`, { code: 400 });
                return;
            }
            raw_programs.set(program.id, program);
        }
        const programs = new Map<string, string>();
        for (const program of json.programs) {
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
        const roots = json.entities;
        for (const root of roots) {
            const queue = [root];
            const parent = new Map<PackedEntity, Entity | null>();
            parent.set(root, null);
            while (queue.length > 0) {
                const current = queue.shift()!;

                const node = await prisma.entity.findFirst({
                    where: {
                        OR: [{ id: root.name }, { name: root.name }],
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
                    const result = await prisma.course.create({
                        data: {
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

        Ok(ctx, {
            teachers: [...(teachers.values())],
            programs: [...(programs.values())],
            courses: [...(courses.values())]
        });
    } catch (err) {
        log(err);
        Err(ctx, "Invalid JSON", { code: 400 });
    }
});

export default router;
