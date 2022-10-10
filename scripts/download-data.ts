import fs from "node:fs";
import { program } from "commander";
import ora from "ora";
import fetch from "node-fetch";

program
    .argument("<year-term...>", "files to download, e.g. 111-1")
    .option("-d, --dir <dir>", "directory to save", "data")
    .action(async (files: string[], { dir }: { dir: string }) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const spinner = ora("Downloading data");
        for (const file of files) {
            spinner.start(`Downloading ${file}`);
            // eslint-disable-next-line max-len
            const url = `https://raw.githubusercontent.com/JacobLinCool/NTNU-Course-Crawler/data/squashed/${file}.json`;
            const res = await fetch(url);
            const data = await res.json();
            fs.writeFileSync(`${dir}/${file}.json`, JSON.stringify(data));
            spinner.succeed(`Downloaded ${file}`);
        }
    })
    .parse();
