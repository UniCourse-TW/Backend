import route_import from "./import";
import UniRouter from "@/router";

const router = new UniRouter();

router.use("/import", route_import.routes());
export default router;
