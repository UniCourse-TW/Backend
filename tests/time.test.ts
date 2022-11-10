import { TimeRange } from "../src/time";

test("TimeRange", () => {
    const range = new TimeRange([0, 8 * 60], [0, 17 * 60]);
    expect(range.code).toBe(8 * 60 * 100_000 + 17 * 60);

    const inner_a = new TimeRange(8 * 60, 10 * 60);
    expect(inner_a.in(range)).toBe(true);
    expect(range.in(inner_a)).toBe(false);

    const inner_b = new TimeRange(16 * 60, 17 * 60);
    expect(inner_b.in(range)).toBe(true);
    expect(range.in(inner_b)).toBe(false);
});
