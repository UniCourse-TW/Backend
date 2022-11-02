import { Command } from "commander";
import chalk from "chalk";
import { UniCourse, UniCourseApiError } from "unicourse";
import { config, defaults } from "../store";

const command = new Command("status")
    .description("Check the status of the UniCourse server")
    .option("-s, --server <server>", "The server to log in to", defaults.server)
    .action(async opt => {
        const server = opt.server || config.server || defaults.server;
        const uni = new UniCourse(undefined, { server });

        try {
            const status = await uni.status();

            const padding = Math.max(...Object.keys(status).map(k => k.length)) + 2;
            for (const [key, value] of Object.entries(status)) {
                console.log(key.padStart(padding),
                    value === "ok"
                        ? chalk.green(value)
                        : chalk.red(value));
            }
        } catch (err) {
            if (err instanceof UniCourseApiError) {
                console.log(chalk.red(err.status), chalk.red(err.message));
            } else if (err instanceof Error) {
                console.log(chalk.red(err.message));
            }
        }
    });

export default command;
