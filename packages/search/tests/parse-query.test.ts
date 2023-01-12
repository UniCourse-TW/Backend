import { parse_query } from "../src";

describe("parse query", () => {
    it("should recognize key:value", () => {
        const q = parse_query("foo:bar");
        expect(q.foo).toEqual(["bar"]);
    });

    it("should recognize key=value", () => {
        const q = parse_query("foo=bar");
        expect(q.foo).toEqual(["bar"]);
    });

    it("should recognize key:\"value with spaces\"", () => {
        const q = parse_query("foo:\"bar baz\"");
        expect(q.foo).toEqual(["bar baz"]);
    });

    it("should recognize key=\"value with spaces\"", () => {
        const q = parse_query("foo=\"bar baz\"");
        expect(q.foo).toEqual(["bar baz"]);
    });

    it("should collect wild value", () => {
        const q = parse_query("foo bar baz");
        expect(q._.sort()).toEqual(["foo", "bar", "baz"].sort());
    });

    it("should collect \"wild value with spaces\"", () => {
        const q = parse_query("foo \"bar baz\"");
        expect(q._.sort()).toEqual(["foo", "bar baz"].sort());
    });

    it("should escape `=` inside quotes", () => {
        const q = parse_query("\"foo=bar\"");
        expect(q).not.toHaveProperty("foo");
        expect(q._).toEqual(["foo=bar"]);
    });
});
