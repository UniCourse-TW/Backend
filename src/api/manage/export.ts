import type { CoursePack, PackedEntity, PackedProgram, PackedTeacher } from "course-pack";
import type { EndpointResponseBody, GET } from "unicourse";
import { down } from "@unicourse-tw/arborist";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/", async ctx => {
    const { node } = ctx.request.query;
    if (typeof node !== "string") {
        ctx.err("Invalid query", { code: 400 });
        return;
    }

    const root = await prisma.entity.findUnique({
        where: { id: node },
        ...down({
            include: {
                courses: {
                    include: {
                        programs: true,
                        teachers: true,
                        prerequisites: {
                            select: { id: true }
                        }
                    }
                }
            }
        })
    });
    if (!root) {
        ctx.err("Root entity not found", { code: 404 });
        return;
    }

    const teachers = new Map<string, PackedTeacher>();
    const programs = new Map<string, PackedProgram>();

    let tree: PackedEntity = {
        name: "",
        courses: [],
        children: []
    };
    const parents = new Map<string, PackedEntity>();

    const queue = [root];
    while (queue.length > 0) {
        const entity = queue.shift();
        if (!entity) {
            continue;
        }

        for (const course of entity.courses) {
            for (const program of course.programs) {
                if (programs.has(program.id)) {
                    continue;
                }
                programs.set(program.id, {
                    id: program.id,
                    name: program.name
                });
            }

            for (const teacher of course.teachers) {
                if (teachers.has(teacher.id)) {
                    continue;
                }
                teachers.set(teacher.id, {
                    id: teacher.id,
                    name: teacher.name
                });
            }
        }

        const packed_entity: PackedEntity = {
            name: entity.name,
            courses: entity.courses.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description,
                code: c.code,
                type: c.type,
                credit: c.credit,
                year: c.year,
                term: c.term,
                prerequisites: c.prerequisites.map(p => p.id),
                programs: c.programs.map(p => p.id),
                teachers: c.teachers.map(t => t.id),
                extra: c.extra
            })),
            children: []
        };

        if (entity === root) {
            tree = packed_entity;
        } else {
            const parent = parents.get(entity.id);
            if (parent) {
                parent.children.push(packed_entity);
            }
        }

        for (const child of entity.children) {
            parents.set(child.id, packed_entity);
            queue.push(child);
        }
    }

    let current_parent = root.parent_id;
    while (current_parent) {
        const parent = await prisma.entity.findUnique({
            where: { id: current_parent },
            select: { name: true, parent_id: true }
        });

        if (!parent) {
            break;
        }

        tree = {
            name: parent.name,
            courses: [],
            children: [tree]
        };
        current_parent = parent.parent_id;
    }

    const pack: CoursePack = {
        $schema: "https://esm.sh/course-pack/schema.json",
        teachers: [...teachers.values()],
        programs: [...programs.values()],
        entities: [tree]
    };

    ctx.ok<EndpointResponseBody<"manage/export", typeof GET>>(pack);
});

export default router;
