import type { Context } from "koa";

/**
 * A good (200) response.
 * @param ctx The Koa context.
 * @param data The data to send.
 */
export function Ok(ctx: Context, data: any): void {
    ctx.status = 200;
    ctx.body = { data };
}

/**
 * A bad (default to 500) response.
 * @param ctx The Koa context.
 * @param error The error message to send.
 * @param extra Extra parameters.
 * @param extra.code The HTTP status code.
 * @param extra.data The data to send.
 */
export function Err(
    ctx: Context,
    error: string,
    { code = 500, data = undefined }: { code?: number; data?: any } = {}
): void {
    ctx.status = code;
    ctx.body = { error, data };
}
