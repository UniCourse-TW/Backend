import { execSync } from "node:child_process";

let version: string | null = null;
export function get_version(): string {
    if (version === null) {
        if (process.env.UNICOURSE_VER) {
            version = process.env.UNICOURSE_VER;
        } else if (process.env.GIT_COMMIT) {
            version = process.env.GIT_COMMIT;
        } else {
            try {
                version = execSync("git rev-parse HEAD").toString().trim();
            } catch {
                version = "unknown";
            }
        }
    }

    return version;
}
