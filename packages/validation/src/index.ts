import * as config from "./config";
import * as auth from "./auth";
import * as search from "./search";
import * as post from "./post";
import * as safe from "./safe";

export * from "./config";
export * from "./auth";
export * from "./search";
export * from "./post";
export * from "./safe";
export const v = {
    ...config,
    ...auth,
    ...search,
    ...post,
    ...safe
};
