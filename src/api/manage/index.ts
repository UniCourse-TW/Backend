import route_import from "./import";
import route_export from "./export";
import UniRouter from "@/router";

const router = new UniRouter();

router.use("/import", route_import.routes());
router.use("/export", route_export.routes());
export default router;
