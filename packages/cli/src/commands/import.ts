import fs from "node:fs";
import { Command } from "commander";
import chalk from "chalk";
import { UniCourse, UniCourseApiError, ZodError } from "unicourse";
import { config, defaults } from "../store";

const command = new Command("import")
    .description("Import course pack from a JSON file")
    .argument("<file>", "File path")
    .option("-s, --server <server>", "The server to log in to", config.server || defaults.server)
    .action(async (file: string, opt) => {
        const uni = new UniCourse(config.token, { server: opt.server });

        try {
            const json = JSON.parse(fs.readFileSync(file, "utf8"));
            const result = await uni.import(json);
            for (const [key, value] of Object.entries(result)) {
                console.log(chalk.cyan.bold(key), value.join(", "));
            }
            console.log(chalk.green("Imported successfully"));
        } catch (err) {
            if (err instanceof UniCourseApiError) {
                console.log(chalk.red(err.status), chalk.red(err.message));
            } else if (err instanceof ZodError) {
                for (const issue of err.issues) {
                    console.log(chalk.red.bold(issue.path.join(".")), chalk.red(issue.message));
                }
                console.log(chalk.red("Invalid JSON file"));
            } else if (err instanceof Error) {
                console.log(chalk.red(err.message));
            }
        }
    });

export default command;
