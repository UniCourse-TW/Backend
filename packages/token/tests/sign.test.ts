import { decode, sign } from "../src";

describe("sign", () => {
    test("accepted", () => {
        const token = {
            token: "cuid",
            user: "cuid-user",
            username: "username",
            expires: Math.floor(Date.now() / 1_000) + 60,
            traits: ["trait"]
        };

        const signed = sign(token);
        const decoded = decode(signed);

        expect(decoded).toEqual(token);
    });

    test("expired", () => {
        const token = {
            token: "cuid",
            user: "cuid-user",
            username: "username",
            expires: Math.floor(Date.now() / 1_000) - 1,
            traits: ["trait"]
        };

        expect(() => sign(token)).toThrow();
    });
});
