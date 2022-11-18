import { ZodError, z } from "zod";
import type { CourseType } from "@unicourse-tw/prisma";

const teacher_schema = z.object({
    name: z.string().min(1).max(255),
    id: z.string().min(1).max(255)
});

export type PackedTeacher = z.infer<typeof teacher_schema>;

const program_schema = z.object({
    name: z.string().min(1).max(255),
    id: z.string().min(1).max(255)
});

export type PackedProgram = z.infer<typeof program_schema>;

const course_schema = z.object({
    id: z.string().min(1).max(255),
    year: z.number().int().min(-1).max(9999),
    term: z.number().int().min(-1).max(9),
    name: z.string().min(1).max(255),
    description: z.string().max(65535),
    code: z.string().max(255),
    type: z.enum(["Compulsory", "Elective", "General", "Other"] as [CourseType, ...CourseType[]]),
    credit: z.number().int().min(-1).max(999),
    extra: z.any().optional(),
    teachers: z.array(z.string().min(1).max(255)),
    programs: z.array(z.string().min(1).max(255)),
    prerequisites: z.array(z.string().min(1).max(255))
});

export type PackedCourse = z.infer<typeof course_schema>;

export interface PackedEntity {
    name: string
    courses: PackedCourse[]
    children: PackedEntity[]
}

const entity_schema: z.ZodType<PackedEntity> = z.lazy(() => z.object({
    name: z.string().min(1).max(255),
    courses: z.array(course_schema),
    children: z.array(entity_schema)
}));

export interface CoursePack {
    $schema?: "https://esm.sh/course-pack/schema.json"
    teachers: PackedTeacher[]
    programs: PackedProgram[]
    entities: PackedEntity[]
}

const packed_schema = z.object({
    teachers: z.array(teacher_schema),
    programs: z.array(program_schema),
    entities: z.array(entity_schema)
});

/**
 * Verify the course pack, throw a `ZodError` if the pack is invalid.
 * @param object The course pack to verify.
 * @returns The verified course pack.
 */
export function verify(object: unknown): CoursePack {
    return packed_schema.parse(object);
}

export { ZodError };
