import type { PostType } from "@unicourse-tw/prisma";

/**
 * You can import `CONFIG` and edit the values programmatically.
 * Validation functions will use the new values.
 */
export const CONFIG = {
    USERNAME_MIN_LENGTH: 4,
    USERNAME_MAX_LENGTH: 64,
    EMAIL_MAX_LENGTH: 320,
    LIMIT_DEFAULT: 20,
    LIMIT_MAX: 100,
    QUERY_MAX_LENGTH: 256,
    POST_TYPE:
        ["Announcement", "Article", "Question", "Reply", "Other"] as [PostType, ...PostType[]],
    POST_USER_TYPE: ["Article", "Question", "Reply"] as [PostType, ...PostType[]],
    POST_TITLE_MAX_LENGTH: 128,
    POST_CONTENT_MIN_LENGTH: 10,
    POST_CONTENT_MAX_LENGTH: 256 * 1024,
    POST_TAG_MAX_LENGTH: 64,
    POST_TAG_MAX_COUNT: 10,
    SAFE_STRING_MAX_LENGTH: 1024
};
