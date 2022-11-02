import { Command } from "commander";
import chalk from "chalk";
import { config } from "../store";

const command = new Command("logout")
    .description("Log out and clear the token")
    .action(async () => {
        if (config.token) {
            config.token = undefined;
            config.server = undefined;
            console.log(chalk.green("Logged out"));
        } else {
            console.log(chalk.red("Not logged in"));
        }
    });

export default command;
