/**
 * A parser that parses the following grammar into a map of key-value pairs:
 * `key:value`, `key:"value with spaces"`, `key=value`, `key="value with spaces"`,
 * `wild_value`, `"wild value with spaces"`
 * @param q The query string
 */
export function parse_query(q: string): Record<string, string[]> {
    const regexp = /(?:[^"\s]+?[:=]("[^"]*"|[^"\s]+))|(?:"[^"]*")|(?:[^"\s]+)/g;
    const matches = q.match(regexp);

    if (matches === null) {
        return {};
    }

    const result: Record<string, string[]> = {};

    for (const match of matches) {
        if (/^["\s]/.test(match) && /["\s]$/.test(match)) {
            const stripped = match.replace(/^["\s]|["\s]$/g, "");

            if ("_" in result) {
                result._.push(stripped);
            } else {
                result._ = [stripped];
            }
        } else if (/[=:]/.test(match)) {
            const [key, value] = match.split(/[:=]/, 2);
            const stripped = value.replace(/^["\s]|["\s]$/g, "");

            if (key in result) {
                result[key].push(stripped);
            } else {
                result[key] = [stripped];
            }
        } else {
            const stripped = match.replace(/^["\s]|["\s]$/g, "");

            if ("_" in result) {
                result._.push(stripped);
            } else {
                result._ = [stripped];
            }
        }
    }

    return result;
}
