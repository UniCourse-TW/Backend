import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { mapping } from "file-mapping";
import type { Config } from "./types";

export const home = path.join(os.homedir(), ".unicourse");

if (!fs.existsSync(home)) {
    fs.mkdirSync(home, { recursive: true });
}

export const config = mapping<Config>(path.join(home, "config.json"), {});

export const defaults = {
    server: "http://localhost:8080"
};
