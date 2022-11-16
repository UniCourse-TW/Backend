import { z } from "zod";
import { CONFIG } from "./config";

/**
 * String with length limit.
 */
export const string = z.string().max(CONFIG.SAFE_STRING_MAX_LENGTH, {
    message: `Cannot be longer than ${CONFIG.SAFE_STRING_MAX_LENGTH} characters.`
});

/**
 * URL with length limit.
 */
export const url = string.url();
