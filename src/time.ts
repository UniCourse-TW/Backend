export class TimeRange {
    public start: number;
    public end: number;

    constructor(start: number, end: number);
    constructor(start: [number, number], end: [number, number]);
    constructor(start: number | [number, number], end: number | [number, number]) {
        if (Array.isArray(start) && Array.isArray(end)) {
            this.start = start[0] * (60 * 24) + start[1];
            this.end = end[0] * (60 * 24) + end[1];
        } else if (typeof start === "number" && typeof end === "number") {
            this.start = start;
            this.end = end;
        } else {
            throw new TypeError("Invalid arguments");
        }
    }

    public get code(): number {
        return this.start * 100_000 + this.end;
    }

    public in(range: TimeRange): boolean {
        return this.start >= range.start && this.end <= range.end;
    }
}
