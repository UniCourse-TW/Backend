import * as auth from "./auth";
import * as search from "./search";
import * as post from "./post";
import * as safe from "./safe";

export * from "./auth";
export * from "./search";
export * from "./post";
export * from "./safe";
export const v = {
    ...auth,
    ...search,
    ...post,
    ...safe
};
