import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { UniCourse, UniCourseApiError } from "unicourse";
import { config, defaults } from "../store";

const command = new Command("login")
    .description("Log in to the UniCourse server")
    .argument("<username>", "Your username")
    .option("-s, --server <server>", "The server to log in to", config.server || defaults.server)
    .action(async (username: string, opt) => {
        const uni = new UniCourse(undefined, { server: opt.server });

        const { password } = await inquirer.prompt([
            {
                type: "password",
                name: "password",
                message: "Password",
                mask: "*",
                validate: (input: string) => {
                    if (input.length < 9) {
                        return "Password too short";
                    }
                    return true;
                }
            }
        ]);

        try {
            const token = await uni.login(username, password);
            if (!uni.raw_token) {
                throw new Error("No raw token found");
            }

            config.token = uni.raw_token;
            config.server = opt.server;
            console.log(chalk.green("Logged in as"), chalk.bold(token.username));
        } catch (err) {
            if (err instanceof UniCourseApiError) {
                console.log(chalk.red(err.status), chalk.red(err.message));
            } else if (err instanceof Error) {
                console.log(chalk.red(err.message));
            }
        }
    });

export default command;
