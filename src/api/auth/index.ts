import login from "./login";
import register from "./register";
import send_verify from "./send-verify";
import verify from "./verify";
import send_reset from "./send-reset";
import reset from "./reset";
import UniRouter from "@/router";

const router = new UniRouter();

router
    .use(login.routes())
    .use(register.routes())
    .use(send_verify.routes())
    .use(verify.routes())
    .use(send_reset.routes())
    .use(reset.routes());

export default router;
