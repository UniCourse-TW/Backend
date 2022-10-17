import { date2term } from "../src/utils";

describe("date2term", () => {
    test("2022/01", () => {
        expect(date2term(new Date(2022, 0))).toEqual([110, 1]);
    });

    test("2022/02", () => {
        expect(date2term(new Date(2022, 1))).toEqual([110, 2]);
    });

    test("2022/03", () => {
        expect(date2term(new Date(2022, 2))).toEqual([110, 2]);
    });

    test("2022/04", () => {
        expect(date2term(new Date(2022, 3))).toEqual([110, 2]);
    });

    test("2022/05", () => {
        expect(date2term(new Date(2022, 4))).toEqual([110, 2]);
    });

    test("2022/06", () => {
        expect(date2term(new Date(2022, 5))).toEqual([110, 2]);
    });

    test("2022/07", () => {
        expect(date2term(new Date(2022, 6))).toEqual([110, 2]);
    });

    test("2022/08", () => {
        expect(date2term(new Date(2022, 7))).toEqual([111, 1]);
    });

    test("2022/09", () => {
        expect(date2term(new Date(2022, 8))).toEqual([111, 1]);
    });

    test("2022/10", () => {
        expect(date2term(new Date(2022, 9))).toEqual([111, 1]);
    });

    test("2022/11", () => {
        expect(date2term(new Date(2022, 10))).toEqual([111, 1]);
    });

    test("2022/12", () => {
        expect(date2term(new Date(2022, 11))).toEqual([111, 1]);
    });
});
