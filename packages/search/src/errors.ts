export class SearchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SearchError";
    }
}
