import Router from "@koa/router";
import route_import from "./import";

const router = new Router();

router.use("/import", route_import.routes());
export default router;
