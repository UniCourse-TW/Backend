import { BACKEND_PORT } from "@/config";
import { initialize } from "@/initialize";
import { server } from "@/server";

main();

async function main() {
    await initialize();
    server.listen(BACKEND_PORT, () => {
        console.log(`Server is running on port ${BACKEND_PORT}`);
    });
}
