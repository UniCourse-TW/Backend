import { Command } from "commander";
import chalk from "chalk";
import { UniCourse } from "unicourse";
import { config, defaults } from "../store";

const command = new Command("whoami")
    .description("Show the current user")
    .action(async () => {
        if (config.token) {
            const server = config.server || defaults.server;

            const uni = new UniCourse(config.token, { server });
            const user = uni.whoami();
            if (user) {
                console.log(chalk.green("You are logged in as"), chalk.bold(user.username));
            } else {
                console.log(chalk.red("Invalid token"));
            }
        } else {
            console.log(chalk.red("Not logged in"));
        }
    });

export default command;
