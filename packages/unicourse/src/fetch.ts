import _fetch from "cross-fetch";

// eslint-disable-next-line import/no-mutable-exports
let f = _fetch;

try {
    if (typeof window !== "undefined" && window.fetch) {
        f = window.fetch;
    }
} catch {}

export default f;
