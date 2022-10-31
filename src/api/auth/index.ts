import Router from "@koa/router";
import login from "./login";
import register from "./register";

const router = new Router();

router
    .use(login.routes())
    .use(register.routes());

export default router;
