import login from "./login";
import register from "./register";
import UniRouter from "@/router";

const router = new UniRouter();

router
    .use(login.routes())
    .use(register.routes());

export default router;
