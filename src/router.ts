import Router from "@koa/router";
import type { UniContext, UniState } from "@/types";

export class UniRouter extends Router<UniState, UniContext> {}

export default UniRouter;
