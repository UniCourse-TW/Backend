import { ZodError, z } from "zod";
import { CourseType } from "@unicourse-tw/prisma";

const teacher_schema = z.object({
    name: z.string().min(1).max(255),
    id: z.string().min(1).max(255)
});

export type JsonTeacher = z.infer<typeof teacher_schema>;

const program_schema = z.object({
    name: z.string().min(1).max(255),
    id: z.string().min(1).max(255)
});

export type JsonProgram = z.infer<typeof program_schema>;

const course_schema = z.object({
    id: z.string().min(1).max(255),
    year: z.number().int().min(-1).max(9999),
    term: z.number().int().min(-1).max(9),
    name: z.string().min(1).max(255),
    description: z.string().max(65535),
    code: z.string().max(255),
    type: z.nativeEnum(CourseType),
    credit: z.number().int().min(-1).max(999),
    extra: z.any().optional(),
    teachers: z.array(z.string().min(1).max(255)),
    programs: z.array(z.string().min(1).max(255)),
    prerequisites: z.array(z.string().min(1).max(255))
});

export type JsonCourse = z.infer<typeof course_schema>;

export interface JsonEntity {
    name: string
    courses: JsonCourse[]
    children: JsonEntity[]
}

const entity_schema: z.ZodType<JsonEntity> = z.lazy(() => z.object({
    name: z.string().min(1).max(255),
    courses: z.array(course_schema),
    children: z.array(entity_schema)
}));

export interface PackedJson {
    teachers: JsonTeacher[]
    programs: JsonProgram[]
    entities: JsonEntity[]
}

const packed_schema = z.object({
    teachers: z.array(teacher_schema),
    programs: z.array(program_schema),
    entities: z.array(entity_schema)
});

export function verify_packed_json(json: unknown): PackedJson {
    return packed_schema.parse(json);
}

export { ZodError };
