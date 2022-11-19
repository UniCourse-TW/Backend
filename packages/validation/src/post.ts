import { z } from "zod";
import { CONFIG } from "./config";

/**
 * Post.
 */
export const post = z.object({
    type: z.enum(CONFIG.POST_TYPE),
    title: z.string()
        .min(1, { message: "Title cannot be empty." })
        .max(CONFIG.POST_TITLE_MAX_LENGTH, {
            message: `Title cannot be longer than ${CONFIG.POST_TITLE_MAX_LENGTH} characters.`
        }),
    content: z.string()
        .min(CONFIG.POST_CONTENT_MIN_LENGTH, {
            message: `Content cannot be shorter than ${CONFIG.POST_CONTENT_MIN_LENGTH} characters.`
        })
        .max(CONFIG.POST_CONTENT_MAX_LENGTH, {
            message: `Content cannot be longer than ${CONFIG.POST_CONTENT_MAX_LENGTH} characters.`
        }),
    tags: z.array(
        z.string()
            .min(1, { message: "Tag cannot be empty." })
            .max(CONFIG.POST_TAG_MAX_LENGTH, {
                message: `Tag cannot be longer than ${CONFIG.POST_TAG_MAX_LENGTH} characters.`
            })
    ).max(CONFIG.POST_TAG_MAX_COUNT, {
        message: `Cannot have more than ${CONFIG.POST_TAG_MAX_COUNT} tags.`
    }),
    course: z.string().cuid().optional()
});
