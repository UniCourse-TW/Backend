import { SearchError, date2term, default_course_search } from "../src";

const [year, term] = date2term();

describe("search", () => {
    it("should throw error if empty", async () => {
        const q = "";
        expect(() => default_course_search(q)).toThrowError(SearchError);
    });

    it("should search by keyword", async () => {
        const q = "資料結構";
        const search = default_course_search(q);
        expect(search.where).toEqual({
            AND: [
                {
                    OR: [
                        { teachers: { some: { OR: [{ name: { contains: "資料結構" } }] } } },
                        { programs: { some: { OR: [{ name: { contains: "資料結構" } }] } } },
                        {
                            OR: [
                                { name: { contains: "資料結構" } }]
                        },
                        { code: { in: ["資料結構"] } }
                    ]
                }, {
                    OR: [
                        { year, term }
                    ]
                }]
        });
    });

    it("should search by teachers", async () => {
        const q = "t:紀博文";
        const search = default_course_search(q);
        expect(search.where).toEqual({
            AND: [
                {
                    OR: [
                        { teachers: { some: { OR: [{ name: { contains: "紀博文" } }] } } }
                    ]
                },
                {
                    OR: [
                        { year, term }
                    ]
                }
            ]
        });
    });

    it("should search by programs", async () => {
        const q = "p:科技";
        const search = default_course_search(q);
        expect(search.where).toEqual({
            AND: [
                {
                    OR: [
                        { programs: { some: { OR: [{ name: { contains: "科技" } }] } } }
                    ]
                },
                {
                    OR: [
                        { year, term }]
                }
            ]
        });
    });

    it("should search by providers", async () => {
        const q = "provider:資工系";
        const search = default_course_search(q);
        expect(search.where).toEqual({
            AND: [
                {
                    OR: [
                        { provider: { OR: [{ id: "資工系" }, { name: { contains: "資工系" } }] } }
                    ]
                },
                {
                    OR: [
                        { year, term }]
                }
            ]
        });
    });

    it("should search by terms", async () => {
        const q = "t:紀博文 term:110-2 term:111-1";
        const search = default_course_search(q);
        expect(search.where).toEqual({
            AND: [
                {
                    OR: [
                        { teachers: { some: { OR: [{ name: { contains: "紀博文" } }] } } }
                    ]
                },
                {
                    OR: [
                        { year: 110, term: 2 },
                        { year: 111, term: 1 }]
                }
            ]
        });
    });

    it("should sort by default (relevance)", async () => {
        const q = "程式設計";
        const search = default_course_search(q);
        expect(search.orderBy).toEqual([
            {
                _relevance: { fields: ["name", "description"], search: "程式設計", sort: "desc" }
            }
        ]);
    });

    it("should sort by name", async () => {
        const q = "程式設計 order:name";
        const search = default_course_search(q);
        expect(search.orderBy).toEqual([
            { name: "desc" }
        ]);
    });

    it("should sort by name (asc)", async () => {
        const q = "程式設計 order:name sort:asc";
        const search = default_course_search(q);
        expect(search.orderBy).toEqual([
            { name: "asc" }
        ]);
    });

    it("should sort by type", async () => {
        const q = "程式設計 order:type";
        const search = default_course_search(q);
        expect(search.orderBy).toEqual([
            { type: "desc" }
        ]);
    });

    it("should sort by program count", async () => {
        const q = "程式設計 order:programs";
        const search = default_course_search(q);
        expect(search.orderBy).toEqual([
            { programs: { _count: "desc" } }
        ]);
    });
});
