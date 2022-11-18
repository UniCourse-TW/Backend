import { limit, offset, query } from "../src/search";
import { CONFIG } from "../src/config";

describe("search", () => {
    describe("query", () => {
        test("query cannot be empty", () => {
            expect(() => query.parse("")).toThrow();
        });

        test("query cannot be too long", () => {
            const result = query.parse("a".repeat(CONFIG.QUERY_MAX_LENGTH));
            expect(result).toEqual("a".repeat(CONFIG.QUERY_MAX_LENGTH));

            expect(() => query.parse("a".repeat(CONFIG.QUERY_MAX_LENGTH + 1))).toThrow();
        });
    });

    describe("limit", () => {
        test("default limit", () => {
            const result = limit.parse("");
            expect(result).toEqual(CONFIG.LIMIT_DEFAULT);
        });

        test("max limit", () => {
            const result = limit.parse(CONFIG.LIMIT_MAX.toString());
            expect(result).toEqual(CONFIG.LIMIT_MAX);

            expect(() => limit.parse((CONFIG.LIMIT_MAX + 1).toString())).toThrow();
        });
    });

    describe("offset", () => {
        test("default offset", () => {
            const result = offset.parse("");
            expect(result).toEqual(0);
        });
    });
});
