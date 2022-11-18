import { z } from "zod";
import { CONFIG } from "./config";

/**
 * UniCourse Username.
 * Allowed characters: `a-z`, `A-Z`, `0-9`.
 * `A-Z` is converted to `a-z` and other characters are ignored.
 */
export const username = z.preprocess(
    raw => typeof raw === "string" ? raw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "",
    z.string()
        .min(CONFIG.USERNAME_MIN_LENGTH, {
            message: `Username cannot be shorter than ${CONFIG.USERNAME_MIN_LENGTH} characters.`
        })
        .max(CONFIG.USERNAME_MAX_LENGTH, {
            message: `Username cannot be longer than ${CONFIG.USERNAME_MAX_LENGTH} characters.`
        })
);

/**
 * UniCourse Email.
 */
export const email = z.string()
    .max(CONFIG.EMAIL_MAX_LENGTH, {
        message: `Email cannot be longer than ${CONFIG.EMAIL_MAX_LENGTH} characters.`
    })
    .email({ message: "Email is invalid" });

/**
 * L1 hashed password.
 * Should be the result of SHA512 in hex.
 */
export const password = z.string()
    .regex(/^[a-f0-9]{128}$/, { message: "Invalid password format" })
    .length(128, { message: "Password should be hashed at client side first" });
