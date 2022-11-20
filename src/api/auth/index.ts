import login from "./login";
import register from "./register";
import send_verify from "./send-verify";
import verify from "./verify";
import UniRouter from "@/router";

const router = new UniRouter();

router
    .use(login.routes())
    .use(register.routes())
    .use(send_verify.routes())
    .use(verify.routes());

export default router;
