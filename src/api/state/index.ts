import type { EndpointResponseBody, GET } from "unicourse";
import UniRouter from "@/router";
import { prisma } from "@/prisma";

const router = new UniRouter();

router.get("/users", async ctx => {
    const count = await prisma.user.count();
    ctx.ok<EndpointResponseBody<"state/users", typeof GET>>({ count });
});

router.get("/posts", async ctx => {
    const count = await prisma.post.count();
    ctx.ok<EndpointResponseBody<"state/posts", typeof GET>>({ count });
});

router.get("/courses", async ctx => {
    const count = await prisma.course.count();
    ctx.ok<EndpointResponseBody<"state/courses", typeof GET>>({ count });
});

export default router;
