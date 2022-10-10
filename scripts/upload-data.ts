import fs from "node:fs";
import { CourseType, PrismaClient } from "@prisma/client";
import { program } from "commander";
import ora from "ora";

program
    .argument("<file...>", "files to load")
    .option("-d, --dry", "dry run")
    .action(async (files: string[], { dry }: { dry?: boolean }) => {
        const prisma = new PrismaClient();

        const raw_data = files.reduce((acc, file) => {
            acc.push(...JSON.parse(fs.readFileSync(file, "utf-8")));
            return acc;
        }, [] as Course[]);

        const teachers = [
            ...new Map<string, string>(
                raw_data.flatMap(course =>
                    course.teachers.map(teacher => [`${course.department}-${teacher}`, teacher]))
            ).entries()
        ];
        const departments = [...new Set<string>(raw_data.map(course => course.department))];
        const programs = [...new Set<string>(raw_data.flatMap(course => course.programs))];
        const courses = raw_data.map(course => {
            return {
                ...course,
                id: course.year * 100_000 + course.term * 10_000 + course.serial,
                quota: undefined,
                quota_limit: course.quota.limit,
                quota_additional: course.quota.additional,
                type: course.type === "必"
                    ? CourseType.Compulsory
                    : course.type === "選"
                        ? CourseType.Elective
                        : CourseType.General,
                teachers: {
                    connect: course.teachers.map(teacher => ({
                        id: `${course.department}-${teacher}`
                    }))
                },
                programs: {
                    connect: course.programs.map(program => ({
                        id: program
                    }))
                },
                department: {
                    connect: {
                        id: course.department
                    }
                }
            };
        });

        console.log(
            `${teachers.length} teachers`,
            `${departments.length} departments`,
            `${programs.length} programs`,
            `${courses.length} courses`
        );

        if (!dry) {
            const spinner = ora("Uploading teachers").start();
            await prisma.teacher
                .createMany({
                    data: teachers.map(([id, name]) => ({ id, name }))
                })
                .then(({ count }) => spinner.succeed(`${count} teachers uploaded`));

            spinner.start("Uploading departments");
            await prisma.department
                .createMany({
                    data: departments.map(department => ({ id: department }))
                })
                .then(({ count }) => spinner.succeed(`${count} departments uploaded`));

            spinner.start("Uploading course programs");
            await prisma.courseProgram
                .createMany({
                    data: programs.map(program => ({ id: program, name: program }))
                })
                .then(({ count }) => spinner.succeed(`${count} course programs uploaded`));

            spinner.start("Uploading courses");
            for (const course of courses) {
                await prisma.course.create({ data: course });
                spinner.text = `Uploading courses ${course.id}`;
            }
            spinner.succeed(`${courses.length} courses uploaded`);
        }
    })
    .parse();

interface Course {
    year: number
    term: number
    name: string
    teachers: string[]
    department: string
    code: string
    type: string
    grade: number | null
    credit: number
    serial: number
    group: string
    quota: {
        limit: number
        additional: number
    }
    schedule: any[]
    programs: string[]
    comment: string
    restrict: string
    form_s: string
    classes: string
    dept_group: string
    hours: number
    description: string
    goals: string[]
    syllabus: string
    methodologies: any[]
    grading: any[]
    prerequisite: string
    general_core: any[]
}
