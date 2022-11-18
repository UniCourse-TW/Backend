import { z } from "zod";
import { CONFIG } from "./config";

/**
 * Search limit.
 * Default: `CONFIG.LIMIT_DEFAULT` (20)
 * Max: `CONFIG.LIMIT_MAX` (100)
 */
export const limit = z.preprocess(
    x => Number(x) || CONFIG.LIMIT_DEFAULT,
    z.number()
        .positive({ message: "Limit must be positive." })
        .int({ message: "Limit must be an integer." })
        .max(CONFIG.LIMIT_MAX, { message: `Limit cannot be greater than ${CONFIG.LIMIT_MAX}.` })
);

/**
 * Search offset.
 * Default: 0
 */
export const offset = z.preprocess(
    x => Number(x) || 0,
    z.number()
        .int({ message: "Offset must be an integer." })
        .min(0, { message: "Offset cannot be negative." })
);

/**
 * Search query.
 * Should be a string of length greater than 0.
 */
export const query = z.string()
    .min(1, { message: "Query cannot be empty." })
    .max(CONFIG.QUERY_MAX_LENGTH, {
        message: `Query cannot be longer than ${CONFIG.QUERY_MAX_LENGTH} characters.`
    });
