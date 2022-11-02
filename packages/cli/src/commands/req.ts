import { Command } from "commander";
import chalk from "chalk";
import { UniCourse, UniCourseApiError } from "unicourse";
import { config, defaults } from "../store";

const command = new Command("req")
    .description("Send a request to the server")
    .argument("<path>", "The path of the endpoint. (without the leading slash)")
    .argument("[body]", "The body of the request")
    .option("-m, --method <method>", "The HTTP method to use", "GET")
    .option("-s, --server <server>", "The server to log in to", config.server || defaults.server)
    .action(async (path: string, body?: string, opt?) => {
        const uni = new UniCourse(config.token, { server: opt.server });

        try {
            const data = await uni.req(path, {
                method: opt.method.toUpperCase(),
                body
            });

            console.log(JSON.stringify(data, null, 4));
        } catch (err) {
            if (err instanceof UniCourseApiError) {
                console.log(chalk.red(err.status), chalk.red(err.message));
            } else if (err instanceof Error) {
                console.log(chalk.red(err.message));
            }
        }
    });

export default command;
